"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addClinicalRecord(patientId: string, content: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, tenantId: tenant.id }
    });

    if (!patient) return { error: "Paciente não encontrado" };

    await prisma.clinicalRecord.create({
      data: {
        content,
        patientId,
        tenantId: tenant.id,
      }
    });

    revalidatePath(`/dashboard/pacientes/${patientId}`);
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Erro ao salvar a evolução." };
  }
}
