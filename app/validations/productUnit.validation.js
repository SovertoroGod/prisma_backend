const { param } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { requiredInt } = require("./common/commonRequire");
const { optionalInt, optionalBoolean, optionalISODate, optionalEndDate } = require("./common/commonOptional.validator");
const prisma = new PrismaClient();

const createProductUnit = [
  requiredInt("product_item_id", "Product Item ID")
    .custom(async (value) => {
      const item = await prisma.productItem.findUnique({ where: { id: value } });
      if (!item) throw new Error("Product item not found");
      return true;
    }),
  requiredInt("branch_id", "Branch ID")
    .custom(async (value) => {
      const branch = await prisma.branch.findUnique({ where: { id: value } });
      if (!branch) throw new Error("Branch not found");
      return true;
    }),
  optionalInt("quantity", "Quantity"),
];

const getAllProductUnits = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalInt("product_item_id", "Product Item ID"),
  optionalInt("branch_id", "Branch ID"),
  optionalBoolean("is_active", "Is Active"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
];

const updateProductUnit = [
  param("id").trim().notEmpty().withMessage("ID is required").isInt().withMessage("ID must be integer").toInt()
    .custom(async (value) => {
      const unit = await prisma.productUnit.findUnique({ where: { id: value } });
      if (!unit) throw new Error("Product unit not found");
      return true;
    }),
  optionalInt("quantity", "Quantity"),
  optionalInt("product_item_id", "Product Item ID")
    .custom(async (value) => {
      if (value) {
        const item = await prisma.productItem.findUnique({ where: { id: value } });
        if (!item) throw new Error("Product item not found");
      }
      return true;
    }),
  optionalInt("branch_id", "Branch ID")
    .custom(async (value) => {
      if (value) {
        const branch = await prisma.branch.findUnique({ where: { id: value } });
        if (!branch) throw new Error("Branch not found");
      }
      return true;
    }),
  optionalBoolean("is_active", "Is Active"),
];

module.exports = { createProductUnit, getAllProductUnits, updateProductUnit };
