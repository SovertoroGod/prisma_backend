const { requiredString } = require("./common/commonRequire");
const { optionalString, optionalInt } = require("./common/commonOptional.validator");

const createCustomer = [
  requiredString("name", "Name"),
  requiredString("phone", "Phone Number"),
];

const getCustomers = [
  optionalString("phone", "Phone Number"),
  optionalString("name", "Name"),
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
];

module.exports = { createCustomer, getCustomers };
