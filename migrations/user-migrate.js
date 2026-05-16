const { PrismaClient } = require("@prisma/client");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// OLD DATABASE CONNECTION
const oldDb = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "pos_bot", // change this
});
function mapRole(role) {
  if (!role) return "CASHIER";

  const normalized = role.toUpperCase();

  switch (normalized) {
    case "ADMIN":
      return "ADMIN";
    case "MANAGER":
      return "MANAGER";
    case "CASHIER":
      return "CASHIER";
    default:
      return "CASHIER";
  }
}

async function migrateUsers() {
  try {
    console.log(" Starting user migration...");

    // 1. Fetch old users
    const [users] = await oldDb.query("SELECT * FROM users");

    if (!users.length) {
      console.log(" No users found in old database");
      return;
    }

    console.log(`Found ${users.length} users`);

    // 2. Transform data
    const transformedUsers = await Promise.all(
      users.map(async (user) => {
        return {
          full_name: user.full_name,
          username: user.username,
          email: user.email,

          //  If old passwords are NOT hashed, uncomment this:
          // password_hash: await bcrypt.hash(user.password, 10),

          // If already hashed:
          password_hash: user.password_hash,

          role: mapRole(user.role),
          branch_id: user.branch_id || null,
          last_login: user.last_login ? new Date(user.last_login) : null,
        };
      }),
    );

    // 3. Insert into new DB (FAST BULK INSERT)
    const result = await prisma.user.createMany({
      data: transformedUsers,
      skipDuplicates: true, // avoids duplicate email/username errors
    });

    console.log(`Migration completed`);
    console.log(`Inserted users: ${result.count}`);
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await prisma.$disconnect();
    await oldDb.end();
  }
}

//  RUN MIGRATION
migrateUsers();