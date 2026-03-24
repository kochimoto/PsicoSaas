const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

async function main() {
  const prisma = new PrismaClient();
  const hashedPassword = await bcrypt.hash("teste123", 10);
  
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
  await prisma.$disconnect();
}

main().catch(console.error);
