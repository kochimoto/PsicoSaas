import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isVip } from "@/lib/permissions";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 });

    // Plano FREE limit check
    if (!isVip(tenant)) {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      const count = await prisma.document.count({ 
        where: { tenantId: tenant.id, createdAt: { gte: currentMonthStart } } 
      });
      if (count >= 5) {
        return NextResponse.json({ error: "LIMITE EXCEDIDO: Você atingiu sua cota de 5 envios este mês no Plano Gratuito." }, { status: 403 });
      }
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const patientId = formData.get("patientId") as string;

    if (!file || !name || !type) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    
    const doc = await prisma.document.create({
      data: {
        name,
        type,
        fileUrl: "", 
        tenantId: tenant.id,
        patientId: patientId || null,
        fileData: {
          create: {
            data: base64Data,
            mimeType: file.type || "application/pdf"
          }
        }
      }
    });

    await prisma.document.update({
      where: { id: doc.id },
      data: { fileUrl: `/api/documents/${doc.id}` }
    });

    revalidatePath("/dashboard/documentos");
    if (patientId) {
       revalidatePath(`/dashboard/pacientes/${patientId}`);
       
       // Notificação via WhatsApp AUTOMÁTICA (DELAY 2 MIN)
       if (tenant.whatsappEnabled) {
         const { sendTextMessage } = await import("@/lib/whatsapp");
         (async () => {
           setTimeout(async () => {
             try {
               const patient = await prisma.patient.findUnique({ where: { id: patientId } });
               if (patient?.phone) {
                 const instanceName = `psico_${tenant.id.substring(0, 8)}`;
                 const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal`;
                 const message = `Olá ${patient.name}, seu novo documento (${name}) já está disponível no seu portal: ${portalUrl}`;

                 let cleanPhone = patient.phone.replace(/\D/g, "");
                 if (cleanPhone.length === 10 || cleanPhone.length === 11) {
                   cleanPhone = `55${cleanPhone}`;
                 }
                 await sendTextMessage(instanceName, cleanPhone, message);
               }
             } catch (e) {
               console.error("Erro no delay API upload:", e);
             }
           }, 120000);
         })();
       }
    }

    return NextResponse.json({ success: true, id: doc.id });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao fazer upload." }, { status: 500 });
  }
}
