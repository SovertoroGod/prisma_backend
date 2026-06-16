const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class DebtService {
  async getAll(filters, branchId) {
    const { page = 1, limit = 10, status, customer_id } = filters;
    const andConditions = [];

    andConditions.push({
      voucher: { branch_id: branchId },
    });

    if (status) {
      andConditions.push({ status });
    }
    if (customer_id) {
      andConditions.push({ customer_id: parseInt(customer_id) });
    }

    const where = { AND: andConditions };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [data, total] = await Promise.all([
      prisma.debt.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: {
          customer: true,
          voucher: { select: { code: true, grand_total: true, created_at: true } },
        },
      }),
      prisma.debt.count({ where }),
    ]);

    return {
      metadata: {
        totalItems: total,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
      data,
    };
  }

  async getById(id, branchId) {
    const debt = await prisma.debt.findFirst({
      where: { id: parseInt(id), voucher: { branch_id: branchId } },
      include: {
        customer: true,
        voucher: {
          include: { items: true, cashier: { select: { full_name: true } } },
        },
        repayments: {
          orderBy: { created_at: "desc" },
          include: { bank_account: true },
        },
      },
    });
    if (!debt) throw new Error("Debt not found");
    return { data: debt };
  }

  async repay(debtId, data, userId, branchId) {
    const { amount, payment_type, bank_account_id, notes } = data;

    const debt = await prisma.debt.findFirst({
      where: { id: parseInt(debtId), voucher: { branch_id: branchId } },
    });
    if (!debt) throw new Error("Debt not found");
    if (debt.status !== "pending") throw new Error("Debt is already " + debt.status);

    const paidAmount = parseFloat(amount);
    if (paidAmount <= 0) throw new Error("Amount must be positive");
    if (paidAmount > Number(debt.remaining_amount)) {
      throw new Error(
        `Amount $${paidAmount.toFixed(2)} exceeds remaining debt $${Number(debt.remaining_amount).toFixed(2)}`
      );
    }

    const newPaidAmount = Number(debt.paid_amount) + paidAmount;
    const newRemaining = Number(debt.remaining_amount) - paidAmount;
    const newStatus = newRemaining <= 0 ? "paid" : "pending";

    const result = await prisma.$transaction(async (tx) => {
      const repayment = await tx.repayment.create({
        data: {
          debt_id: debt.id,
          amount: paidAmount,
          payment_type,
          bank_account_id: payment_type === "bank" ? bank_account_id : null,
          notes: notes || null,
        },
      });

      await tx.debt.update({
        where: { id: debt.id },
        data: {
          paid_amount: newPaidAmount,
          remaining_amount: newRemaining,
          status: newStatus,
        },
      });

      return repayment;
    });

    return result;
  }
}

module.exports = new DebtService();
