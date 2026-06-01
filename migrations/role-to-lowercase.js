const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ROLE_MAP = {
  ADMIN: "admin",
  MANAGER: "manager",
  CASHIER: "cashier",
};

async function migrateRolesToLowercase() {
  try {
    console.log("Starting role migration: UPPERCASE → lowercase...\n");

    let totalUpdated = 0;

    for (const [oldRole, newRole] of Object.entries(ROLE_MAP)) {
      const users = await prisma.user.findMany({
        where: { role: oldRole },
        select: { id: true },
      });

      if (users.length === 0) {
        console.log(`  [${oldRole}] No users found, skipping.`);
        continue;
      }

      const ids = users.map((u) => u.id);

      const result = await prisma.user.updateMany({
        where: { id: { in: ids } },
        data: { role: newRole },
      });

      console.log(`  [${oldRole}] → [${newRole}] : Updated ${result.count} user(s)`);
      totalUpdated += result.count;
    }

    console.log(`\nMigration completed. Total users updated: ${totalUpdated}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

migrateRolesToLowercase();
