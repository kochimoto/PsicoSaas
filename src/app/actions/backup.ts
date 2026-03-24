"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function exportDataAction() {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") {
    return { error: "Não autorizado" };
  }

  try {
    const tenant = await prisma.tenant.findUnique({ 
      where: { ownerId: session.user.id } 
    });

    if (!tenant) return { error: "Clínica não encontrada" };

    // We filter by tenantId to ensure the psychologist only exports their own data
    const data = {
      metadata: {
        timestamp: new Date().toISOString(),
        clinicName: tenant.clinicName,
        exporter: session.user.name
      },
      content: {
        patients: await prisma.patient.findMany({ where: { tenantId: tenant.id } }),
        appointments: await prisma.appointment.findMany({ where: { tenantId: tenant.id } }),
        transactions: await prisma.transaction.findMany({ where: { tenantId: tenant.id } }),
        services: await prisma.service.findMany({ where: { tenantId: tenant.id } }),
        documents: await prisma.document.findMany({ where: { tenantId: tenant.id } }),
        // For security and size, we don't dump all fileData here unless requested, 
        // but we can include it for a full backup.
        fileData: await prisma.fileData.findMany({ 
          where: { document: { tenantId: tenant.id } } 
        }),
        clinicalRecords: await prisma.clinicalRecord.findMany({ where: { tenantId: tenant.id } }),
      }
    };

    return { 
      success: true, 
      data: JSON.stringify(data, null, 2),
      filename: `backup-psicogestao-${new Date().toISOString().split('T')[0]}.json`
    };

  } catch (error) {
    console.error("Export error:", error);
    return { error: "Erro ao exportar dados." };
  }
}
