"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createInstance, getConnectionState, sendTextMessage, connectInstance } from "@/lib/whatsapp";
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
    
    // 1. Verifica se já existe e está conectada
    try {
      const state = await getConnectionState(instanceName);
      if (state.instance?.state === "open") {
        return { connected: true };
      }
      // Existe mas não está conectada — pede o QR via connect
    } catch (e) {
      // Instância não existe, cria ela primeiro
      console.log("Instância não existe, criando...");
      await createInstance(instanceName);
      // Aguarda um pouco para a Evolution API inicializar a instância
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // 2. Chama /instance/connect para obter o QR code
    // Na Evolution API v2, ESTE é o endpoint que retorna o QR base64
    const result = await connectInstance(instanceName);
    console.log("Connect result:", JSON.stringify(result).substring(0, 200));

    // Extrai o QR code do resultado (v2 retorna dentro de 'base64')
    const qrCodeBase64 = result?.base64 || result?.qrcode?.base64 || result?.code;
    
    if (qrCodeBase64) {
      // Remove prefixo data:image se vier junto
      const finalQr = qrCodeBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      return { qrcode: finalQr, connected: false };
    }

    // QR ainda não foi gerado (instância acabou de ser criada) — polling vai buscar
    return { initializing: true, connected: false };
  } catch (error: any) {
    console.error("Erro na API WhatsApp:", error?.message || error);
    return { error: error?.message || "Erro ao conectar com o servidor de WhatsApp." };
  }
}

export async function checkWhatsappStatusAction() {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const instanceName = `psico_${tenant.id.substring(0, 8)}`;
    
    // Verifica estado atual
    const state = await getConnectionState(instanceName);
    
    if (state.instance?.state === "open") {
      return { connected: true, state: "open" };
    }

    // Se está em connecting, tenta buscar o QR via /instance/connect
    if (state.instance?.state === "connecting" || state.instance?.state === "initializing" || state.instance?.state === "close") {
      try {
        const connectResult = await connectInstance(instanceName);
        const qrCodeBase64 = connectResult?.base64 || connectResult?.qrcode?.base64 || connectResult?.code;
        if (qrCodeBase64) {
          const finalQr = qrCodeBase64.replace(/^data:image\/[a-z]+;base64,/, "");
          return { connected: false, state: state.instance?.state, qrcode: finalQr };
        }
      } catch (e) {
        console.log("Polling connect error:", e);
      }
    }

    return { 
      connected: false,
      state: state.instance?.state,
      qrcode: null
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
      include: { patient: true, tenant: true, service: true }
    });

    if (!appointment || !appointment.patient.phone) return { error: "Agendamento ou paciente sem telefone." };

    const instanceName = `psico_${appointment.tenantId.substring(0, 8)}`;
    const dateStr = format(appointment.date, "dd/MM/yyyy", { locale: ptBR });
    const hourStr = format(appointment.date, "HH:mm", { locale: ptBR });

    let messageTemplate = appointment.service?.whatsappMessage || appointment.tenant.whatsappMessage || "Olá {nome}, lembrete da sua consulta em {data} às {hora}.";
    let message = messageTemplate
      .replace(/{nome}/g, appointment.patient.name)
      .replace(/{data}/g, dateStr)
      .replace(/{hora}/g, hourStr);

    let cleanPhone = appointment.patient.phone.replace(/\D/g, "");
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    await sendTextMessage(instanceName, cleanPhone, message);
    
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

    const messageTemplate = transaction.tenant.whatsappPaymentMessage || "Olá {nome}, passando para lembrar do pagamento de {valor} referente a {descricao}. Link: {link_pagamento}";
    const message = messageTemplate
      .replace(/{nome}/g, transaction.patient.name)
      .replace(/{valor}/g, amountStr)
      .replace(/{descricao}/g, transaction.description)
      .replace(/{link_pagamento}/g, transaction.paymentLink || "");

    let cleanPhone = transaction.patient.phone.replace(/\D/g, "");
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    await sendTextMessage(instanceName, cleanPhone, message);

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

export async function sendDocumentWhatsAppAction(documentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { patient: true, tenant: true }
    });

    if (!doc || !doc.patient?.phone) return { error: "Documento não encontrado ou paciente sem telefone." };

    const instanceName = `psico_${doc.tenantId.substring(0, 8)}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const documentLink = `${appUrl}/api/documents/${doc.id}`;

    const messageTemplate = doc.tenant.whatsappDocumentMessage || "Olá {nome}! Segue o link do seu documento ({documento}): {link}";
    const message = messageTemplate
      .replace(/{nome}/g, doc.patient.name)
      .replace(/{documento}/g, doc.name)
      .replace(/{link}/g, documentLink);

    let cleanPhone = doc.patient.phone.replace(/\D/g, "");
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = `55${cleanPhone}`;
    }

    await sendTextMessage(instanceName, cleanPhone, message);

    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao enviar documento via WhatsApp." };
  }
}
