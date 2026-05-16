const prisma = require("./prismaClient");

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log(users);
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();