const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ProductListService {
  async create(data) {
    const { name, description, category_id } = data;
    const productList = await prisma.productList.create({
      data: {
        name,
        description,
        category_id: category_id ? parseInt(category_id) : undefined,
      },
      include: { category: true },
    });
    return productList;
  }

  async getAll(filters) {
    const { search, name, category_id, is_active, startDate, endDate, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (name) andConditions.push({ name: { contains: name } });
    if (category_id) andConditions.push({ category_id: parseInt(category_id) });
    if (is_active !== undefined && is_active !== "") andConditions.push({ is_active });
    if (search) andConditions.push({ OR: [{ name: { contains: search } }] });
    if (startDate || endDate) andConditions.push({ created_at: { gte: startDate ? new Date(startDate) : undefined, lte: endDate ? new Date(endDate + "T23:59:59") : undefined } });
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.productList.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: "desc" }, include: { category: true, items: true } }),
      prisma.productList.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id) {
    const data = await prisma.productList.findUnique({ where: { id: parseInt(id) }, include: { category: true, items: { include: { units: true } } } });
    if (!data) throw new Error("Product list not found");
    return { message: `${data.name} is here!`, data };
  }

  async update(id, updateData) {
    const existing = await prisma.productList.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw new Error("Product list not found");
    const { name, description, category_id, is_active } = updateData;
    const updated = await prisma.productList.update({
      where: { id: existing.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(category_id !== undefined && { category_id: category_id || null }),
        ...(is_active !== undefined && { is_active }),
      },
      include: { category: true },
    });
    return { updatedId: updated.id, message: "Product list updated successfully", data: updated };
  }

  async delete(id) {
    const updated = await prisma.productList.updateMany({ where: { id: parseInt(id), is_active: true }, data: { is_active: false } });
    if (updated.count === 0) throw new Error("Product list not found or already deactivated");
    return { deletedId: id, message: "Product list deactivated successfully" };
  }
}
module.exports = new ProductListService();
