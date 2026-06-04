const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, authorize } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const productItemValidators = require("../validations/productItem.validation");
const productItemControllers = require("../controllers/productItem.controller");
const router = express.Router();

router.post(
  "/admin/product-items",
  verifyToken,
  isAdmin,
  validateError(productItemValidators.createProductItem),
  productItemControllers.create,
);
router.get(
  "/admin/product-items",
  verifyToken,
  authorize("admin", "cashier", "manager"),
  validateError(productItemValidators.getAllProductItems),
  productItemControllers.getAll,
);
router.get(
  "/admin/product-items/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  productItemControllers.getById,
);
router.put(
  "/admin/product-items/:id",
  verifyToken,
  isAdmin,
  validateError(productItemValidators.updateProductItem),
  productItemControllers.update,
);
router.delete(
  "/admin/product-items/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  productItemControllers.deleteItem,
);

module.exports = router;
