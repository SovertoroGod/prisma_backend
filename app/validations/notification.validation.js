const { optionalInt, optionalBoolean, optionalEnum } = require("./common/commonOptional.validator");

const getNotifications = [
  optionalInt("page", "Page"),
  optionalInt("limit", "Limit"),
  optionalBoolean("is_read", "Is Read"),
  optionalEnum("type", ["transfer_request", "transfer_received", "transfer_cancelled", "general"], "Type"),
];

module.exports = { getNotifications };
