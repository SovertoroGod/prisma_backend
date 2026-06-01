const { body, query, check } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { optionalInt } = require("./commonOptional.validator");
const prisma = new PrismaClient();

const createProductValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isString()
    .withMessage("Product name must be a string"),
  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required")
    .isString()
    .withMessage("SKU must be a string"),
  body("description")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Description must be a string"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number")
    .toFloat(),
  body("category_id")
    .optional({ values: "falsy" })
    .isInt()
    .withMessage("Category ID must be an integer")
    .toInt()
    .custom(async (value) => {
      if (value) {
        const category = await prisma.category.findUnique({
          where: { id: value },
        });
        if (!category) {
          throw new Error("Category ID does not exist");
        }
      }
      return true;
    }),
];

const getAllProductsValidation = [
optionalInt("page","Page"),
optionalInt("limit","Limit"),
  query("search")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("search must be String"),
  query("name")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Name must be String"),
  query("sku")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("SKU must be string"),
  query("category_id")
    .optional({ values: "falsy" })
    .isInt()
    .withMessage("Category ID must be integer")
    .toInt(),
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

const updateProductValidation = [
  check("id")
    .trim()
    .notEmpty()
    .withMessage("Id must not be empty")
    .isInt()
    .withMessage("id must be integer")
    .toInt()
    .custom(async (value) => {
      const product = await prisma.product.findUnique({
        where: { id: value },
      });
      if (!product) {
        throw new Error("Product ID does not exist");
      }
      return true;
    }),
  check("name")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Name must be string"),
  check("sku")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("SKU must be string"),
  check("description")
    .optional({ values: "falsy" })
    .trim()
    .isString()
    .withMessage("Description must be string"),
  check("price")
    .optional({ values: "falsy" })
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number")
    .toFloat(),
  check("category_id")
    .optional({ values: "falsy" })
    .isInt()
    .withMessage("Category ID must be integer")
    .toInt()
    .custom(async (value) => {
      if (value) {
        const category = await prisma.category.findUnique({
          where: { id: value },
        });
        if (!category) {
          throw new Error("Category ID does not exist");
        }
      }
      return true;
    }),
  check("is_active")
    .optional({ values: "null" })
    .toBoolean()
    .isBoolean()
    .withMessage("is_active must be true or false"),
];

const productValidators = {
  createProductValidation,
  getAllProductsValidation,
  updateProductValidation,
};

module.exports = productValidators;
