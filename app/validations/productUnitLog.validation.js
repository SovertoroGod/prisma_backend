const { body, param } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { requiredInt } = require("./common/commonRequire");
const { optionalString, optionalInt, optionalISODate, optionalEndDate, optionalEnum } = require("./common/commonOptional.validator");
const prisma = new PrismaClient();

const transferStock = [
  requiredInt("product_item_id", "Product Item ID")
    .custom(async (value) => {
      const item = await prisma.productItem.findUnique({ where: { id: value } });
      if (!item) throw new Error("Product item not found");
      return true;
    }),
  requiredInt("from_branch_id", "From Branch ID")
    .custom(async (value) => {
      const branch = await prisma.branch.findUnique({ where: { id: value } });
      if (!branch) throw new Error("From branch not found");
      return true;
    }),
  requiredInt("to_branch_id", "To Branch ID")
    .custom(async (value, { req }) => {
      if (value === req.body.from_branch_id) throw new Error("From and To branch must be different");
      const branch = await prisma.branch.findUnique({ where: { id: value } });
      if (!branch) throw new Error("To branch not found");
      return true;
    }),
  requiredInt("quantity", "Quantity"),
  optionalString("notes", "Notes"),
];

const logTypes = ["","initial", "transfer_out", "transfer_in", "sold", "issue", "adjustment", "return"];

const getAllProductUnitLogs = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalInt("product_unit_id", "Product Unit ID"),
  optionalEnum("type", logTypes, "Type"),
  optionalInt("from_branch_id", "From Branch ID"),
  optionalInt("to_branch_id", "To Branch ID"),
  optionalInt("created_by", "Created By"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
];

const getProductUnitLogById = [
  param("id").trim().notEmpty().withMessage("ID is required").isInt().withMessage("ID must be integer").toInt()
    .custom(async (value) => {
      const log = await prisma.productUnitLog.findUnique({ where: { id: value } });
      if (!log) throw new Error("Product unit log not found");
      return true;
    }),
];

module.exports = { transferStock, getAllProductUnitLogs, getProductUnitLogById };
