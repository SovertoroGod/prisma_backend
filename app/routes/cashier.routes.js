const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const validateError = require("../middlewares/validationErrorHandler");
const categoryValidators = require("../validations/category.validation");
const categoryControllers = require("../controllers/category.controller");
const productItemValidators = require("../validations/productItem.validation");
const productItemControllers = require("../controllers/productItem.controller");
const productUnitService = require("../services/productUnit.service");
const productUnitValidators = require("../validations/productUnit.validation");
const router = express.Router();

router.get(
  "/branches/categories",
  verifyToken,
  validateError(categoryValidators.getAllCategories),
  categoryControllers.getAllCategories,
);
router.get(
  "/branches/product-items",
  verifyToken,
  validateError(productItemValidators.getAllProductItems),
  productItemControllers.getAll,
);
router.get(
  "/branches/product-units",
  verifyToken,
  validateError(productUnitValidators.getAllProductUnits),
  async (req, res) => {
    try {
      req.validated.branch_id = req.user.branch_id;
      const result = await productUnitService.getAll(req.validated);
      res.status(200).json({ success: true, message: "Product units retrieved successfully", _metadata: result.metadata, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error in get product units", error: error.message });
    }
  },
);

module.exports = router;
