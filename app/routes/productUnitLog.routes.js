const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const productUnitLogValidators = require("../validations/productUnitLog.validation");
const productUnitLogControllers = require("../controllers/productUnitLog.controller");
const router = express.Router();

router.post(
  "/admin/product-units/transfer",
  verifyToken,
  isAdmin,
  validateError(productUnitLogValidators.transferStock),
  productUnitLogControllers.transfer,
);
router.get(
  "/admin/product-unit-logs",
  verifyToken,
  isAdmin,
  validateError(productUnitLogValidators.getAllProductUnitLogs),
  productUnitLogControllers.getAll,
);
router.get(
  "/admin/product-unit-logs/:id",
  verifyToken,
  isAdmin,
  validateError(productUnitLogValidators.getProductUnitLogById),
  productUnitLogControllers.getById,
);

module.exports = router;
