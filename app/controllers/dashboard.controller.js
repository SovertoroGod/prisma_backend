const dashboardService = require("../services/dashboard.service");

const getStats = async (req, res) => {
  try {
    const data = await dashboardService.getStats();
    res.status(200).json({ success: true, message: "Dashboard stats retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get dashboard stats", error: error.message });
  }
};

const getManagerDashboard = async (req, res) => {
  try {
    const data = await dashboardService.getManagerDashboard(req.user.branch_id);
    res.status(200).json({ success: true, message: "Manager dashboard retrieved successfully", data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get manager dashboard", error: error.message });
  }
};

module.exports = { getStats, getManagerDashboard };
