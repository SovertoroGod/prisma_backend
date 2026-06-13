const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const notificationService = require("./notification.service");

class IssueItemService {
  async create(data, requestingUser) {
    const { product_item_id, quantity, notes } = data;
    const parsedQty = parseInt(quantity);

    const hoBranch = await prisma.branch.findUnique({ where: { branch_code: "HO1" } });
    if (!hoBranch) throw new Error("Head office branch (HO1) not found");

    const sourceBranchId = requestingUser.role === "admin" && data.from_branch_id
      ? parseInt(data.from_branch_id)
      : requestingUser.branch_id;
    if (!sourceBranchId) throw new Error("Source branch not determined");

    const fromUnit = await prisma.productUnit.findUnique({
      where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: sourceBranchId } },
      include: { product_item: true },
    });
    if (!fromUnit) throw new Error("Product unit not found in your branch");
    if (fromUnit.quantity < parsedQty) throw new Error("Insufficient stock");

    const result = await prisma.$transaction(async (tx) => {
      const updatedFrom = await tx.productUnit.update({
        where: { id: fromUnit.id },
        data: { quantity: { decrement: parsedQty } },
      });

      const log = await tx.productUnitLog.create({
        data: {
          product_unit_id: fromUnit.id,
          from_branch_id: sourceBranchId,
          to_branch_id: hoBranch.id,
          previous_qty: fromUnit.quantity,
          current_qty: updatedFrom.quantity,
          quantity: parsedQty,
          type: "issue",
          reference_id: `issue-${Date.now()}`,
          notes: notes || "Issued to Head Office",
          created_by: requestingUser.id,
        },
      });

      const issueItem = await tx.issueItem.create({
        data: {
          product_item_id: parseInt(product_item_id),
          from_branch_id: sourceBranchId,
          quantity: parsedQty,
          notes: notes || null,
          created_by: requestingUser.id,
        },
        include: {
          product_item: true,
          from_branch: true,
          creator: { select: { id: true, full_name: true, username: true } },
        },
      });

      return { issueItem, log, updatedFrom };
    });

    const admins = await prisma.user.findMany({
      where: { role: "admin", is_active: true },
      select: { id: true },
    });

    if (admins.length > 0) {
      await notificationService.createForUsers(
        admins.map((u) => u.id),
        {
          type: "stock_issue",
          title: "Stock Issued to Head Office",
          message: `${parsedQty} units of ${fromUnit.product_item.name} issued from ${result.issueItem.from_branch.branch_name} to Head Office`,
          reference_id: String(result.issueItem.id),
        },
        sourceBranchId,
      );
    }

    return result.issueItem;
  }

  async getAll(filters) {
    const { page = 1, limit = 10, from_branch_id, product_item_id, startDate, endDate } = filters;
    const andConditions = [];
    if (from_branch_id) andConditions.push({ from_branch_id: parseInt(from_branch_id) });
    if (product_item_id) andConditions.push({ product_item_id: parseInt(product_item_id) });
    if (startDate || endDate) andConditions.push({ created_at: { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate + "T23:59:59") : undefined } });
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.issueItem.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: {
          product_item: { include: { product_list: true } },
          from_branch: true,
          creator: { select: { id: true, full_name: true, username: true } },
        },
      }),
      prisma.issueItem.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id) {
    const data = await prisma.issueItem.findUnique({
      where: { id: parseInt(id) },
      include: {
        product_item: { include: { product_list: true } },
        from_branch: true,
        creator: { select: { id: true, full_name: true, username: true } },
      },
    });
    if (!data) throw new Error("Issue item not found");
    return { message: "Issue item retrieved successfully", data };
  }
}

module.exports = new IssueItemService();
