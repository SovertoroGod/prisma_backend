const { PrismaClient } = require("@prisma/client");
const mysql = require("mysql2/promise");

const prisma = new PrismaClient();

// OLD DATABASE CONNECTION
const oldDb = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pos_bot", // change this
});

async function migrateBranches() {
  try {
    console.log("Starting branch migration...");

    // 1. Fetch old branches
    const [branches] = await oldDb.query("SELECT * FROM branches");

    if (!branches.length) {
      console.log("No branches found in old database");
      return;
    }

    console.log(`Found ${branches.length} branches`);

    // 2. Transform data
    const transformedBranches = branches.map((branch) => ({
      branch_code: branch.branch_code,
      branch_name: branch.branch_name,
      address: branch.address,
      phone_number: branch.phone_number || null,
      is_active:
        branch.is_active !== undefined ? Boolean(branch.is_active) : true,
      created_at: branch.created_at ? new Date(branch.created_at) : undefined,
      updated_at: branch.updated_at ? new Date(branch.updated_at) : undefined,
    }));

    // 3. Insert into Prisma (bulk insert)
    const result = await prisma.branch.createMany({
      data: transformedBranches,
      skipDuplicates: true, // avoids duplicate branch_code / branch_name
    });

    console.log("Branch migration completed");
    console.log(`Inserted branches: ${result.count}`);
  } catch (error) {
    console.error("Branch migration failed:", error);
  } finally {
    await prisma.$disconnect();
    await oldDb.end();
  }
}

// 🚀 RUN MIGRATION
migrateBranches();