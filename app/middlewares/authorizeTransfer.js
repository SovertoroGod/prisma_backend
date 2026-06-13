const authorizeTransfer = (req, res, next) => {
  if (req.user.role === "admin") return next();
  if (req.user.role === "manager" && req.user.branch_id === req.body.from_branch_id) return next();
  return res.status(403).json({ success: false, message: "Access denied. You can only initiate transfers from your own branch." });
};

module.exports = authorizeTransfer;
