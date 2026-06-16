const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/authorize");
const validateError = require("../middlewares/validationErrorHandler");
const validateID = require("../validations/id.validation");
const bankAccountValidators = require("../validations/bankAccount.validation");
const bankAccountControllers = require("../controllers/bankAccount.controller");
const router = express.Router();

router.post(
  "/admin/bank-accounts",
  verifyToken,
  isAdmin,
  validateError(bankAccountValidators.createBankAccount),
  bankAccountControllers.create,
);
router.get(
  "/admin/bank-accounts",
  verifyToken,
  isAdmin,
  validateError(bankAccountValidators.getBankAccounts),
  bankAccountControllers.getAll,
);
router.get(
  "/admin/bank-accounts/:id",
  verifyToken,
  isAdmin,
  validateError(validateID),
  bankAccountControllers.getById,
);
router.patch(
  "/admin/bank-accounts/:id",
  verifyToken,
  isAdmin,
  validateError(bankAccountValidators.updateBankAccount),
  bankAccountControllers.update,
);
router.get(
  "/branches/bank-accounts",
  verifyToken,
  bankAccountControllers.listActive,
);

module.exports = router;
