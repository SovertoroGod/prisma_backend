const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
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

module.exports = router;
