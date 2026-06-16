const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class CustomerService {
  async create(data) {
    const { name, phone } = data;
    const existing = await prisma.customer.findFirst({ where: { name, phone } });
    if (existing) return existing;
    const customer = await prisma.customer.create({ data: { name, phone } });
    return customer;
  }

  async search(query) {
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      orderBy: { created_at: "desc" },
      take: 20,
    });
    return customers;
  }

  async findByPhone(phone) {
    const customers = await prisma.customer.findMany({
      where: { phone: { contains: phone } },
      orderBy: { created_at: "desc" },
      take: 10,
    });
    return customers;
  }

  async getAll(filters) {
    const { phone, name, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (phone) andConditions.push({ phone: { contains: phone } });
    if (name) andConditions.push({ name: { contains: name } });
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.customer.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: "desc" } }),
      prisma.customer.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }
}

module.exports = new CustomerService();
