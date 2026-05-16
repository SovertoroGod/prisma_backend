const express = require("express");
const validateError = require("../middlewares/validationErrorHandler");
const userManagementValidators = require("../validations/userManagement.validation");
const userManagementControllers = require("../controllers/userManagement.controller");
const validateID = require("../validations/id.validation");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, authorize } = require("../middlewares/authorize");

const router = express.Router();

router.use(verifyToken, authorize("cashier"));

router.get(
  "/admin/users",
  validateError(userManagementValidators.getAllUsersValidation),
  userManagementControllers.getAllUsers,
);
router.get(
  "/admin/users/:id",
  validateError(validateID),
  userManagementControllers.getUserById,
);
router.patch(
  "/admin/users/:id",
  validateError(userManagementValidators.updateUserValidation),
  userManagementControllers.updateUser,
);
router.delete(
  "/admin/users/:id",
  validateError(validateID),
  userManagementControllers.deleteUser,
);

module.exports = router;
