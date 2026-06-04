const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProductItemService {
  async create(data) {
    const { product_list_id, sku, name, price } = data;
    const productItem = await prisma.productItem.create({
      data: { product_list_id: parseInt(product_list_id), sku, name, price },
      include: { product_list: true },
    });
    return productItem;
  }

  async getAll(filters) {
    const { search, sku, name, product_list_id, is_active, startDate, endDate, page = 1, limit = 10 } = filters;
    console.log("product-list", product_list_id)
    const andConditions = [];
    if (name) andConditions.push({ name: { contains: name } });
    if (sku) andConditions.push({ sku: { contains: sku } });
    if (product_list_id) andConditions.push({ product_list_id: parseInt(product_list_id) });
    if (is_active !== undefined && is_active !== "") andConditions.push({ is_active: is_active === "true" });
    if (search) andConditions.push({ OR: [{ name: { contains: search } }, { sku: { contains: search } }] });
    if (startDate || endDate) andConditions.push({ created_at: { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate + "T23:59:59") : undefined } });
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    console.log("where", where);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.productItem.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: "desc" }, include: { product_list: true } }),
      prisma.productItem.count({ where }),
    ]);
    console.log("data", data);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id) {
    const data = await prisma.productItem.findUnique({
      where: { id: parseInt(id) },
      include: { product_list: { include: { category: true } }, units: { include: { branch: true } } },
    });
    if (!data) throw new Error("Product item not found");
    return { message: `${data.name} is here!`, data };
  }

  async update(id, updateData) {
    const existing = await prisma.productItem.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw new Error("Product item not found");
    const { sku, name, price, product_list_id, is_active } = updateData;
    if (sku && sku !== existing.sku) {
      const skuCheck = await prisma.productItem.findUnique({ where: { sku } });
      if (skuCheck) throw new Error("SKU already exists");
    }
    const updated = await prisma.productItem.update({
      where: { id: existing.id },
      data: {
        ...(sku !== undefined && { sku }),
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(product_list_id !== undefined && { product_list_id: parseInt(product_list_id) }),
        ...(is_active !== undefined && { is_active }),
      },
      include: { product_list: true },
    });
    return { updatedId: updated.id, message: "Product item updated successfully", data: updated };
  }

  async delete(id) {
    const updated = await prisma.productItem.updateMany({ where: { id: parseInt(id), is_active: true }, data: { is_active: false } });
    if (updated.count === 0) throw new Error("Product item not found or already deactivated");
    return { deletedId: id, message: "Product item deactivated successfully" };
  }
}
module.exports = new ProductItemService();
