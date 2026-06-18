const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, isManager } = require("../middlewares/authorize");
const authorizeTransfer = require("../middlewares/authorizeTransfer");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const stockTransferValidators = require("../validations/stockTransfer.validation");
const stockTransferControllers = require("../controllers/stockTransfer.controller");
const router = express.Router();

router.post(
  "/stock-transfers",
  verifyToken,
  authorizeTransfer,
  validateError(stockTransferValidators.initiateTransfer),
  stockTransferControllers.initiate,
);
router.get(
  "/admin/stock-transfers",
  verifyToken,
  isAdmin,
  validateError(stockTransferValidators.getAllTransfers),
  stockTransferControllers.getAll,
);
router.get(
  "/admin/stock-transfers/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  stockTransferControllers.getById,
);
router.get(
  "/manager/stock-transfers",
  verifyToken,
  isManager,
  validateError(stockTransferValidators.getAllTransfers),
  stockTransferControllers.getAllForManager,
);
router.patch(
  "/stock-transfers/:id/receive",
  verifyToken,
  validateError(validateID),
  stockTransferControllers.receive,
);
router.patch(
  "/stock-transfers/:id/cancel",
  verifyToken,
  validateError(validateID),
  stockTransferControllers.cancelTransfer,
);

module.exports = router;
