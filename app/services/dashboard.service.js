const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class DashboardService {
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      users,
      activeBranches,
      activeCategories,
      activeProductItems,
      totalStockAgg,
      lowStockCount,
      outOfStockCount,
      activeProductLists,
      inactiveProductItems,
      inactiveProductLists,
      todayLogs,
      todayLogsByType,
      stockByBranch,
      recentLogs,
    ] = await Promise.all([
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.branch.count({ where: { is_active: true } }),
      prisma.category.count({ where: { is_active: true } }),
      prisma.productItem.count({ where: { is_active: true } }),
      prisma.productUnit.aggregate({ _sum: { quantity: true } }),
      prisma.productUnit.count({ where: { quantity: { lte: 5 }, is_active: true } }),
      prisma.productUnit.count({ where: { quantity: 0, is_active: true } }),
      prisma.productList.count({ where: { is_active: true } }),
      prisma.productItem.count({ where: { is_active: false } }),
      prisma.productList.count({ where: { is_active: false } }),
      prisma.productUnitLog.count({ where: { created_at: { gte: today } } }),
      prisma.productUnitLog.groupBy({
        by: ["type"],
        where: { created_at: { gte: today } },
        _count: true,
      }),
      prisma.productUnit.groupBy({
        by: ["branch_id"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
      prisma.productUnitLog.findMany({
        take: 10,
        orderBy: { created_at: "desc" },
        include: {
          product_unit: { include: { product_item: { include: { product_list: true } }, branch: true } },
          creator: { select: { id: true, full_name: true, username: true } },
        },
      }),
    ]);

    const branchIds = stockByBranch.map((b) => b.branch_id);
    const branches = branchIds.length
      ? await prisma.branch.findMany({
          where: { id: { in: branchIds } },
          select: { id: true, branch_name: true },
        })
      : [];
    const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.branch_name]));

    const usersBreakdown = { total: 0 };
    for (const row of users) {
      usersBreakdown[row.role] = row._count;
      usersBreakdown.total += row._count;
    }

    const logsByType = {};
    for (const row of todayLogsByType) {
      logsByType[row.type] = row._count;
    }

    const stockByBranchMapped = stockByBranch.map((b) => ({
      branch_name: branchMap[b.branch_id] || "Unknown",
      total: b._sum.quantity || 0,
    }));

    return {
      users: usersBreakdown,
      activeBranches,
      activeCategories,
      activeProductItems,
      activeProductLists,
      totalStock: totalStockAgg._sum.quantity || 0,
      lowStockCount,
      outOfStockCount,
      inactiveItems: inactiveProductItems + inactiveProductLists,
      todayLogs,
      todayLogsByType: logsByType,
      stockByBranch: stockByBranchMapped,
      recentLogs,
    };
  }
}

module.exports = new DashboardService();
