const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class VoucherService {
  async create(data, userId, branchId) {
    const {
      customer_id,
      purchase_type,
      bank_account_id,
      items,
      voucher_discount_type,
      voucher_discount_value = 0,
      amount_paid = 0,
    } = data;

    const parsedItems = typeof items === "string" ? JSON.parse(items) : items;

    const itemDetails = await Promise.all(
      parsedItems.map(async (item) => {
        const productItem = await prisma.productItem.findUnique({
          where: { id: item.product_item_id, is_active: true },
        });
        if (!productItem) {
          throw new Error(`Product item with id ${item.product_item_id} not found or inactive`);
        }

        const productUnit = await prisma.productUnit.findUnique({
          where: {
            product_item_id_branch_id: {
              product_item_id: item.product_item_id,
              branch_id: branchId,
            },
          },
        });
        if (!productUnit || productUnit.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${productItem.name}. Available: ${productUnit ? productUnit.quantity : 0}, requested: ${item.quantity}`);
        }

        const subtotal = Number(productItem.price) * item.quantity;
        const discountType = item.discount_type || "fixed";
        const discountValue = item.discount_value || 0;
        const discount = discountType === "percent"
          ? Math.min(subtotal, subtotal * (Math.min(discountValue, 100) / 100))
          : Math.min(subtotal, discountValue);
        const lineTotal = subtotal - discount;

        return {
          product_item_id: productItem.id,
          product_name: productItem.name,
          sku: productItem.sku,
          price: productItem.price,
          quantity: item.quantity,
          discount_type: discountType,
          discount_value: discount,
          line_total: lineTotal,
          productUnitId: productUnit.id,
          previousQty: productUnit.quantity,
        };
      })
    );

    const subtotal = itemDetails.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const totalItemDiscount = itemDetails.reduce((sum, item) => sum + item.discount_value, 0);
    const afterItemDiscount = subtotal - totalItemDiscount;
    const voucherDiscount = voucher_discount_type === "percent"
      ? afterItemDiscount * (Math.min(voucher_discount_value || 0, 100) / 100)
      : Math.min(voucher_discount_value || 0, afterItemDiscount);
    const grandTotal = afterItemDiscount - voucherDiscount;
    const paidAmount = Number(amount_paid) || 0;
    const changeAmount = Math.max(0, paidAmount - grandTotal);
    const needsDebt = paidAmount < grandTotal;
    const debtAmount = needsDebt ? grandTotal - paidAmount : 0;

    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const code = `VCP-${branch.branch_code}-${dateStr}-${randomStr}`;

    const voucher = await prisma.$transaction(async (tx) => {
      const created = await tx.voucher.create({
        data: {
          code,
          customer_id: customer_id || null,
          cashier_id: userId,
          branch_id: branchId,
          subtotal,
          total_item_discount: totalItemDiscount,
          voucher_discount: voucherDiscount,
          voucher_discount_type: voucher_discount_type || null,
          grand_total: grandTotal,
          amount_paid: paidAmount,
          change_amount: changeAmount,
          purchase_type,
          bank_account_id: purchase_type === "bank" ? bank_account_id : null,
          items: {
            create: itemDetails.map((item) => ({
              product_item_id: item.product_item_id,
              product_name: item.product_name,
              sku: item.sku,
              price: item.price,
              quantity: item.quantity,
              discount_type: item.discount_type,
              discount_value: item.discount_value,
              line_total: item.line_total,
            })),
          },
        },
        include: { items: true, customer: true, bank_account: true },
      });

      if (needsDebt && customer_id) {
        await tx.debt.create({
          data: {
            voucher_id: created.id,
            customer_id,
            total_amount: grandTotal,
            paid_amount: paidAmount,
            remaining_amount: debtAmount,
            status: "pending",
          },
        });
      }

      for (const item of itemDetails) {
        await tx.productUnit.update({
          where: { id: item.productUnitId },
          data: { quantity: item.previousQty - item.quantity },
        });

        await tx.productUnitLog.create({
          data: {
            product_unit_id: item.productUnitId,
            previous_qty: item.previousQty,
            current_qty: item.previousQty - item.quantity,
            quantity: item.quantity,
            type: "sold",
            reference_id: code,
            notes: `Sold via voucher ${code}`,
            created_by: userId,
          },
        });
      }

      return tx.voucher.findUnique({
        where: { id: created.id },
        include: { items: true, customer: true, bank_account: true, debt: true },
      });
    });

    return voucher;
  }

  async getAll(filters, branchId) {
    const { page = 1, limit = 10, startDate, endDate } = filters;
    const andConditions = [{ branch_id: branchId }];
    if (startDate || endDate) {
      andConditions.push({
        created_at: {
          gte: startDate ? new Date(startDate + "T00:00:00") : undefined,
          lte: endDate ? new Date(endDate + "T23:59:59") : undefined,
        },
      });
    }
    const where = { AND: andConditions };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.voucher.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
        include: { items: true, customer: true, bank_account: true, cashier: { select: { full_name: true } } },
      }),
      prisma.voucher.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async getById(id, branchId) {
    const voucher = await prisma.voucher.findFirst({
      where: { id: parseInt(id), branch_id: branchId },
      include: { items: true, customer: true, bank_account: true, cashier: { select: { full_name: true } }, debt: true, canceller: { select: { full_name: true } } },
    });
    if (!voucher) throw new Error("Voucher not found");
    return { message: `Voucher ${voucher.code} found`, data: voucher };
  }

  async cancel(id, branchId, userId, reason) {
    const voucher = await prisma.voucher.findFirst({
      where: { id: parseInt(id), branch_id: branchId },
      include: { items: true, debt: true },
    });
    if (!voucher) throw new Error("Voucher not found");
    if (voucher.status === "cancelled") throw new Error("Voucher is already cancelled");

    await prisma.$transaction(async (tx) => {
      await tx.voucher.update({
        where: { id: parseInt(id) },
        data: {
          status: "cancelled",
          cancelled_at: new Date(),
          cancel_reason: reason || null,
          cancelled_by: userId,
        },
      });

      for (const item of voucher.items) {
        const productUnit = await tx.productUnit.findUnique({
          where: {
            product_item_id_branch_id: {
              product_item_id: item.product_item_id,
              branch_id: branchId,
            },
          },
        });
        if (productUnit) {
          await tx.productUnit.update({
            where: { id: productUnit.id },
            data: { quantity: productUnit.quantity + item.quantity },
          });
          await tx.productUnitLog.create({
            data: {
              product_unit_id: productUnit.id,
              previous_qty: productUnit.quantity,
              current_qty: productUnit.quantity + item.quantity,
              quantity: item.quantity,
              type: "adjustment",
              reference_id: voucher.code,
              notes: `Cancelled voucher ${voucher.code}${reason ? `: ${reason}` : ""}`,
              created_by: userId,
            },
          });
        }
      }

      if (voucher.debt) {
        await tx.debt.update({
          where: { id: voucher.debt.id },
          data: { status: "written_off" },
        });
      }
    });

    const updated = await prisma.voucher.findFirst({
      where: { id: parseInt(id) },
      include: { items: true, customer: true, bank_account: true, cashier: { select: { full_name: true } }, debt: true, canceller: { select: { full_name: true } } },
    });
    return { message: "Voucher cancelled successfully", data: updated };
  }
}

module.exports = new VoucherService();
