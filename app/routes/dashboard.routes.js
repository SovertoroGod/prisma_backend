const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin, isManager } = require("../middlewares/authorize");
const dashboardControllers = require("../controllers/dashboard.controller");
const router = express.Router();

router.get(
  "/admin/dashboard/stats",
  verifyToken,
  isAdmin,
  dashboardControllers.getStats,
);
router.get(
  "/manager/dashboard",
  verifyToken,
  isManager,
  dashboardControllers.getManagerDashboard,
);

module.exports = router;
