const { param } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { requiredString, requiredInt } = require("./common/commonRequire");
const { optionalString, optionalInt, optionalBoolean, optionalNumber, optionalISODate, optionalEndDate } = require("./common/commonOptional.validator");
const prisma = new PrismaClient();

const createProductItem = [
  requiredInt("product_list_id", "Product List ID")
    .custom(async (value) => {
      const list = await prisma.productList.findUnique({ where: { id: value } });
      if (!list) throw new Error("Product list not found");
      return true;
    }),
  requiredString("sku", "SKU")
    .custom(async (value) => {
      const existing = await prisma.productItem.findUnique({ where: { sku: value } });
      if (existing) throw new Error("SKU already exists");
      return true;
    }),
  requiredString("name", "Name"),
  requiredString("price", "Price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number")
    .toFloat(),
];

const getAllProductItems = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalString("search", "Search"),
  optionalString("sku", "SKU"),
  optionalString("name", "Name"),
  optionalInt("product_list_id", "Product List ID"),
  optionalBoolean("is_active", "Is Active"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
];

const updateProductItem = [
  param("id").trim().notEmpty().withMessage("ID is required").isInt().withMessage("ID must be integer").toInt()
    .custom(async (value) => {
      const item = await prisma.productItem.findUnique({ where: { id: value } });
      if (!item) throw new Error("Product item not found");
      return true;
    }),
  optionalString("sku", "SKU"),
  optionalString("name", "Name"),
  optionalNumber("price", "Price"),
  optionalInt("product_list_id", "Product List ID")
    .custom(async (value) => {
      if (value) {
        const list = await prisma.productList.findUnique({ where: { id: value } });
        if (!list) throw new Error("Product list not found");
      }
      return true;
    }),
  optionalBoolean("is_active", "Is Active"),
];

module.exports = { createProductItem, getAllProductItems, updateProductItem };
