const { requiredInt } = require("./common/commonRequire");
const { optionalInt, optionalString, optionalISODate, optionalEndDate } = require("./common/commonOptional.validator");

const createIssueItem = [
  requiredInt("product_item_id", "Product Item ID"),
  requiredInt("quantity", "Quantity"),
  optionalInt("from_branch_id", "From Branch ID"),
  optionalString("notes", "Notes"),
];

const getAllIssueItems = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalInt("from_branch_id", "From Branch ID"),
  optionalInt("product_item_id", "Product Item ID"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
];

module.exports = { createIssueItem, getAllIssueItems };
