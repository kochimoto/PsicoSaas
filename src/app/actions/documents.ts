"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { isVip } from "@/lib/permissions";
import { sendTextMessage } from "@/lib/whatsapp";
import fs from "fs/promises";
import path from "path";

export async function uploadDocumentAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    if (!isVip(tenant)) {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      const count = await prisma.document.count({ where: { tenantId: tenant.id, createdAt: { gte: currentMonthStart } } });
      if (count >= 5) return { error: "LIMITE EXCEDIDO: Você atingiu sua cota de 5 envios de documentos/laudos este mês (Plano Gratuito). Assine o VIP para envios globais." };
    }

    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const patientId = formData.get("patientId") as string;

    if (!file || !name || !type) return { error: "Preencha todos os campos obrigatórios." };
    if (file.size === 0) return { error: "Arquivo vazio." };
    if (file.size > 5 * 1024 * 1024) return { error: "Arquivo muito grande (máximo 5MB)." };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString('base64');
    
    // We create the document and fileData together to maintain transaction integrity.
    // The initial fileUrl will be updated right after we get the document id,
    // or we can generate the id beforehand using cuid(). Let's let Prisma generate it and update it, 
    // or just use `/api/documents/[id]` dynamically based on the returned document ID.
    
    const doc = await prisma.document.create({
      data: {
        name,
        type,
        fileUrl: "", // Temporary, will update immediately
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

    // Atualizando o fileUrl com o ID definitivo gerado pelo banco para a rota da API funcionar
    await prisma.document.update({
      where: { id: doc.id },
      data: { fileUrl: `/api/documents/${doc.id}` }
    });

    revalidatePath("/dashboard/documentos");
    if (patientId) {
      revalidatePath(`/dashboard/pacientes/${patientId}`);
      
      // Notificação via WhatsApp
      if (tenant.whatsappEnabled) {
        const patient = await prisma.patient.findUnique({ where: { id: patientId } });
        if (patient?.phone) {
          const instanceName = `psico_${tenant.id.substring(0, 8)}`;
          const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal`;
          const messageTemplate = tenant.whatsappDocumentMessage || "Olá {nome}, seu novo documento ({nome_doc}) já está disponível no seu portal: {link}";
          
          const message = messageTemplate
            .replace(/{nome}/g, patient.name)
            .replace(/{nome_doc}/g, name)
            .replace(/{link}/g, portalUrl);

          let cleanPhone = patient.phone.replace(/\D/g, "");
          if (cleanPhone.length === 10 || cleanPhone.length === 11) {
            cleanPhone = `55${cleanPhone}`;
          }

          try {
            await sendTextMessage(instanceName, cleanPhone, message);
          } catch (e) {
            console.error("Falha ao enviar aviso de documento:", e);
          }
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Upload error:", error);
    return { error: "Erro ao fazer upload do arquivo." };
  }
}

export async function deleteDocumentAction(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };
  
  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const doc = await prisma.document.findFirst({ where: { id, tenantId: tenant.id }, include: { fileData: true } });
    if (!doc) return { error: "Arquivo não encontrado" };

    // File is now deleted automatically via cascade when document deletes (or fileData first)
    // No more fs unlinks needed since it's stored in the DB.

    await prisma.document.delete({ where: { id } });
    
    revalidatePath("/dashboard/documentos");
    if (doc.patientId) revalidatePath(`/dashboard/pacientes/${doc.patientId}`);
    
    return { success: true };
  } catch(err) {
    return { error: "Erro interno ao excluir arquivo." };
  }
}
