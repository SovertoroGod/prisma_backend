const notificationService = require("../services/notification.service");

const getMyNotifications = async (req, res) => {
  try {
    const result = await notificationService.getMyNotifications(req.user.id, req.validated);
    res.status(200).json({ success: true, message: "Notifications retrieved successfully", _metadata: result.metadata, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in get notifications", error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({ success: true, message: result.message, data: result.data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in mark notification as read", error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({ success: true, message: result.message, count: result.count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error in mark all notifications as read", error: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
