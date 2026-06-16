const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const validateError = require("../middlewares/validationErrorHandler");
const customerValidators = require("../validations/customer.validation");
const customerControllers = require("../controllers/customer.controller");
const router = express.Router();

router.post(
  "/branches/customers",
  verifyToken,
  validateError(customerValidators.createCustomer),
  customerControllers.create,
);
router.get(
  "/branches/customers",
  verifyToken,
  validateError(customerValidators.getCustomers),
  customerControllers.findByPhone,
);

router.get(
  "/branches/customers/search",
  verifyToken,
  customerControllers.search,
);

module.exports = router;
