const express = require("express");
const validateError = require("../middlewares/validationErrorHandler");
const { isAdmin } = require("../middlewares/authorize");
const verifyToken = require("../middlewares/verifyToken");
const categoryValidators = require("../validations/category.validation");
const categoryControllers = require("../controllers/category.controller");
const validateID = require("../validations/id.validation");

const router = express.Router();

router.get(
    "/admin/categories",
    verifyToken,
    isAdmin,
    validateError(categoryValidators.getAllCategories),
    categoryControllers.getAllCategories
)
router.post(
    "/admin/categories",
    verifyToken,
    isAdmin,
    validateError(categoryValidators.createCategory),
    categoryControllers.createCategory
)
router.get(
    "/admin/categories/:id",
    verifyToken,
    isAdmin,
    validateError(validateID),
    categoryControllers.getCategoryById
)
router.patch(
    "/admin/categories/:id",
    verifyToken,
    isAdmin,
    validateError(validateID),
    categoryControllers.updateCategory
)

module.exports = router;
