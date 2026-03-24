const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

async function backup() {
  const prisma = new PrismaClient();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");
  const fileName = `backup-${timestamp}.json`;
  const filePath = path.join(backupDir, fileName);

  console.log("🚀 Iniciando backup dos dados...");

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const data = {
      metadata: {
        version: "1.0",
        timestamp: new Date().toISOString(),
        description: "Backup integral do sistema PsicoGestão"
      },
      content: {
        users: await prisma.user.findMany(),
        tenants: await prisma.tenant.findMany(),
        patients: await prisma.patient.findMany(),
        appointments: await prisma.appointment.findMany(),
        services: await prisma.service.findMany(),
        transactions: await prisma.transaction.findMany(),
        documents: await prisma.document.findMany(),
        fileData: await prisma.fileData.findMany(),
        clinicalRecords: await prisma.clinicalRecord.findMany(),
        notificationLogs: await prisma.notificationLog.findMany(),
      }
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`✅ Backup concluído com sucesso!`);
    console.log(`📂 Arquivo salvo em: ${filePath}`);
    console.log(`📊 Total de registros: ${Object.values(data.content).reduce((acc, curr) => acc + curr.length, 0)}`);

  } catch (error) {
    console.error("❌ Erro ao realizar backup:", error);
  } finally {
    await prisma.$disconnect();
  }
}

backup();
