const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function migrateProducts() {
  console.log("Starting product migration...");

  // Step 1: Get all existing products
  const oldProducts = await prisma.product.findMany({
    include: { inventories: true },
  });
  console.log(`Found ${oldProducts.length} existing products`);

  let migratedLists = 0;
  let migratedItems = 0;
  let migratedUnits = 0;

  for (const oldProduct of oldProducts) {
    // Create ProductList from old Product
    const productList = await prisma.productList.create({
      data: {
        name: oldProduct.name,
        description: oldProduct.description,
        category_id: oldProduct.category_id,
        is_active: oldProduct.is_active,
        created_at: oldProduct.created_at,
        updated_at: oldProduct.updated_at,
      },
    });
    migratedLists++;

    // Create ProductItem from old Product (one-to-one mapping)
    const productItem = await prisma.productItem.create({
      data: {
        product_list_id: productList.id,
        sku: oldProduct.sku,
        name: "Default",
        price: oldProduct.price,
        is_active: oldProduct.is_active,
        created_at: oldProduct.created_at,
        updated_at: oldProduct.updated_at,
      },
    });
    migratedItems++;

    // Migrate Inventory records to ProductUnit
    for (const inv of oldProduct.inventories) {
      await prisma.productUnit.create({
        data: {
          product_item_id: productItem.id,
          branch_id: inv.branch_id,
          quantity: inv.quantity,
          created_at: inv.created_at,
          updated_at: inv.updated_at,
        },
      });
      migratedUnits++;
    }
  }

  console.log(`Created ${migratedLists} product lists`);
  console.log(`Created ${migratedItems} product items`);
  console.log(`Created ${migratedUnits} product units`);
  console.log("Product migration completed successfully!");
}

migrateProducts()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
