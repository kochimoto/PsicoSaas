import { PrismaClient } from './prisma/generated/client/index.js'
import { PrismaLibSql } from "@prisma/adapter-libsql"
import bcrypt from "bcryptjs"

const config = { url: "file:./dev.db" }
const adapter = new PrismaLibSql(config)
const prisma = new PrismaClient({ adapter })

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@psicosa.com' },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    },
    create: {
      email: 'admin@psicosa.com',
      name: 'Super Administrador',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    }
  });
  
  console.log("Super Admin Account:");
  console.log("Email:", admin.email);
  console.log("Senha: admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
