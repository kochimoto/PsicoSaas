import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("WhatsApp Webhook received:", body);

    // O evento de mensagem recebida no WPPConnect Server é 'onmessage'
    if (body.event === "onmessage" && !body.isGroupMsg) {
      const text = body.body || "";
      const phone = body.phone ? body.phone.replace(/\D/g, "") : "";

      // Lógica simples de confirmação
      if (text.toLowerCase().includes("confirm") || text.toLowerCase() === "sim") {
        // Busca o último agendamento pendente desse paciente pelo telefone
        // Nota: Isso requer que o telefone no banco esteja no mesmo formato que vem do Zap
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
            console.log(`Agendamento ${lastAppointment.id} confirmado via WhatsApp.`);
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
