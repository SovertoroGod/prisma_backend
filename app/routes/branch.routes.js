const express = require("express");
const validateID = require("../validations/id.validation");
const verifyToken = require("../middlewares/verifyToken");
const validateError = require("../middlewares/validationErrorHandler");
const { isAdmin } = require("../middlewares/authorize");
const branchValidators = require("../validations/branch.validation");
const branchControllers = require("../controllers/branch.controller");
const router = express.Router();

// router.use(verifyToken, isAdmin);

router.post(
  "/admin/branches",
  verifyToken,
  isAdmin,
  validateError(branchValidators.createBranchValidation),
  branchControllers.createBranch,
);
router.get(
  "/admin/branches",
  verifyToken,
  isAdmin,
  validateError(branchValidators.getAllBranchesValidation),
  branchControllers.getAllBranches,
);
router.get(
  "/admin/branches/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  branchControllers.getBranchById,
);
router.put(
  "/admin/branches/:id",
  verifyToken,
  isAdmin,
  validateError(branchValidators.updateBranchValidation),
  branchControllers.updateBranch,
);
router.delete(
  "/admin/branches/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  branchControllers.deleteBranch,
);
router.get(
  "/branches",
  verifyToken,
  validateError(branchValidators.getAllBranchesValidation),
  branchControllers.getAllBranchesForUser,
);
module.exports = router;
