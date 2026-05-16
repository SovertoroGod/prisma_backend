const { body } = require("express-validator");

const validateRegister = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isString()
    .withMessage("Full name must be a string"),
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isString()
    .withMessage("Username must be a string"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "cashier", "manager"])
    .withMessage("Role must be either admin, cashier, or manager"),
  body("branch_id")
    .isInt()
    .withMessage("Branch id must be integer")
    .toInt()
    .custom((value, { req }) => {
      if (req.body.role !== "admin" && !value) {
        throw new Error("cashier and manager need branch selection");
      }
      return true;
    }),
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const authValidators = {
  validateRegister,
  validateLogin,
};

module.exports = authValidators;
