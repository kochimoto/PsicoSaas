"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTransactionAction(data: { description: string, amount: number, type: 'INCOME' | 'EXPENSE', date: Date, patientId?: string }) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await prisma.transaction.create({
      data: {
        description: data.description,
        amount: data.type === 'EXPENSE' ? -Math.abs(data.amount) : Math.abs(data.amount),
        type: data.type,
        date: data.date,
        status: "PAID",
        tenantId: tenant.id,
        patientId: data.patientId || null
      }
    });

    revalidatePath("/dashboard/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar lançamento" };
  }
}

export async function updateTransactionAction(id: string, data: { description: string, amount: number, date: Date, patientId?: string }) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const transaction = await prisma.transaction.findFirst({ where: { id, tenantId: tenant.id } });
    if (!transaction) return { error: "Lançamento não encontrado" };

    await prisma.transaction.update({
      where: { id },
      data: {
        description: data.description,
        amount: transaction.type === 'EXPENSE' ? -Math.abs(data.amount) : Math.abs(data.amount),
        date: data.date,
        patientId: data.patientId || null
      }
    });

    revalidatePath("/dashboard/financeiro");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao atualizar lançamento" };
  }
}
