const { body, query, param } = require("express-validator");

const createCategory = [
  body("name")
    .notEmpty()
    .withMessage("name must be required")
    .trim()
    .isString()
    .withMessage("name must be a string"),
  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("description must be a string"),
  body("parent_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("parent_id must be a positive number"),
  body("is_active")
    .optional({ values: "null" })
    .toBoolean()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];

const getAllCategories = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("page must be a positive number"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be a positive number between 1 and 100"),
  query("parent_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("parent_id must be a positive number"),
  query("search")
    .optional()
    .trim()
    .isString()
    .withMessage("search must be a string"),
  query("is_active")
    .optional({values: "null"})
    .isIn(["true", "false", ""])
    .withMessage("Status must be true or false"),
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
    query("type")
        .optional({values: "falsy"})
        .trim()
        .isString()
        .withMessage("type must be a string")
        .isIn(["parent", "sub"])
        .withMessage("type must be either 'parent' or 'sub'"),
];

const updateCategory = [
  param("id")
    .notEmpty()
    .withMessage("id is required")
    .isInt({ min: 1 })
    .withMessage("id must be a positive number"),
  body("name")
    .optional()
    .trim()
    .isString()
    .withMessage("name must be a string"),
  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("description must be a string"),
  body("parent_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("parent_id must be a positive number"),
  body("is_active")
    .optional({ values: "null" })
    .toBoolean()
    .isBoolean()
    .withMessage("is_active must be a boolean"),
];

const categoryValidators = {
  createCategory,
  getAllCategories,
  updateCategory
};

module.exports = categoryValidators;
