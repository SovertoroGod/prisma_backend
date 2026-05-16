const { check, query } = require("express-validator");

const updateUserValidation = [
  check("id")
    .trim()
    .notEmpty()
    .withMessage("Id is required for update user")
    .isInt({ min: 1 })
    .withMessage("Id must be integer")
    .toInt(),
  check("full_name")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Full name must be string format"),
  check("username")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Username must be string format"),
  check("email")
    .optional({ values: "falsy" })
    .trim()
    .isEmail()
    .withMessage("Email must be email format."),
  check("role")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Role must be string format")
    .isIn(["ADMIN", "MANAGER", "CASHIER"])
    .withMessage("Invalid Role. Role must be ADMIN or MANAGER or CASHIER"),
  check("branch_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Branch_id must be integer format")
    .toInt(),
  check("is_active")
    .optional()
    .isBoolean()
    .withMessage("is_active must be boolean type")
    .toBoolean(),
];

const getAllUsersValidation = [
  query("page")
    .optional({ values: "falsy" })
    .trim()
    .isInt({ min: 1 })
    .withMessage("Page must be integer type")
    .toInt(),
  query("limit")
    .optional({ values: "falsy" })
    .trim()
    .isInt({ min: 1 })
    .withMessage("Limit must be integer type")
    .toInt(),
  query("search")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Search must be String format"),
  query("full_name")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Full name must be String format"),
  query("username")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Username must be String format"),
  query("email")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Email must be email format"),
  query("role")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Role must be String format"),
  query("branch_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("Branch Id must be integer")
    .toInt(),
  query("is_active")
    .optional()
    .isIn(["true", "false", ""])
    .withMessage("Status must be true or false"),
  query("startDate")
    .optional({ values: "falsy" })
    .trim()
    .isISO8601()
    .withMessage("Start Date must be YYYY-MM-DD format"),
  query("endDate")
    .optional({ values: "falsy" })
    .trim()
    .isISO8601()
    .withMessage("End Date must be YYYY-MM-DD format")
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error("If Start Date include, End Date is required");
      }
      return true;
    }),
];

const userManagementValidators = {
  updateUserValidation,
  getAllUsersValidation,
};

module.exports = userManagementValidators;
