const { PrismaClient } = require("@prisma/client");
const { requiredInt } = require("./common/commonRequire");
const { optionalInt, optionalString, optionalISODate, optionalEnum, optionalEndDate } = require("./common/commonOptional.validator");
const prisma = new PrismaClient();

const initiateTransfer = [
  requiredInt("product_item_id", "Product Item ID")
    .custom(async (value) => {
      const item = await prisma.productItem.findUnique({ where: { id: value } });
      if (!item) throw new Error("Product item not found");
      return true;
    }),
  requiredInt("from_branch_id", "Source Branch ID")
    .custom(async (value) => {
      const branch = await prisma.branch.findUnique({ where: { id: value } });
      if (!branch) throw new Error("Source branch not found");
      return true;
    }),
  requiredInt("to_branch_id", "Destination Branch ID")
    .custom(async (value) => {
      const branch = await prisma.branch.findUnique({ where: { id: value } });
      if (!branch) throw new Error("Destination branch not found");
      return true;
    }),
  requiredInt("quantity", "Quantity"),
  optionalString("notes", "Notes"),
];

const getAllTransfers = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalEnum("status", ["pending", "completed", "cancelled"], "Status"),
  optionalInt("from_branch_id", "Source Branch ID"),
  optionalInt("to_branch_id", "Destination Branch ID"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
];

module.exports = { initiateTransfer, getAllTransfers };
