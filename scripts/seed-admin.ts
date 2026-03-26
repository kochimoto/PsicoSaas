import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "psicogestao@admin.com";
  const password = "Intelbras-3246";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Checking if admin ${email} exists...`);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
    create: {
      email,
      name: "Super Admin PsicoGestão",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("✅ Super Admin created/updated successfully!");
  console.log("Email:", admin.email);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
