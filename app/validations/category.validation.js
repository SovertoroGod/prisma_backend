const { body, query, param } = require("express-validator");
const { requiredString, requiredInt } = require("./common/commonRequire");
const { optionalString, optionalInt, optionalBoolean, optionalEnum, optionalISODate, optionalEndDate } = require("./common/commonOptional.validator");


const createCategory = [
  requiredString("name", "Name"),
  optionalString("description", "Description"),
  optionalInt("parent_id", "Parent Category"),
  optionalBoolean("is_active", "Active Status"),
];

const getAllCategories = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalInt("parent_id", "Parent ID"),
  optionalString("search", "Search"),
  optionalEnum("is_active", ["true", "false", ""], "Is Active"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
  optionalEnum("type", ["parent", "sub"], "Type"),
];

const updateCategory = [
  requiredInt("id", "ID"),
  optionalString("name", "Name"),
  optionalString("description", "Description"),
  optionalInt("parent_id", "Parent ID"),
  optionalBoolean("is_active", "Is Active"),
];

const categoryValidators = {
  createCategory,
  getAllCategories,
  updateCategory
};

module.exports = categoryValidators;
