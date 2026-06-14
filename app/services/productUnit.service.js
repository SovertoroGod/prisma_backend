const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const productUnitLogService = require("./productUnitLog.service");

const ProductUnitLogType = {
  initial: "initial",
  adjustment: "adjustment",
};

class ProductUnitService {
  async create(data, userId) {
    const { product_item_id, branch_id, quantity = 0 } = data;
    const existing = await prisma.productUnit.findUnique({
      where: { product_item_id_branch_id: { product_item_id: parseInt(product_item_id), branch_id: parseInt(branch_id) } },
    });
    if (existing) throw new Error("Product unit already exists for this item and branch");
    const productUnit = await prisma.productUnit.create({
      data: { product_item_id: parseInt(product_item_id), branch_id: parseInt(branch_id), quantity: parseInt(quantity) },
      include: { product_item: true, branch: true },
    });

    await productUnitLogService.createLog({
      product_unit_id: productUnit.id,
      quantity: parseInt(quantity),
      previous_qty: 0,
      current_qty: productUnit.quantity,
      type: ProductUnitLogType.initial,
      created_by: userId,
    });

    return productUnit;
  }

  async getAll(filters) {
    const { product_item_id, branch_id, is_active, startDate, endDate, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (product_item_id) andConditions.push({ product_item_id: parseInt(product_item_id) });
    if (branch_id) andConditions.push({ branch_id: parseInt(branch_id) });
    if (is_active !== undefined && is_active !== "") andConditions.push({ is_active: is_active === "true" });
    if (startDate || endDate) andConditions.push({ created_at: { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate + "T23:59:59") : undefined } });
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.productUnit.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: { product_item: { include: { product_list: { include: { category: true } } } }, branch: true },
      }),
      prisma.productUnit.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id) {
    const data = await prisma.productUnit.findUnique({
      where: { id: parseInt(id) },
      include: { product_item: { include: { product_list: true } }, branch: true },
    });
    if (!data) throw new Error("Product unit not found");
    return { message: "Product unit is here!", data };
  }

  async update(id, updateData, userId) {
    const existing = await prisma.productUnit.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw new Error("Product unit not found");
    const { quantity, product_item_id, branch_id, is_active } = updateData;
    const updated = await prisma.productUnit.update({
      where: { id: existing.id },
      data: {
        ...(quantity !== undefined && { quantity: parseInt(quantity) }),
        ...(product_item_id !== undefined && { product_item_id: parseInt(product_item_id) }),
        ...(branch_id !== undefined && { branch_id: parseInt(branch_id) }),
        ...(is_active !== undefined && { is_active }),
      },
      include: { product_item: true, branch: true },
    });

    if (quantity !== undefined) {
      await productUnitLogService.createLog({
        product_unit_id: updated.id,
        quantity: parseInt(quantity),
        previous_qty: existing.quantity,
        current_qty: updated.quantity,
        type: ProductUnitLogType.adjustment,
        created_by: userId,
      });
    }

    return { updatedId: updated.id, message: "Product unit updated successfully", data: updated };
  }

  async delete(id) {
    const updated = await prisma.productUnit.updateMany({ where: { id: parseInt(id), is_active: true }, data: { is_active: false } });
    if (updated.count === 0) throw new Error("Product unit not found or already deactivated");
    return { deletedId: id, message: "Product unit deactivated successfully" };
  }
}
module.exports = new ProductUnitService();
