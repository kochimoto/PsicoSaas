import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("teste123", 10);
  
  // Find a tenant to link to
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.error("No tenant found");
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: "Paciente de Teste Antigravity",
      email: "teste_portal",
      password: hashedPassword,
      role: "PACIENTE"
    }
  });

  await prisma.patient.create({
    data: {
      name: "Paciente de Teste Antigravity",
      userId: user.id,
      tenantId: tenant.id
    }
  });

  console.log("Test patient created: teste_portal / teste123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
