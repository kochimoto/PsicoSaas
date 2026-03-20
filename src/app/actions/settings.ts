"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateSettingsAction(data: { 
  clinicName: string;
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
}) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        clinicName: data.clinicName,
        whatsappEnabled: data.whatsappEnabled,
        whatsappNumber: data.whatsappNumber || null,
        whatsappMessage: data.whatsappMessage || null,
      }
    });

    revalidatePath("/dashboard/configuracoes");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao salvar as configurações." };
  }
}
