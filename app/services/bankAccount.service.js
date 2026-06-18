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
    const { is_active, account_name, page = 1, limit = 10 } = filters;
    const andConditions = [];
    if (is_active !== undefined && is_active !== "") {
      andConditions.push({ is_active });
    }
    if (account_name) {
      andConditions.push({
        OR: [
          { account_name: { contains: account_name } },
          { bank_name: { contains: account_name } },
        ],
      });
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

  async getHistory(id, filters) {
    const { page = 1, limit = 10, startDate, endDate } = filters;
    const parsedId = parseInt(id);

    const account = await prisma.bankAccount.findUnique({ where: { id: parsedId } });
    if (!account) throw new Error("Bank account not found");

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.created_at = {};
      if (startDate) dateFilter.created_at.gte = new Date(startDate);
      if (endDate) dateFilter.created_at.lte = new Date(endDate + "T23:59:59.999Z");
    }

    const [vouchers, repayments] = await Promise.all([
      prisma.voucher.findMany({
        where: { bank_account_id: parsedId, ...dateFilter },
        include: {
          branch: { select: { branch_name: true } },
          customer: { select: { name: true } },
        },
      }),
      prisma.repayment.findMany({
        where: { bank_account_id: parsedId, ...dateFilter },
        include: {
          debt: { include: { customer: { select: { name: true } } } },
        },
      }),
    ]);

    const transactions = [
      ...vouchers.map((v) => ({
        id: v.id,
        type: "voucher",
        reference: v.code,
        customer: v.customer?.name || "Walk-in",
        branch: v.branch?.branch_name || null,
        amount: parseFloat(v.amount_paid),
        description: `Sale - ${v.code}`,
        created_at: v.created_at,
      })),
      ...repayments.map((r) => ({
        id: r.id,
        type: "repayment",
        reference: `DEBT-${r.debt_id}`,
        customer: r.debt?.customer?.name || "N/A",
        branch: null,
        amount: parseFloat(r.amount),
        description: r.notes || "Debt repayment",
        created_at: r.created_at,
      })),
    ].sort((a, b) => b.created_at - a.created_at);

    transactions.reverse();
    let running = 0;
    transactions.forEach((tx) => {
      running += tx.amount;
      tx.balance = running;
    });
    transactions.reverse();

    const aggregates = {};
    transactions.forEach((tx) => {
      const d = new Date(tx.created_at);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const dayKey = `${monthKey}-${String(d.getDate()).padStart(2, "0")}`;
      if (!aggregates[monthKey]) aggregates[monthKey] = { total: 0, count: 0, days: {} };
      aggregates[monthKey].total += tx.amount;
      aggregates[monthKey].count++;
      if (!aggregates[monthKey].days[dayKey]) aggregates[monthKey].days[dayKey] = { total: 0, count: 0 };
      aggregates[monthKey].days[dayKey].total += tx.amount;
      aggregates[monthKey].days[dayKey].count++;
    });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginated = transactions.slice(skip, skip + parseInt(limit));
    const total = transactions.length;

    return {
      account,
      aggregates: Object.entries(aggregates)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, data]) => ({ month, ...data })),
      data: paginated,
      metadata: {
        totalItems: total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    };
  }
}

module.exports = new BankAccountService();
