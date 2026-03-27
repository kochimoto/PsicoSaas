"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createTransactionAction(data: { description: string, amount: number, type: 'INCOME' | 'EXPENSE', date: Date, patientId?: string, serviceId?: string }) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await db.transaction.create({
      data: {
        description: data.description,
        amount: data.type === 'EXPENSE' ? -Math.abs(data.amount) : Math.abs(data.amount),
        type: data.type,
        date: data.date,
        status: "PAID",
        tenantId: tenant.id,
        patientId: data.patientId || null,
        serviceId: data.serviceId || null
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
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const transaction = await db.transaction.findFirst({ where: { id, tenantId: tenant.id } });
    if (!transaction) return { error: "Lançamento não encontrado" };

    await db.transaction.update({
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

export async function createChargeAction(data: { 
  description: string, 
  amount: number, 
  date: Date, 
  patientId: string, 
  paymentLink?: string,
  paymentMethod?: string,
  pixKey?: string
}) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await db.transaction.create({
      data: {
        description: data.description,
        amount: Math.abs(data.amount),
        type: 'INCOME',
        date: data.date,
        status: "PENDING",
        paymentLink: data.paymentLink || null,
        paymentMethod: data.paymentMethod || null,
        pixKey: data.pixKey || null,
        tenantId: tenant.id,
        patientId: data.patientId
      }
    });

    revalidatePath("/dashboard/financeiro");
    revalidatePath("/portal");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao criar cobrança" };
  }
}

export async function approveTransactionAction(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    await db.transaction.update({
      where: { id, tenantId: tenant.id },
      data: { status: "PAID" }
    });

    revalidatePath("/dashboard/financeiro");
    revalidatePath("/dashboard");
    revalidatePath("/portal");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao aprovar pagamento" };
  }
}

export async function uploadReceiptAction(transactionId: string, receiptUrl: string) {
  const session = await getSession();
  if (!session) return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const patientRow = await db.patient.findUnique({ where: { userId: session.user.id } });
    if (!patientRow) return { error: "Paciente não encontrado" };

    await db.transaction.update({
      where: { id: transactionId, patientId: patientRow.id },
      data: { receiptUrl }
    });

    revalidatePath("/portal");
    revalidatePath("/dashboard/financeiro");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao enviar comprovante" };
  }
}
