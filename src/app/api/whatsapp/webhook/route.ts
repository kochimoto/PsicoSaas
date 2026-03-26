import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("WhatsApp Webhook received:", body);

    // O evento de mensagem recebida na Evolution API v2 é 'messages.upsert'
    if (body.event === "messages.upsert" && !body.data?.key?.fromMe) {
      const data = body.data;
      const message = data.message;
      const text = message?.conversation || message?.extendedTextMessage?.text || "";
      const remoteJid = data.key?.remoteJid || "";
      const phone = remoteJid.split("@")[0].replace(/\D/g, "");

      // Lógica simples de confirmação
      if (text.toLowerCase().includes("confirm") || text.toLowerCase() === "sim" || text.toLowerCase() === "1") {
        // Busca o último agendamento pendente desse paciente pelo telefone
        const patient = await prisma.patient.findFirst({
          where: { phone: { contains: phone } }
        });

        if (patient) {
          const lastAppointment = await prisma.appointment.findFirst({
            where: { 
              patientId: patient.id,
              status: "PENDENTE"
            },
            orderBy: { date: "asc" }
          });

          if (lastAppointment) {
            await prisma.appointment.update({
              where: { id: lastAppointment.id },
              data: { status: "CONFIRMADO" }
            });
            console.log(`Agendamento ${lastAppointment.id} confirmado via Evolution.`);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
