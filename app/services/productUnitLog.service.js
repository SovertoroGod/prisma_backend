const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const prisma = new PrismaClient();

const ProductUnitLogType = {
  initial: "initial",
  transfer_out: "transfer_out",
  transfer_in: "transfer_in",
  sold: "sold",
  issue: "issue",
  adjustment: "adjustment",
  return: "return",
};

const shouldRetryWithoutQtyFields = (error) => {
  const message = String(error?.message || "");
  return (
    message.includes("Unknown argument `previous_qty`") ||
    message.includes("Unknown argument `current_qty`") ||
    message.includes("Unknown column") ||
    message.includes("previous_qty") ||
    message.includes("current_qty")
  );
};

class ProductUnitLogService {
  async createLog(data) {
    const { product_unit_id, from_branch_id, to_branch_id, quantity, type, reference_id, notes, created_by, previous_qty, current_qty } = data;
    const parsedProductUnitId = parseInt(product_unit_id);

    let resolvedPreviousQty = previous_qty;
    let resolvedCurrentQty = current_qty;

    const isMissingQty =
      resolvedPreviousQty === undefined ||
      resolvedPreviousQty === null ||
      resolvedPreviousQty === "" ||
      resolvedCurrentQty === undefined ||
      resolvedCurrentQty === null ||
      resolvedCurrentQty === "";

    if (isMissingQty) {
      const unit = await prisma.productUnit.findUnique({
        where: { id: parsedProductUnitId },
        select: { quantity: true },
      });
      const fallbackQty = unit ? unit.quantity : 0;
      if (resolvedPreviousQty === undefined || resolvedPreviousQty === null || resolvedPreviousQty === "") resolvedPreviousQty = fallbackQty;
      if (resolvedCurrentQty === undefined || resolvedCurrentQty === null || resolvedCurrentQty === "") resolvedCurrentQty = fallbackQty;
    }

    const include = {
      product_unit: { include: { product_item: true, branch: true } },
      from_branch: true,
      to_branch: true,
      creator: { select: { id: true, full_name: true, username: true } },
    };

    const baseData = {
      product_unit_id: parsedProductUnitId,
      from_branch_id: from_branch_id ? parseInt(from_branch_id) : null,
      to_branch_id: to_branch_id ? parseInt(to_branch_id) : null,
      quantity: parseInt(quantity),
      type,
      reference_id: reference_id || null,
      notes: notes || null,
      created_by: created_by ? parseInt(created_by) : null,
    };

    try {
      return await prisma.productUnitLog.create({
        data: {
          ...baseData,
          previous_qty: parseInt(resolvedPreviousQty),
          current_qty: parseInt(resolvedCurrentQty),
        },
        include,
      });
    } catch (error) {
      if (!shouldRetryWithoutQtyFields(error)) throw error;
      return await prisma.productUnitLog.create({ data: baseData, include });
    }
  }

  async transferStock(data, userId) {
    const { product_item_id, from_branch_id, to_branch_id, quantity, notes } = data;
    const parsedQty = parseInt(quantity);

    if (parsedQty <= 0) throw new Error("Quantity must be positive");

    const fromUnit = await prisma.productUnit.findUnique({
      where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: parseInt(from_branch_id) } },
    });
    if (!fromUnit) throw new Error("Source product unit not found");
    if (fromUnit.quantity < parsedQty) throw new Error("Insufficient stock in source branch");

    const toUnit = await prisma.productUnit.findUnique({
      where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: parseInt(to_branch_id) } },
    });

    const referenceId = crypto.randomUUID();

    const [updatedFrom, updatedTo] = await prisma.$transaction(async (tx) => {
      const from = await tx.productUnit.update({
        where: { id: fromUnit.id },
        data: { quantity: { decrement: parsedQty } },
      });

      const to = await tx.productUnit.upsert({
        where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: parseInt(to_branch_id) } },
        create: {
          product_item_id: parseInt(product_item_id),
          branch_id: parseInt(to_branch_id),
          quantity: parsedQty,
        },
        update: { quantity: { increment: parsedQty } },
      });

      const toPreviousQty = toUnit ? toUnit.quantity : 0;

      const logsWithQty = [
        {
          product_unit_id: from.id,
          from_branch_id: parseInt(from_branch_id),
          to_branch_id: parseInt(to_branch_id),
          previous_qty: fromUnit.quantity,
          current_qty: from.quantity,
          quantity: parsedQty,
          type: ProductUnitLogType.transfer_out,
          reference_id: referenceId,
          notes: notes || null,
          created_by: userId ? parseInt(userId) : null,
        },
        {
          product_unit_id: to.id,
          from_branch_id: parseInt(from_branch_id),
          to_branch_id: parseInt(to_branch_id),
          previous_qty: toPreviousQty,
          current_qty: to.quantity,
          quantity: parsedQty,
          type: ProductUnitLogType.transfer_in,
          reference_id: referenceId,
          notes: notes || null,
          created_by: userId ? parseInt(userId) : null,
        },
      ];

      try {
        await tx.productUnitLog.createMany({ data: logsWithQty });
      } catch (error) {
        if (!shouldRetryWithoutQtyFields(error)) throw error;
        const logsWithoutQty = logsWithQty.map(({ previous_qty, current_qty, ...rest }) => rest);
        await tx.productUnitLog.createMany({ data: logsWithoutQty });
      }

      return [from, to];
    });

    const logs = await prisma.productUnitLog.findMany({
      where: { reference_id: referenceId },
      include: {
        product_unit: { include: { product_item: true, branch: true } },
        from_branch: true,
        to_branch: true,
      },
      orderBy: { created_at: "asc" },
    });

    return { reference_id: referenceId, logs, from_unit: updatedFrom, to_unit: updatedTo };
  }

  async getAll(filters) {
    const { product_unit_id, type, from_branch_id, to_branch_id, created_by, startDate, endDate, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (product_unit_id) andConditions.push({ product_unit_id: parseInt(product_unit_id) });
    if (type) andConditions.push({ type });
    if (from_branch_id) andConditions.push({ from_branch_id: parseInt(from_branch_id) });
    if (to_branch_id) andConditions.push({ to_branch_id: parseInt(to_branch_id) });
    if (created_by) andConditions.push({ created_by: parseInt(created_by) });
    if (startDate || endDate) andConditions.push({ created_at: { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate + "T23:59:59") : undefined } });
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.productUnitLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: {
          product_unit: { include: { product_item: { include: { product_list: true } }, branch: true } },
          from_branch: true,
          to_branch: true,
          creator: { select: { id: true, full_name: true, username: true } },
        },
      }),
      prisma.productUnitLog.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id) {
    const data = await prisma.productUnitLog.findUnique({
      where: { id: parseInt(id) },
      include: {
        product_unit: { include: { product_item: { include: { product_list: true } }, branch: true } },
        from_branch: true,
        to_branch: true,
        creator: { select: { id: true, full_name: true, username: true } },
      },
    });
    if (!data) throw new Error("Product unit log not found");
    return { message: "Product unit log is here!", data };
  }
}

module.exports = new ProductUnitLogService();
