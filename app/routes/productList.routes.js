const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, authorize } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const productListValidators = require("../validations/productList.validation");
const productListControllers = require("../controllers/productList.controller");
const router = express.Router();

router.post(
  "/admin/product-lists",
  verifyToken,
  authorize("admin", "cashier", "manager"),
  validateError(productListValidators.createProductList),
  productListControllers.create,
);
router.get(
  "/admin/product-lists",
  verifyToken,
  authorize("admin", "cashier", "manager"),
  validateError(productListValidators.getAllProductLists),
  productListControllers.getAll,
);
router.get(
  "/admin/product-lists/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  productListControllers.getById,
);
router.put(
  "/admin/product-lists/:id",
  verifyToken,
  isAdmin,
  validateError(productListValidators.updateProductList),
  productListControllers.update,
);
router.delete(
  "/admin/product-lists/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  productListControllers.deleteList,
);
router.get(
  "/branches/product-lists",
  verifyToken,
  validateError(productListValidators.getAllProductLists),
  productListControllers.getAll,
);

module.exports = router;
