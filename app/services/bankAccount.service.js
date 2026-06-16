const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class BankAccountService {
  async create(data) {
    const { account_name, account_number, bank_name } = data;
    const account = await prisma.bankAccount.create({
      data: { account_name, account_number, bank_name },
    });
    return account;
  }

  async getAll(filters) {
    const { is_active, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (is_active !== undefined && is_active !== "") {
      andConditions.push({ is_active: is_active === "true" });
    }
    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.bankAccount.findMany({ where, skip, take: parseInt(limit), orderBy: { created_at: "desc" } }),
      prisma.bankAccount.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id) {
    const account = await prisma.bankAccount.findUnique({ where: { id: parseInt(id) } });
    if (!account) throw new Error("Bank account not found");
    return { message: `${account.account_name} is here!`, data: account };
  }

  async update(id, updateData) {
    const existing = await prisma.bankAccount.findUnique({ where: { id: parseInt(id) } });
    if (!existing) throw new Error("Bank account not found");
    const { account_name, account_number, bank_name, is_active } = updateData;
    const updated = await prisma.bankAccount.update({
      where: { id: existing.id },
      data: {
        ...(account_name !== undefined && { account_name }),
        ...(account_number !== undefined && { account_number }),
        ...(bank_name !== undefined && { bank_name }),
        ...(is_active !== undefined && { is_active }),
      },
    });
    return { updatedId: updated.id, message: "Bank account updated successfully", data: updated };
  }

  async listActive() {
    const accounts = await prisma.bankAccount.findMany({
      where: { is_active: true },
      orderBy: { account_name: "asc" },
    });
    return accounts;
  }
}

module.exports = new BankAccountService();
