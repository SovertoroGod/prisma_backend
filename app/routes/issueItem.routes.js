const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, isManager } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const issueItemValidators = require("../validations/issueItem.validation");
const issueItemControllers = require("../controllers/issueItem.controller");
const authorizeIssueItem = require("../middlewares/authorizeIssueItem");
const router = express.Router();

router.post(
  "/issue-items",
  verifyToken,
  authorizeIssueItem,
  validateError(issueItemValidators.createIssueItem),
  issueItemControllers.create,
);
router.get(
  "/admin/issue-items",
  verifyToken,
  isAdmin,
  validateError(issueItemValidators.getAllIssueItems),
  issueItemControllers.getAll,
);
router.get(
  "/admin/issue-items/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  issueItemControllers.getById,
);
router.get(
  "/manager/issue-items",
  verifyToken,
  isManager,
  validateError(issueItemValidators.getAllIssueItems),
  issueItemControllers.getAllForManager,
);
router.get(
  "/manager/issue-items/:id",
  verifyToken,
  isManager,
  validateError(validateID),
  issueItemControllers.getByIdForManager,
);

module.exports = router;
