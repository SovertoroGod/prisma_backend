const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();
const notificationService = require("./notification.service");

class StockTransferService {
  async initiate(data, requestingUser) {
    const { product_item_id, from_branch_id, to_branch_id, quantity, notes } = data;
    const parsedQty = parseInt(quantity);

    if (from_branch_id === to_branch_id) throw new Error("Source and destination branches must differ");

    const fromUnit = await prisma.productUnit.findUnique({
      where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: parseInt(from_branch_id) } },
    });
    if (!fromUnit) throw new Error("Source product unit not found");
    if (fromUnit.quantity < parsedQty) throw new Error("Insufficient stock in source branch");

    const toUnit = await prisma.productUnit.findUnique({
      where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: parseInt(to_branch_id) } },
    });

    const referenceId = crypto.randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      const updatedFrom = await tx.productUnit.update({
        where: { id: fromUnit.id },
        data: { quantity: { decrement: parsedQty } },
      });

      const stockTransfer = await tx.stockTransfer.create({
        data: {
          product_item_id: parseInt(product_item_id),
          from_branch_id: parseInt(from_branch_id),
          to_branch_id: parseInt(to_branch_id),
          quantity: parsedQty,
          notes: notes || null,
          created_by: requestingUser.id,
        },
        include: {
          from_branch: true,
          to_branch: true,
          product_item: true,
          creator: { select: { id: true, full_name: true, username: true } },
        },
      });

      const destUnit = toUnit || await tx.productUnit.upsert({
        where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: parseInt(to_branch_id) } },
        create: {
          product_item_id: parseInt(product_item_id),
          branch_id: parseInt(to_branch_id),
          quantity: 0,
        },
        update: {},
      });

      const toPreviousQty = toUnit ? toUnit.quantity : 0;

      await tx.productUnitLog.create({
        data: {
          product_unit_id: fromUnit.id,
          from_branch_id: parseInt(from_branch_id),
          to_branch_id: parseInt(to_branch_id),
          previous_qty: fromUnit.quantity,
          current_qty: updatedFrom.quantity,
          quantity: parsedQty,
          type: "transfer_out",
          reference_id: referenceId,
          notes: notes || null,
          created_by: requestingUser.id,
        },
      });

      await tx.productUnitLog.create({
        data: {
          product_unit_id: destUnit.id,
          from_branch_id: parseInt(from_branch_id),
          to_branch_id: parseInt(to_branch_id),
          previous_qty: toPreviousQty,
          current_qty: toPreviousQty,
          quantity: parsedQty,
          type: "transfer_in",
          reference_id: referenceId,
          notes: notes || null,
          created_by: requestingUser.id,
        },
      });

      return { stockTransfer, updatedFrom };
    });

    const recipients = await prisma.user.findMany({
      where: {
        OR: [
          { role: "admin", is_active: true },
          { role: "manager", branch_id: parseInt(to_branch_id), is_active: true },
        ],
      },
      select: { id: true },
    });

    await notificationService.createForUsers(
      recipients.map((u) => u.id),
      {
        type: "transfer_request",
        title: "Stock Transfer Request",
        message: `Stock transfer of ${parsedQty} units from ${result.stockTransfer.from_branch.branch_name} to ${result.stockTransfer.to_branch.branch_name}`,
        reference_id: String(result.stockTransfer.id),
      },
    );

    return result.stockTransfer;
  }

  async getAll(filters) {
    const { status, from_branch_id, to_branch_id, startDate, endDate, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (status) andConditions.push({ status });
    if (from_branch_id) andConditions.push({ from_branch_id: parseInt(from_branch_id) });
    if (to_branch_id) andConditions.push({ to_branch_id: parseInt(to_branch_id) });
    if (startDate || endDate) andConditions.push({ created_at: { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate + "T23:59:59") : undefined } });
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.stockTransfer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: {
          from_branch: true,
          to_branch: true,
          product_item: true,
          creator: { select: { id: true, full_name: true, username: true } },
        },
      }),
      prisma.stockTransfer.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id) {
    const data = await prisma.stockTransfer.findUnique({
      where: { id: parseInt(id) },
      include: {
        from_branch: true,
        to_branch: true,
        product_item: true,
        creator: { select: { id: true, full_name: true, username: true } },
      },
    });
    if (!data) throw new Error("Stock transfer not found");
    return { message: "Stock transfer retrieved successfully", data };
  }

  async cancel(id, requestingUser) {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: parseInt(id) },
      include: { from_branch: true, to_branch: true, product_item: true },
    });
    if (!transfer) throw new Error("Stock transfer not found");
    if (transfer.status !== "pending") throw new Error("Only pending transfers can be cancelled");

    const result = await prisma.$transaction(async (tx) => {
      const fromUnit = await tx.productUnit.findUnique({
        where: { product_item_id_branch_id: { product_item_id: transfer.product_item_id, branch_id: transfer.from_branch_id } },
      });
      if (!fromUnit) throw new Error("Source product unit not found");

      const updatedFrom = await tx.productUnit.update({
        where: { id: fromUnit.id },
        data: { quantity: { increment: transfer.quantity } },
      });

      const updatedTransfer = await tx.stockTransfer.update({
        where: { id: transfer.id },
        data: { status: "cancelled" },
      });

      await tx.productUnitLog.create({
        data: {
          product_unit_id: fromUnit.id,
          from_branch_id: transfer.from_branch_id,
          to_branch_id: null,
          previous_qty: fromUnit.quantity,
          current_qty: updatedFrom.quantity,
          quantity: transfer.quantity,
          type: "adjustment",
          reference_id: `cancel-transfer-${transfer.id}`,
          notes: `Cancelled stock transfer #${transfer.id} - quantity restored`,
          created_by: requestingUser.id,
        },
      });

      return { updatedTransfer, updatedFrom };
    });

    const recipients = await prisma.user.findMany({
      where: {
        OR: [
          { role: "admin", is_active: true },
          { role: "manager", branch_id: transfer.to_branch_id, is_active: true },
        ],
      },
      select: { id: true },
    });

    await notificationService.createForUsers(
      recipients.map((u) => u.id),
      {
        type: "transfer_cancelled",
        title: "Stock Transfer Cancelled",
        message: `Stock transfer #${transfer.id} of ${transfer.quantity} units from ${transfer.from_branch.branch_name} to ${transfer.to_branch.branch_name} has been cancelled`,
        reference_id: String(transfer.id),
      },
    );

    return result.updatedTransfer;
  }

  async receive(id, requestingUser) {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: parseInt(id) },
      include: { from_branch: true, to_branch: true, product_item: true },
    });
    if (!transfer) throw new Error("Stock transfer not found");
    if (transfer.status !== "pending") throw new Error("Only pending transfers can be received");

    if (requestingUser.role !== "admin" && requestingUser.branch_id !== transfer.to_branch_id) {
      throw new Error("Unauthorized. Only admins or destination branch managers can receive transfers");
    }

    const result = await prisma.$transaction(async (tx) => {
      const destUnit = await tx.productUnit.findUnique({
        where: { product_item_id_branch_id: { product_item_id: transfer.product_item_id, branch_id: transfer.to_branch_id } },
      });
      if (!destUnit) throw new Error("Destination product unit not found");

      const updatedDest = await tx.productUnit.update({
        where: { id: destUnit.id },
        data: { quantity: { increment: transfer.quantity } },
      });

      const updatedTransfer = await tx.stockTransfer.update({
        where: { id: transfer.id },
        data: { status: "completed" },
      });

      await tx.productUnitLog.create({
        data: {
          product_unit_id: destUnit.id,
          from_branch_id: transfer.from_branch_id,
          to_branch_id: transfer.to_branch_id,
          previous_qty: destUnit.quantity,
          current_qty: updatedDest.quantity,
          quantity: transfer.quantity,
          type: "transfer_in",
          reference_id: `receive-transfer-${transfer.id}`,
          notes: `Stock transfer #${transfer.id} received - quantity added to destination`,
          created_by: requestingUser.id,
        },
      });

      return { updatedTransfer, updatedDest };
    });

    const recipients = await prisma.user.findMany({
      where: {
        OR: [
          { role: "admin", is_active: true },
          { role: "manager", branch_id: transfer.from_branch_id, is_active: true },
        ],
      },
      select: { id: true },
    });

    await notificationService.createForUsers(
      recipients.map((u) => u.id),
      {
        type: "transfer_received",
        title: "Stock Transfer Received",
        message: `Stock transfer #${transfer.id} of ${transfer.quantity} units from ${transfer.from_branch.branch_name} to ${transfer.to_branch.branch_name} has been received`,
        reference_id: String(transfer.id),
      },
    );

    return result.updatedTransfer;
  }
}

module.exports = new StockTransferService();
