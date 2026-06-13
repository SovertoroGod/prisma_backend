const authorizeIssueItem = (req, res, next) => {
  if (req.user.role === "admin") return next();
  if (req.user.role === "manager") return next();
  return res.status(403).json({ success: false, message: "Access denied." });
};

module.exports = authorizeIssueItem;
