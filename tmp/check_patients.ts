import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tenants = await prisma.tenant.findMany({
    include: {
      _count: {
        select: { patients: true }
      }
    }
  });

  console.log("Tenants found:", tenants.length);
  for (const t of tenants) {
    console.log(`Tenant ID: ${t.id}, OwnerID: ${t.ownerId}, Patients Count: ${t._count.patients}`);
    const patients = await prisma.patient.findMany({
      where: { tenantId: t.id }
    });
    for (const p of patients) {
      console.log(`  - Patient: ${p.name}, Active: ${p.active}, CreatedAt: ${p.createdAt}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
