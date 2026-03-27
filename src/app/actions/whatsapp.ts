"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createInstance, getQrCode, getConnectionState, sendTextMessage, deleteInstance } from "@/lib/whatsapp";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Gera o nome da instância a partir do ID do tenant
function instanceName(tenantId: string) {
  return `psico_${tenantId.substring(0, 8)}`;
}

// ─── QR Code / Conexão ─────────────────────────────────────────

/** Inicia o processo de conexão e retorna o QR Code (se disponível) */
export async function getWhatsappQrCodeAction() {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const name = instanceName(tenant.id);

    // 1. Verifica estado atual
    const state = await getConnectionState(name);

    if (state.state === "open") {
      return { connected: true };
    }

    // 2. Se não existe, cria (ignora se já existe — 409)
    if (state.state === "close") {
      await createInstance(name);
    }

    // 3. Busca o QR Code
    const qr = await getQrCode(name);

    if (qr) {
      return { qrcode: qr, connected: false };
    }

    // QR ainda não gerado — cliente vai fazer polling
    return { initializing: true, connected: false };
  } catch (error: any) {
    console.error("[WA] getWhatsappQrCodeAction:", error?.message);
    return { error: error?.message || "Erro ao conectar com o servidor de WhatsApp." };
  }
}

/** Polling: retorna estado atual + QR code se disponível */
export async function checkWhatsappStatusAction() {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { connected: false };

    const name = instanceName(tenant.id);
    const state = await getConnectionState(name);

    if (state.state === "open") {
      return { connected: true, state: "open" };
    }

    // Ainda inicializando — tenta buscar o QR
    const qr = await getQrCode(name);

    return {
      connected: false,
      state: state.state,
      qrcode: qr ?? null,
    };
  } catch {
    return { connected: false, state: "close", qrcode: null };
  }
}

/** Desconecta e deleta a instância */
export async function disconnectWhatsappAction() {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await deleteInstance(instanceName(tenant.id));
    return { success: true };
  } catch (error: any) {
    return { error: error?.message || "Erro ao desconectar." };
  }
}

// ─── Envio Manual ──────────────────────────────────────────────

function normalizePhone(phone: string): string {
  let clean = phone.replace(/\D/g, "");
  if (clean.length === 10 || clean.length === 11) clean = `55${clean}`;
  return clean;
}

/** Envia lembrete de agendamento manual */
export async function sendManualReminderAction(appointmentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { patient: true, tenant: true, service: true },
    });

    if (!appointment || !appointment.patient.phone) return { error: "Paciente sem telefone." };

    const dateStr = format(appointment.date, "dd/MM/yyyy", { locale: ptBR });
    const hourStr = format(appointment.date, "HH:mm", { locale: ptBR });

    const template = appointment.service?.whatsappMessage
      || appointment.tenant.whatsappMessage
      || "Olá {nome}, lembrete da sua consulta em {data} às {hora}.";

    const message = template
      .replace(/{nome}/g, appointment.patient.name)
      .replace(/{data}/g, dateStr)
      .replace(/{hora}/g, hourStr);

    await sendTextMessage(instanceName(appointment.tenantId), normalizePhone(appointment.patient.phone), message);

    await (prisma as any).notificationLog.create({
      data: { type: "MANUAL_APPOINTMENT", appointmentId: appointment.id, tenantId: appointment.tenantId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[WA] sendManualReminderAction:", error);
    return { error: "Erro ao enviar lembrete." };
  }
}

/** Envia lembrete de cobrança manual */
export async function sendManualPaymentReminderAction(transactionId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { patient: true, tenant: true },
    });

    if (!transaction || !transaction.patient?.phone) return { error: "Paciente sem telefone." };

    const amountStr = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(transaction.amount);

    const template = transaction.tenant.whatsappPaymentMessage
      || "Olá {nome}, lembrete do pagamento de {valor} referente a {descricao}. Link: {link_pagamento}";

    const message = template
      .replace(/{nome}/g, transaction.patient.name)
      .replace(/{valor}/g, amountStr)
      .replace(/{descricao}/g, transaction.description)
      .replace(/{link_pagamento}/g, transaction.paymentLink || "");

    if (transaction.paymentProofData) {
      const fileName = `boleto_${transaction.id.substring(0, 5)}.pdf`;
      try {
        const { sendMediaMessage } = await import("@/lib/whatsapp");
        await sendMediaMessage(instanceName(transaction.tenantId), normalizePhone(transaction.patient.phone), transaction.paymentProofData, fileName, `Segue o boleto ref. a ${transaction.description}`);
      } catch (err) {
        console.error("[WA] Failed to send media:", err);
      }
    }

    await sendTextMessage(instanceName(transaction.tenantId), normalizePhone(transaction.patient.phone), message);

    await (prisma as any).notificationLog.create({
      data: { type: "MANUAL_PAYMENT", transactionId: transaction.id, tenantId: transaction.tenantId },
    });

    return { success: true };
  } catch (error: any) {
    console.error("[WA] sendManualPaymentReminderAction:", error);
    return { error: "Erro ao enviar lembrete de pagamento." };
  }
}

/** Envia documento via WhatsApp */
export async function sendDocumentWhatsAppAction(documentId: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { patient: true, tenant: true },
    });

    if (!doc || !doc.patient?.phone) return { error: "Documento não encontrado ou paciente sem telefone." };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.laisbritoofc.com.br";
    const documentLink = `${appUrl}/api/documents/${doc.id}`;

    const template = doc.tenant.whatsappDocumentMessage
      || "Olá {nome}! Segue o link do seu documento ({documento}): {link}";

    const message = template
      .replace(/{nome}/g, doc.patient.name)
      .replace(/{documento}/g, doc.name)
      .replace(/{link}/g, documentLink);

    await sendTextMessage(instanceName(doc.tenantId), normalizePhone(doc.patient.phone), message);

    return { success: true };
  } catch (error: any) {
    console.error("[WA] sendDocumentWhatsAppAction:", error);
    return { error: "Erro ao enviar documento." };
  }
}
