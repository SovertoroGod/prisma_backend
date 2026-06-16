const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const debtValidators = require("../validations/debt.validation");
const debtControllers = require("../controllers/debt.controller");
const router = express.Router();

router.get(
  "/branches/debts",
  verifyToken,
  validateError(debtValidators.getDebts),
  debtControllers.getAll,
);
router.get(
  "/branches/debts/:id",
  verifyToken,
  validateError(validateID),
  debtControllers.getById,
);
router.post(
  "/branches/debts/:id/repay",
  verifyToken,
  validateError(debtValidators.repayDebt),
  debtControllers.repay,
);

module.exports = router;
