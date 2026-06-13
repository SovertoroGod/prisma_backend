const express = require("express");
const verifyToken = require("../middlewares/verifyToken");
const { isAdmin } = require("../middlewares/authorize");
const dashboardControllers = require("../controllers/dashboard.controller");
const router = express.Router();

router.get(
  "/admin/dashboard/stats",
  verifyToken,
  isAdmin,
  dashboardControllers.getStats,
);

module.exports = router;
