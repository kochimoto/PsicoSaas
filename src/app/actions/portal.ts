"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function confirmAppointmentAction(appointmentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PACIENTE") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const patientRow = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patientRow) return { error: "Paciente não encontrado" };

    const app = await db.appointment.findFirst({ where: { id: appointmentId, patientId: patientRow.id } });
    if (!app) return { error: "Sessão não existe" };

    await db.appointment.update({
      where: { id: appointmentId },
      data: { patientConfirmed: true }
    });

    revalidatePath("/portal");
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao confirmar sessão." };
  }
}

export async function confirmDocumentAction(documentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PACIENTE") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const patientRow = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patientRow) return { error: "Paciente não encontrado" };

    const doc = await db.document.findFirst({ where: { id: documentId, patientId: patientRow.id } });
    if (!doc) return { error: "Documento não encontrado" };

    await db.document.update({
      where: { id: documentId },
      data: { patientRead: true }
    });

    revalidatePath("/portal");
    revalidatePath(`/dashboard/pacientes/${patientRow.id}`);
    revalidatePath("/dashboard/documentos");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao confirmar recebimento." };
  }
}

export async function uploadPaymentProofAction(transactionId: string, base64Data: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PACIENTE") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const patientRow = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patientRow) return { error: "Paciente não encontrado" };

    const transaction = await db.transaction.findFirst({
      where: { id: transactionId, patientId: patientRow.id }
    });
    if (!transaction) return { error: "Transação não encontrada" };

    await db.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProofData: base64Data,
        status: "PAID",
      }
    });

    revalidatePath("/portal");
    revalidatePath(`/dashboard/pacientes/${patientRow.id}`);
    revalidatePath("/dashboard/financeiro");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao enviar comprovante." };
  }
}

