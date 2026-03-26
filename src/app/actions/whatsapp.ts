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
    
    // Tenta pegar o estado da conexão
    let instanceExists = false;
    try {
      const state = await getConnectionState(instanceName);
      instanceExists = true;
      if (state.instance?.state === "open") {
        return { connected: true };
      }
    } catch (e) {
      // Se der erro (instância não existe), vamos criar uma
      console.log("Instância não existe, criando...");
    }

    let result;
    if (instanceExists) {
      // Se existe mas não está conectada, pede um novo QR Code
      result = await connectInstance(instanceName);
    } else {
      // Se não existe, cria do zero
      result = await createInstance(instanceName);
    }
    
    // O base64 pode vir na raiz do objeto ou dentro de qrcode.base64 dependendo da rota/versão
    const qrCodeBase64 = result.base64 || result.qrcode?.base64 || result.qrcode || result.qrCode;
    
    // Se não veio QR agora, mas não deu erro, retornamos que está criando (pooling vai cuidar)
    if (!qrCodeBase64) {
      return { initializing: true, connected: false };
    }
    
    if (qrCodeBase64 && typeof qrCodeBase64 === "string" && qrCodeBase64.includes("base64")) {
      // Limpar prefixo data:image se vier
      const finalQr = qrCodeBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      return { qrcode: finalQr, connected: false };
    }

    return { error: "Não foi possível gerar o QR Code. Tente novamente." };
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
    const state = await getConnectionState(instanceName);

    return { 
      connected: state.instance?.state === "open",
      state: state.instance?.state,
      qrcode: state.qrcode
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
