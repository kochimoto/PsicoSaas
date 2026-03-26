"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendTextMessage } from "@/lib/whatsapp";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function createAppointmentAction(data: { patientId: string, date: Date, notes?: string, recurring?: "NONE" | "WEEKLY" | "BIWEEKLY", occurrences?: number, serviceId?: string | null }) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const recurrence = data.recurring || "NONE";
    const loops = recurrence === "NONE" ? 1 : Math.max(1, Math.min(24, data.occurrences || 4));
    const datesToBook: Date[] = [];

    let currentDate = new Date(data.date);
    for (let i = 0; i < loops; i++) {
       datesToBook.push(new Date(currentDate));
       if (recurrence === "WEEKLY") {
         currentDate.setDate(currentDate.getDate() + 7);
       } else if (recurrence === "BIWEEKLY") {
         currentDate.setDate(currentDate.getDate() + 14);
       }
    }

    const creates = datesToBook.map(d => ({
        date: d,
        notes: data.notes || null,
        tenantId: tenant.id,
        patientId: data.patientId
    }));

    await prisma.appointment.createMany({ data: creates });

    // --- Lógica de WhatsApp ---
    if (tenant.whatsappEnabled && tenant.whatsappNumber) {
      const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
      const instanceName = `psico_${tenant.id.substring(0, 8)}`;

      if (patient && patient.phone) {
        for (const appointment of datesToBook) {
          const dateStr = format(appointment, "dd/MM/yyyy", { locale: ptBR });
          const hourStr = format(appointment, "HH:mm", { locale: ptBR });
          
          let message = tenant.whatsappMessage || "Olá {nome}, passando para confirmar sua consulta em {data} às {hora}.";
          message = message
            .replace(/{nome}/g, patient.name)
            .replace(/{data}/g, dateStr)
            .replace(/{hora}/g, hourStr);

          // Enviar sem travar a resposta principal (fogo e esqueça)
          sendTextMessage(instanceName, patient.phone, message).catch(err => {
             console.error("Erro ao enviar WhatsApp automático:", err);
          });
        }
      }
    }
    // ---------------------------

    revalidatePath("/dashboard/agenda");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao agendar sessão" };
  }
}

export async function updateAppointmentDateAction(id: string, date: Date) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const app = await prisma.appointment.findFirst({ where: { id, tenantId: tenant.id } });
    if (!app) return { error: "Sessão não existe" };

    await prisma.appointment.update({
      where: { id },
      data: { date }
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath("/portal");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao remarcar sessão." };
  }
}

export async function updateAppointmentStatusAction(id: string, status: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const app = await prisma.appointment.findFirst({ where: { id, tenantId: tenant.id } });
    if (!app) return { error: "Sessão não existe" };

    await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    revalidatePath("/dashboard/agenda");
    revalidatePath("/portal");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar status." };
  }
}
