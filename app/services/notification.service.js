const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class NotificationService {
  async createForUsers(userIds, payload) {
    const { type, title, message, reference_id } = payload;
    const data = userIds.map((userId) => ({
      user_id: parseInt(userId),
      type,
      title,
      message,
      reference_id: reference_id || null,
    }));
    await prisma.notification.createMany({ data });
  }

  async getMyNotifications(userId, filters) {
    const { is_read, type, page = 1, limit = 10 } = filters;
    const andConditions = [{ user_id: parseInt(userId) }];
    if (is_read !== undefined && is_read !== "") andConditions.push({ is_read: is_read === "true" });
    if (type) andConditions.push({ type });
    const where = { AND: andConditions };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);
    return { metadata: { totalItems: total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), limit: parseInt(limit) }, data };
  }

  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findFirst({
      where: { id: parseInt(notificationId), user_id: parseInt(userId) },
    });
    if (!notification) throw new Error("Notification not found");
    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: { is_read: true },
    });
    return { message: "Notification marked as read", data: updated };
  }

  async markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
      where: { user_id: parseInt(userId), is_read: false },
      data: { is_read: true },
    });
    return { message: `Marked ${result.count} notifications as read`, count: result.count };
  }
}

module.exports = new NotificationService();
