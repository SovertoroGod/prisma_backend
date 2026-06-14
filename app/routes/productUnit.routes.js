const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, isManager } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const productUnitValidators = require("../validations/productUnit.validation");
const productUnitControllers = require("../controllers/productUnit.controller");
const router = express.Router();

router.post(
  "/admin/product-units",
  verifyToken,
  isAdmin,
  validateError(productUnitValidators.createProductUnit),
  productUnitControllers.create,
);
router.get(
  "/admin/product-units",
  verifyToken,
  isAdmin,
  validateError(productUnitValidators.getAllProductUnits),
  productUnitControllers.getAll,
);
router.get(
  "/admin/product-units/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  productUnitControllers.getById,
);
router.patch(
  "/admin/product-units/:id",
  verifyToken,
  isAdmin,
  validateError(productUnitValidators.updateProductUnit),
  productUnitControllers.update,
);
router.delete(
  "/admin/product-units/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  productUnitControllers.deleteUnit,
);
router.get(
  "/manager/product-units",
  verifyToken,
  isManager,
  validateError(productUnitValidators.getAllProductUnits),
  productUnitControllers.getAllForManager,
);

module.exports = router;
