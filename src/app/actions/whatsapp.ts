"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createInstance, getConnectionState, sendTextMessage } from "@/lib/whatsapp";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function getWhatsappQrCodeAction() {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const instanceName = `psico_${tenant.id.substring(0, 8)}`;
    
    // Tenta pegar o estado da conexão
    try {
      const state = await getConnectionState(instanceName);
      if (state.instance?.state === "open") {
        return { connected: true };
      }
    } catch (e) {
      // Se der erro (instância não existe), vamos criar uma
      console.log("Instância não existe, criando...");
    }

    // Cria/Busca QR Code
    const result = await createInstance(instanceName);
    
    if (result.qrcode?.base64) {
      return { qrcode: result.qrcode.base64, connected: false };
    }

    return { error: "Não foi possível gerar o QR Code. Tente novamente." };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao conectar com o servidor de WhatsApp." };
  }
}

export async function checkWhatsappStatusAction() {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const instanceName = `psico_${tenant.id.substring(0, 8)}`;
    const state = await getConnectionState(instanceName);

    return { 
      connected: state.instance?.state === "open",
      state: state.instance?.state 
    };
  } catch (error) {
    return { connected: false, error: "Servidor offline" };
  }
}

export async function sendManualReminderAction(appointmentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, tenant: true }
    });

    if (!appointment || !appointment.patient.phone) return { error: "Agendamento ou paciente sem telefone." };

    const instanceName = `psico_${appointment.tenantId.substring(0, 8)}`;
    const dateStr = format(appointment.date, "dd/MM/yyyy", { locale: ptBR });
    const hourStr = format(appointment.date, "HH:mm", { locale: ptBR });

    let message = appointment.tenant.whatsappMessage || "Olá {nome}, lembrete da sua consulta em {data} às {hora}.";
    message = message
      .replace(/{nome}/g, appointment.patient.name)
      .replace(/{data}/g, dateStr)
      .replace(/{hora}/g, hourStr);

    await sendTextMessage(instanceName, appointment.patient.phone, message);
    
    // Log do envio
    await (prisma as any).notificationLog.create({
      data: {
        type: "MANUAL_APPOINTMENT",
        appointmentId: appointment.id,
        tenantId: appointment.tenantId
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao enviar mensagem." };
  }
}

export async function sendManualPaymentReminderAction(transactionId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { patient: true, tenant: true }
    });

    if (!transaction || !transaction.patient?.phone) return { error: "Transação ou paciente sem telefone." };

    const instanceName = `psico_${transaction.tenantId.substring(0, 8)}`;
    const amountStr = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(transaction.amount);

    const message = `Olá ${transaction.patient.name}, passando para lembrar do pagamento de ${amountStr} referente a ${transaction.description}.`;

    await sendTextMessage(instanceName, transaction.patient.phone, message);

    // Log do envio
    await (prisma as any).notificationLog.create({
      data: {
        type: "MANUAL_PAYMENT",
        transactionId: transaction.id,
        tenantId: transaction.tenantId
      }
    });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao enviar lembrete de pagamento." };
  }
}
