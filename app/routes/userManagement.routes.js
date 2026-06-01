const express = require("express");
const validateError = require("../middlewares/validationErrorHandler");
const userManagementValidators = require("../validations/userManagement.validation");
const userManagementControllers = require("../controllers/userManagement.controller");
const validateID = require("../validations/id.validation");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, authorize } = require("../middlewares/authorize");

const router = express.Router();

// router.use();

router.get(
  "/admin/users",
  verifyToken, authorize("admin", "cashier", "manager"),
  validateError(userManagementValidators.getAllUsersValidation),
  userManagementControllers.getAllUsers,
);
router.get(
  "/admin/users/:id", verifyToken, authorize("admin", "cashier", "manager"),
  validateError(validateID),
  userManagementControllers.getUserById,
);
router.patch(
  "/admin/users/:id", verifyToken, authorize("admin", "cashier", "manager"),
  validateError(userManagementValidators.updateUserValidation),
  userManagementControllers.updateUser,
);
router.delete(
  "/admin/users/:id", verifyToken, authorize("admin", "cashier", "manager"),
  validateError(validateID),
  userManagementControllers.deleteUser,
);

module.exports = router;
