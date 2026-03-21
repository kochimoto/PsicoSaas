"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createServiceAction(data: { name: string, price: number, description?: string }) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
        tenantId: tenant.id
      }
    });

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao criar serviço" };
  }
}

export async function updateServiceAction(id: string, data: { name: string, price: number, description?: string }) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await prisma.service.update({
      where: { id, tenantId: tenant.id },
      data: {
        name: data.name,
        price: data.price,
        description: data.description
      }
    });

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao atualizar serviço" };
  }
}

export async function deleteServiceAction(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await prisma.service.delete({
      where: { id, tenantId: tenant.id }
    });

    revalidatePath("/dashboard/servicos");
    return { success: true };
  } catch (error) {
    return { error: "Erro ao excluir serviço" };
  }
}

export async function getServicesAction() {
  const session = await getSession();
  if (!session) return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const services = await prisma.service.findMany({
      where: { tenantId: tenant.id },
      orderBy: { name: 'asc' }
    });

    return { services };
  } catch (error) {
    return { error: "Erro ao buscar serviços" };
  }
}
