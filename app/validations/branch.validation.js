const { body, query, check } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createBranchValidation = [
  body("branch_name")
    .trim()
    .notEmpty()
    .withMessage("Branch name is required")
    .isString()
    .withMessage("Branch name must be a string"),
  body("branch_code")
    .trim()
    .notEmpty()
    .withMessage("Branch code is required")
    .isLength({ min: 3, max: 10 })
    .withMessage("Branch code must be between 3 and 10 characters long"),
  body("address")
    .notEmpty()
    .trim()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string"),
  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isString()
    .withMessage("Phone number must be a string"),
];

const getAllBranchesValidation = [
  query("page")
    .optional({ values: "falsy" })
    .trim()
    .isInt({ min: 1 })
    .withMessage("Page must be Numeric type")
    .toInt(),
  query("limit")
    .optional({ values: "falsy" })
    .trim()
    .isInt({ min: 1, max: 50 })
    .withMessage("limit must be Numeric type"),
  query("search")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("search must be String"),
  query("branch_name")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Branch Name must be String"),
  query("branch_code")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Branch code must be string"),
  query("address")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Address must be string"),
  query("phone_number")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Phone Number must be string"),
  query("startDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("Start Date must be YYYY-MM-DD format"),
  query("endDate")
    .optional({ values: "falsy" })
    .isISO8601()
    .withMessage("End Date must be YYYY-MM-DD format")
    .custom((value, { req }) => {
      if (req.query.startDate && value < req.query.startDate) {
        throw new Error("If Start Date include, End Date is required.");
      }
      return true;
    }),
];

const updateBranchValidation = [
  check("id")
    .trim()
    .notEmpty()
    .withMessage("Id must not be empty")
    .isInt()
    .withMessage("id must be integer").custom(async (value) => {
      const branch = await prisma.branch.findUnique({
        where: { id: parseInt(value) },
      });
      if (!branch) {
        throw new Error('Branch ID does not exist');
      }
      return true;
    }),
  check("branch_name")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Branch Name must be string"),
  check("branch_code")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Branch code must be string"),
  check("address")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("Address must be string"),
  check("phone_number")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Phone Number must be string"),
  check("is_active")
    .optional({ values: "null" })
    .toBoolean()
    .isBoolean()
    .withMessage("is_active must be true or false"),
];

const branchValidators = {
  createBranchValidation,
  getAllBranchesValidation,
  updateBranchValidation,
};

module.exports = branchValidators;
