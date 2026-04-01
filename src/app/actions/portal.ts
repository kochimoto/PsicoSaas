"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

    const tenant = await db.tenant.findUnique({ where: { id: app.tenantId } });
    if (tenant) {
      await createNotification({
        tenantId: tenant.id,
        userId: tenant.ownerId,
        title: "Presença Confirmada",
        message: `O paciente ${patientRow.name} confirmou presença para a sessão de ${format(app.date, "dd/MM 'às' HH:mm", { locale: ptBR })}.`,
        type: "APPOINTMENT_CONFIRMED",
        link: "/dashboard/agenda"
      });
    }

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
        // Status remains PENDING until professional approves
      }
    });

    const tenant = await db.tenant.findUnique({ where: { id: transaction.tenantId } });
    if (tenant) {
      await createNotification({
        tenantId: tenant.id,
        userId: tenant.ownerId,
        title: "Comprovante Recebido",
        message: `O paciente ${patientRow.name} enviou um comprovante para: ${transaction.description}.`,
        type: "PAYMENT_PROOF_UPLOADED",
        link: "/dashboard/financeiro"
      });
    }

    revalidatePath("/portal");
    revalidatePath(`/dashboard/pacientes/${patientRow.id}`);
    revalidatePath("/dashboard/financeiro");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao enviar comprovante." };
  }
}

export async function cancelAppointmentPortalAction(appointmentId: string) {
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
      data: { status: "CANCELED" }
    });

    const tenant = await db.tenant.findUnique({ where: { id: app.tenantId } });
    if (tenant) {
      await createNotification({
        tenantId: tenant.id,
        userId: tenant.ownerId,
        title: "Sessão Cancelada",
        message: `O paciente ${patientRow.name} cancelou a sessão de ${format(app.date, "dd/MM 'às' HH:mm", { locale: ptBR })}.`,
        type: "APPOINTMENT_CANCELED",
        link: "/dashboard/agenda"
      });
    }

    revalidatePath("/portal");
    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao cancelar sessão." };
  }
}

