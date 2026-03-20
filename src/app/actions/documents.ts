"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

export async function uploadDocumentAction(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    if (tenant.plan === "FREE") {
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

    // Save locally
    const uploadDir = path.join(process.cwd(), "public/uploads", tenant.id);
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop() || "pdf";
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${tenant.id}/${uniqueFilename}`;

    await prisma.document.create({
      data: {
        name,
        type,
        fileUrl,
        tenantId: tenant.id,
        patientId: patientId || null
      }
    });

    revalidatePath("/dashboard/documentos");
    if (patientId) revalidatePath(`/dashboard/pacientes/${patientId}`);

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

    const doc = await prisma.document.findFirst({ where: { id, tenantId: tenant.id } });
    if (!doc) return { error: "Arquivo não encontrado" };

    // Fs unlink ignores errors to prevent db mismatch
    const filePath = path.join(process.cwd(), "public", doc.fileUrl);
    await fs.unlink(filePath).catch(() => {});

    await prisma.document.delete({ where: { id } });
    
    revalidatePath("/dashboard/documentos");
    if (doc.patientId) revalidatePath(`/dashboard/pacientes/${doc.patientId}`);
    
    return { success: true };
  } catch(err) {
    return { error: "Erro interno ao excluir arquivo." };
  }
}
