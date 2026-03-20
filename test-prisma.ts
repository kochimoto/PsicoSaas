import { PrismaClient } from './prisma/generated/client/index.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import "dotenv/config";

const config = {
  url: process.env.DATABASE_URL || 'file:./dev.db',
};

console.log("Config URL:", config.url);

const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Success:", user);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
