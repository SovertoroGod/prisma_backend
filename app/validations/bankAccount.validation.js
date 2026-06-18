const { PrismaClient } = require("@prisma/client");
const { requiredString } = require("./common/commonRequire");
const { optionalString, optionalBoolean, optionalInt } = require("./common/commonOptional.validator");
const prisma = new PrismaClient();

const createBankAccount = [
  requiredString("account_name", "Account Name"),
  requiredString("account_number", "Account Number")
    .custom(async (value) => {
      const existing = await prisma.bankAccount.findUnique({ where: { account_number: value } });
      if (existing) throw new Error("Account number already exists");
      return true;
    }),
  requiredString("bank_name", "Bank Name"),
];

const updateBankAccount = [
  optionalString("account_name", "Account Name"),
  optionalString("account_number", "Account Number")
    .custom(async (value, { req }) => {
      if (value) {
        const existing = await prisma.bankAccount.findUnique({ where: { account_number: value } });
        if (existing && existing.id !== parseInt(req.params.id)) {
          throw new Error("Account number already exists");
        }
      }
      return true;
    }),
  optionalString("bank_name", "Bank Name"),
  optionalBoolean("is_active", "Is Active"),
];

const getBankAccounts = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalBoolean("is_active", "Is Active"),
  optionalString("account_name", "Account Name"),
];

const getHistory = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalString("startDate", "Start Date"),
  optionalString("endDate", "End Date"),
  optionalInt("branch_id", "Branch ID"),
];

module.exports = { createBankAccount, updateBankAccount, getBankAccounts, getHistory };
