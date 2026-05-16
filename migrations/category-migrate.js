const { PrismaClient } = require("@prisma/client");
const mysql = require("mysql2/promise");

const prisma = new PrismaClient();

const oldDb = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pos_bot",
});
async function migrateCategories() {
  try {
    console.log("Starting category migration...");

    const [categories] = await oldDb.query("SELECT * FROM categories");

    if (!categories.length) {
      console.log("No categories found");
      return;
    }

    console.log(`Found ${categories.length} categories`);

    // map old_id → new_id
    const idMap = {};


    // Create categories (NO parent)

    for (const cat of categories) {
      const created = await prisma.category.create({
        data: {
          name: cat.name,
          description: cat.description || null,
          is_active:
            cat.is_active !== undefined ? Boolean(cat.is_active) : true,
          created_at: cat.created_at
            ? new Date(cat.created_at)
            : undefined,
          updated_at: cat.updated_at
            ? new Date(cat.updated_at)
            : undefined,
        },
      });

      idMap[cat.id] = created.id;
    }

    console.log("Phase 1 complete (categories created)");

    // Update parent_id
    for (const cat of categories) {
      if (cat.parent_id) {
        const newId = idMap[cat.id];
        const newParentId = idMap[cat.parent_id];

        if (newParentId) {
          await prisma.category.update({
            where: { id: newId },
            data: {
              parent_id: newParentId,
            },
          });
        }
      }
    }

    console.log("Phase 2 complete (parent relations set)");
    console.log("Category migration completed");
  } catch (error) {
    console.error(" Migration failed:", error);
  } finally {
    await prisma.$disconnect();
    await oldDb.end();
  }
}

migrateCategories();