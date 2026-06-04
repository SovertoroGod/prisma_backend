const { body, query, param, check } = require("express-validator");
const { PrismaClient } = require("@prisma/client");
const { requiredString } = require("./common/commonRequire");
const { optionalString, optionalInt, optionalBoolean, optionalEnum, optionalISODate, optionalEndDate } = require("./common/commonOptional.validator");
const prisma = new PrismaClient();

const createProductList = [
  requiredString("name", "Name"),
  optionalString("description", "Description"),
  optionalInt("category_id", "Category ID")
    .custom(async (value) => {
      if (value) {
        const category = await prisma.category.findUnique({ where: { id: value } });
        if (!category) throw new Error("Category not found");
      }
      return true;
    }),
];

const getAllProductLists = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalString("search", "Search"),
  optionalString("name", "Name"),
  optionalInt("category_id", "Category ID"),
  optionalEnum("is_active", ["true", "false", ""], "Is Active"),
  optionalISODate("startDate", "Start Date"),
  optionalEndDate("endDate", "startDate", "End Date"),
];

const updateProductList = [
  param("id").trim().notEmpty().withMessage("ID is required").isInt().withMessage("ID must be integer").toInt()
    .custom(async (value) => {
      const list = await prisma.productList.findUnique({ where: { id: value } });
      if (!list) throw new Error("Product list not found");
      return true;
    }),
  optionalString("name", "Name"),
  optionalString("description", "Description"),
  optionalInt("category_id", "Category ID")
    .custom(async (value) => {
      if (value) {
        const category = await prisma.category.findUnique({ where: { id: value } });
        if (!category) throw new Error("Category not found");
      }
      return true;
    }),
  optionalBoolean("is_active", "Is Active"),
];

module.exports = { createProductList, getAllProductLists, updateProductList };
