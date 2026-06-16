const { body, query } = require("express-validator");
const { optionalInt, optionalString } = require("./common/commonOptional.validator");
const { requiredString, requiredNumber } = require("./common/commonRequire");

const getDebts = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalString("status", "Status"),
  optionalInt("customer_id", "Customer ID"),
];

const repayDebt = [
  requiredNumber("amount", "Amount", 0.01),
  requiredString("payment_type", "Payment Type")
    .isIn(["cash", "bank"])
    .withMessage("Payment type must be 'cash' or 'bank'"),
  body("bank_account_id")
    .optional({ values: "falsy" })
    .trim()
    .isInt({ min: 1 })
    .withMessage("Bank account ID must be a positive integer")
    .toInt()
    .custom(async (value, { req }) => {
      if (value && req.body.payment_type !== "bank") {
        throw new Error("Bank account can only be set for bank payment type");
      }
      if (!value && req.body.payment_type === "bank") {
        throw new Error("Bank account is required for bank payment type");
      }
      return true;
    }),
  optionalString("notes", "Notes"),
];

module.exports = { getDebts, repayDebt };
