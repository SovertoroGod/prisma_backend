const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const validateError = require("../middlewares/validationErrorHandler");
const notificationValidators = require("../validations/notification.validation");
const notificationControllers = require("../controllers/notification.controller");
const router = express.Router();

router.get(
  "/notifications",
  verifyToken,
  validateError(notificationValidators.getNotifications),
  notificationControllers.getMyNotifications,
);
router.patch(
  "/notifications/:id/read",
  verifyToken,
  notificationControllers.markAsRead,
);
router.patch(
  "/notifications/read-all",
  verifyToken,
  notificationControllers.markAllAsRead,
);

module.exports = router;
