const { requiredString, requiredEmail, requiredEnum, requiredInt } = require("./common/commonRequire");


const validateRegister = [
  requiredString("full_name", "Full Name"),
  requiredString("username", "User Name"),
  requiredEmail("email", "Email"),
  requiredString("password", "Password", 6),
  requiredEnum("role", ["admin", "cashier", "manager"], "Role"),
  requiredInt("branch_id", "Branch")
];

const validateLogin = [
  requiredEmail("email", "Email"),
  requiredString("password", "Password", 6),
];

const authValidators = {
  validateRegister,
  validateLogin,
};

module.exports = authValidators;
