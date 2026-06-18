const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isManager } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const voucherValidators = require("../validations/voucher.validation");
const voucherControllers = require("../controllers/voucher.controller");
const router = express.Router();

router.post(
  "/branches/vouchers",
  verifyToken,
  validateError(voucherValidators.createVoucher),
  voucherControllers.create,
);
router.get(
  "/branches/vouchers",
  verifyToken,
  validateError(voucherValidators.getVouchers),
  voucherControllers.getAll,
);
router.get(
  "/branches/vouchers/:id",
  verifyToken,
  validateError(validateID),
  voucherControllers.getById,
);

router.get(
  "/manager/vouchers",
  verifyToken,
  isManager,
  validateError(voucherValidators.getVouchers),
  voucherControllers.getAllManager,
);
router.get(
  "/manager/vouchers/:id",
  verifyToken,
  isManager,
  validateError(validateID),
  voucherControllers.getByIdManager,
);
router.post(
  "/manager/vouchers/:id/cancel",
  verifyToken,
  isManager,
  validateError([...validateID, ...voucherValidators.cancelVoucher]),
  voucherControllers.cancel,
);

module.exports = router;
