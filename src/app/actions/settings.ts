"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSettingsAction(data: { 
  clinicName?: string;
  whatsappEnabled?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  whatsappPaymentMessage?: string;
  services?: { id: string, whatsappMessage: string }[];
}) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const updateData: any = {};
    if (data.clinicName !== undefined) updateData.clinicName = data.clinicName;
    if (data.whatsappEnabled !== undefined) updateData.whatsappEnabled = data.whatsappEnabled;
    if (data.whatsappNumber !== undefined) updateData.whatsappNumber = data.whatsappNumber || null;
    if (data.whatsappMessage !== undefined) updateData.whatsappMessage = data.whatsappMessage || null;
    if (data.whatsappPaymentMessage !== undefined) updateData.whatsappPaymentMessage = data.whatsappPaymentMessage || null;

    if (Object.keys(updateData).length > 0) {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: updateData
      });
    }

    if (data.services && data.services.length > 0) {
      // Atualiza os services individualmente usando update
      for (const service of data.services) {
         // Garantir que esse serviço pertence a esse tenant
         await prisma.service.updateMany({
           where: { id: service.id, tenantId: tenant.id },
           data: { whatsappMessage: service.whatsappMessage || null }
         });
      }
    }

    revalidatePath("/dashboard/configuracoes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao salvar as configurações." };
  }
}
