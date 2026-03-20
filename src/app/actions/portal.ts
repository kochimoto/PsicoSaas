"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function confirmAppointmentAction(appointmentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PACIENTE") return { error: "Não autorizado" };

  try {
    const patientRow = await prisma.patient.findUnique({ where: { userId: session.user.id } });
    if (!patientRow) return { error: "Paciente não encontrado" };

    const app = await prisma.appointment.findFirst({ where: { id: appointmentId, patientId: patientRow.id } });
    if (!app) return { error: "Sessão não existe" };

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { patientConfirmed: true }
    });

    revalidatePath("/portal");
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao confirmar sessão." };
  }
}

export async function confirmDocumentAction(documentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PACIENTE") return { error: "Não autorizado" };

  try {
    const patientRow = await prisma.patient.findUnique({ where: { userId: session.user.id } });
    if (!patientRow) return { error: "Paciente não encontrado" };

    const doc = await prisma.document.findFirst({ where: { id: documentId, patientId: patientRow.id } });
    if (!doc) return { error: "Documento não encontrado" };

    await prisma.document.update({
      where: { id: documentId },
      data: { patientRead: true }
    });

    revalidatePath("/portal");
    revalidatePath(`/dashboard/pacientes/${patientRow.id}`);
    revalidatePath("/dashboard/documentos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao confirmar recebimento." };
  }
}
