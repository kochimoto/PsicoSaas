"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

interface PatientData {
  name: string;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createPortalAccess?: boolean;
  portalPassword?: string | null;
}

export async function createPatientAction(data: PatientData) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    if (tenant.plan === "FREE") {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      const count = await prisma.patient.count({ where: { tenantId: tenant.id, createdAt: { gte: currentMonthStart } } });
      if (count >= 10) return { error: "LIMITE EXCEDIDO: Você atingiu o limite de 10 pacientes novos neste mês (Plano Gratuito). Assine o VIP para cadastros ilimitados." };
    }

    let userId = null;

    if (data.createPortalAccess && data.email && data.portalPassword) {
      const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingUser) return { error: "Este email já possui um usuário cadastrado no sistema." };

      const defaultPassword = await bcrypt.hash(data.portalPassword, 10);
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: defaultPassword,
          role: "PACIENTE"
        }
      });
      userId = newUser.id;
    }

    await prisma.patient.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        address: data.address || null,
        notes: data.notes || null,
        tenantId: tenant.id,
        userId: userId
      }
    });

    revalidatePath("/dashboard/pacientes");
    
    return { 
      success: true, 
      message: userId 
        ? `Acesso ao Portal Criado!\n\nWebsite: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal\nE-mail: ${data.email}\nSenha: ${data.portalPassword}`
        : "Paciente cadastrado com sucesso (Sem acesso ao portal)."
    };
  } catch (err) {
    console.error(err);
    return { error: "Erro interno ao cadastrar paciente." };
  }
}

export async function updatePatientAction(id: string, data: PatientData) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const patient = await prisma.patient.findFirst({ where: { id, tenantId: tenant.id } });
    if (!patient) return { error: "Paciente não encontrado" };

    await prisma.patient.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        address: data.address || null,
        notes: data.notes || null
      }
    });

    revalidatePath("/dashboard/pacientes");
    revalidatePath(`/dashboard/pacientes/${id}`);
    return { success: true };
  } catch (err) {
    return { error: "Erro interno ao atualizar paciente." };
  }
}

export async function deletePatientAction(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };
  
  try {
    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const patient = await prisma.patient.findFirst({ where: { id, tenantId: tenant.id } });
    if (!patient) return { error: "Paciente não encontrado" };
    
    await prisma.patient.delete({ where: { id } });
    revalidatePath("/dashboard/pacientes");
    return { success: true };
  } catch(err) {
    return { error: "Erro interno ao excluir paciente." };
  }
}
