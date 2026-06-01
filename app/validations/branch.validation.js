const { body, query, check } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { requiredString, requiredInt } = require("./common/commonRequire");
const { optionalInt, optionalString, optionalISODate, optionalEndDate, optionalBoolean } = require("./common/commonOptional.validator");

const prisma = new PrismaClient();

const createBranchValidation = [
  requiredString("branch_name", "Branch Name"),
  requiredString("branch_code", "Branch Code"),
  requiredString("address", "Address"),
  requiredString("phone_number", "Phone Number"),
];

const getAllBranchesValidation = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalString("search", "Search"),
  optionalString("branch_name", "Branch Name"),
  optionalString("branch_code", "Branch Code"),
  optionalString("address", "Address"),
  optionalString("phone_number", "Phone Number"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
];

const updateBranchValidation = [
  requiredInt("id", "ID"),
  optionalString("branch_name", "Branch Name"),
  optionalString("branch_code", "Branch Code"),
  optionalString("address", "Address"),
  optionalString("phone_number", "Phone Number"),
  optionalBoolean("is_active", "Is Active"),
];

const branchValidators = {
  createBranchValidation,
  getAllBranchesValidation,
  updateBranchValidation,
};

module.exports = branchValidators;
