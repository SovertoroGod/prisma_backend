const { PrismaClient } = require("@prisma/client");
const { check } = require("express-validator");
const { requiredString, requiredInt, requiredEnum, requiredNumber } = require("./common/commonRequire");
const { optionalInt, optionalString, optionalNumber } = require("./common/commonOptional.validator");
const prisma = new PrismaClient();

const createVoucher = [
  optionalInt("customer_id", "Customer ID")
    .custom(async (value) => {
      if (value) {
        const customer = await prisma.customer.findUnique({ where: { id: value } });
        if (!customer) throw new Error("Customer not found");
      }
      return true;
    }),
  requiredString("purchase_type", "Purchase Type")
    .isIn(["cash", "bank"])
    .withMessage("Purchase type must be 'cash' or 'bank'"),
  requiredNumber("amount_paid", "Amount Paid", 0),
  optionalInt("bank_account_id", "Bank Account ID")
    .custom(async (value, { req }) => {
      if (value) {
        if (req.validated.purchase_type !== "bank") {
          throw new Error("Bank account can only be set for bank purchase type");
        }
        const account = await prisma.bankAccount.findUnique({ where: { id: value, is_active: true } });
        if (!account) throw new Error("Bank account not found or inactive");
      } else if (req.validated.purchase_type === "bank") {
        throw new Error("Bank account is required for bank purchase type");
      }
      return true;
    }),
  check("items")
    .notEmpty()
    .withMessage("Items is required")
    .custom(async (value) => {
      let items;
      try {
        items = typeof value === "string" ? JSON.parse(value) : value;
      } catch {
        throw new Error("Items must be a valid JSON array");
      }
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Items must be a non-empty array");
      }
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.product_item_id) throw new Error(`Item ${i}: product_item_id is required`);
        if (!item.quantity || item.quantity < 1) throw new Error(`Item ${i}: quantity must be at least 1`);
      }
      return true;
    }),
  optionalString("voucher_discount_type", "Voucher Discount Type")
    .isIn(["percent", "fixed"])
    .withMessage("Voucher discount type must be 'percent' or 'fixed'"),
  optionalNumber("voucher_discount_value", "Voucher Discount Value", 0),
];

const getVouchers = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalString("startDate", "Start Date"),
  optionalString("endDate", "End Date"),
];

module.exports = { createVoucher, getVouchers };
