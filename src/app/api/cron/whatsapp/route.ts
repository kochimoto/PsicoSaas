import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTextMessage } from "@/lib/whatsapp";
import { format, addHours, addDays, subDays, startOfHour, endOfHour } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(request: Request) {
  // Opcional: Proteger via API Key ou Header do Secret do Vercel
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (key !== process.env.WHATS_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: any[] = [];

  try {
    // 1. LEMBRETES DE CONSULTA (24h e 3h)
    await processAppointmentReminders(now, 24, "APPOINTMENT_24H", results);
    await processAppointmentReminders(now, 3, "APPOINTMENT_3H", results);

    // 2. LEMBRETES DE PAGAMENTO (3d, 2d, 1d antes e 1d, 2d depois)
    await processPaymentReminders(now, 3, "PAYMENT_3D_BEFORE", results);
    await processPaymentReminders(now, 2, "PAYMENT_2D_BEFORE", results);
    await processPaymentReminders(now, 1, "PAYMENT_1D_BEFORE", results);
    await processPaymentReminders(now, -1, "PAYMENT_1D_AFTER", results);
    await processPaymentReminders(now, -2, "PAYMENT_2D_AFTER", results);

    return NextResponse.json({ success: true, processed: results.length, details: results });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

async function processAppointmentReminders(now: Date, hours: number, type: string, results: any[]) {
  const targetDateStart = addHours(now, hours);
  const targetDateEnd = addHours(now, hours + 1);

  const appointments = await prisma.appointment.findMany({
    where: {
      date: { gte: targetDateStart, lte: targetDateEnd },
      status: "SCHEDULED",
      tenant: { whatsappEnabled: true },
      notificationLogs: { 
        none: { type } 
      }
    },
    include: { 
      patient: true, 
      tenant: true 
    }
  }) as any[];

  for (const app of appointments) {
    if (!app.patient.phone) continue;

    const instanceName = `psico_${app.tenantId.substring(0, 8)}`;
    const dateStr = format(app.date, "dd/MM/yyyy", { locale: ptBR });
    const hourStr = format(app.date, "HH:mm", { locale: ptBR });

    let message = app.tenant.whatsappMessage || "Olá {nome}, lembrete da sua consulta em {data} às {hora}.";
    message = message
      .replace(/{nome}/g, app.patient.name)
      .replace(/{data}/g, dateStr)
      .replace(/{hora}/g, hourStr);

    try {
      await sendTextMessage(instanceName, (app.patient as any).phone, message);
      await (prisma as any).notificationLog.create({
        data: { type, appointmentId: app.id, tenantId: app.tenantId }
      });
      results.push({ appId: app.id, type });
    } catch (e) {
      console.error(`Falha ao enviar ${type} para ${app.id}:`, e);
    }
  }
}

async function processPaymentReminders(now: Date, days: number, type: string, results: any[]) {
  // Calcula o dia alvo (ex: 3 dias antes do pagamento)
  const targetDate = addDays(now, days);
  
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { 
        gte: new Date(targetDate.setHours(0,0,0,0)), 
        lte: new Date(targetDate.setHours(23,59,59,999)) 
      },
      status: "PENDING",
      type: "INCOME",
      tenant: { whatsappEnabled: true },
      notificationLogs: { 
        none: { type } 
      }
    },
    include: { 
      patient: true, 
      tenant: true 
    }
  }) as any[];

  for (const tx of transactions) {
    if (!tx.patient?.phone) continue;

    const instanceName = `psico_${tx.tenantId.substring(0, 8)}`;
    const amountStr = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(tx.amount);
    
    let message = "";
    if (days > 0) {
      message = `Olá ${tx.patient.name}, passando para lembrar que seu pagamento de ${amountStr} vence em ${days} dia(s) (${format(tx.date, "dd/MM")}).`;
    } else {
      message = `Olá ${tx.patient.name}, notamos que o pagamento de ${amountStr} está atrasado há ${Math.abs(days)} dia(s). Caso já tenha pago, desconsidere.`;
    }

    try {
      await sendTextMessage(instanceName, (tx.patient as any).phone, message);
      await (prisma as any).notificationLog.create({
        data: { type, transactionId: tx.id, tenantId: tx.tenantId }
      });
      results.push({ txId: tx.id, type });
    } catch (e) {
      console.error(`Falha ao enviar ${type} para ${tx.id}:`, e);
    }
  }
}
