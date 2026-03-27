"use server";

import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { differenceInDays } from "date-fns";

interface PatientData {
  name: string;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createPortalAccess?: boolean;
  portalLogin?: string | null;
  portalPassword?: string | null;
  active?: boolean;
  birthDate?: string | null;
  origin?: string | null;
  treatmentStart?: string | null;
}

export async function createPatientAction(data: PatientData) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const trialDaysLimit = 7;
    const daysSinceCreated = differenceInDays(new Date(), tenant.createdAt);
    const isTrialActive = daysSinceCreated < trialDaysLimit;
    const isVip = tenant.plan !== "FREE" || isTrialActive;

    if (!isVip) {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);
      const count = await db.patient.count({ where: { tenantId: tenant.id, createdAt: { gte: currentMonthStart } } });
      if (count >= 10) return { error: "LIMITE EXCEDIDO: Você atingiu o limite de 10 pacientes novos neste mês (Plano Gratuito). Assine o VIP para cadastros ilimitados ou aguarde o próximo mês." };
    }

    let userId = null;
    
    if (data.createPortalAccess && data.portalLogin && data.portalPassword) {
      const existingUser = await db.user.findUnique({ where: { email: data.portalLogin } });
      if (existingUser) return { error: "Este nome de usuário/e-mail já está em uso para acesso ao portal." };
    
      const hashedPassword = await bcrypt.hash(data.portalPassword, 10);
      const newUser = await db.user.create({
        data: {
          name: data.name,
          email: data.portalLogin,
          password: hashedPassword,
          role: "PACIENTE"
        }
      });
      userId = newUser.id;
    }

    await db.patient.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        address: data.address || null,
        notes: data.notes || null,
        birthDate: (data.birthDate && !isNaN(Date.parse(data.birthDate))) ? new Date(data.birthDate) : null,
        origin: data.origin || null,
        treatmentStart: (data.treatmentStart && !isNaN(Date.parse(data.treatmentStart))) ? new Date(data.treatmentStart) : null,
        tenantId: tenant.id,
        userId: userId
      }
    });

    revalidatePath("/dashboard/pacientes");
    
    return { 
      success: true, 
      message: userId 
        ? `Acesso ao Portal Criado!\n\nWebsite: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/portal\nUsuário: ${data.portalLogin}\nSenha: ${data.portalPassword}`
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
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const patient = await db.patient.findFirst({ where: { id, tenantId: tenant.id }, include: { user: true } });
    if (!patient) return { error: "Paciente não encontrado" };

    // Atualiza dados do Usuário (Portal) se existirem
    if (patient.userId) {
      const updateData: any = {};
      
      // Se informou nova senha
      if (data.portalPassword) {
        updateData.password = await bcrypt.hash(data.portalPassword, 10);
      }

      // Se alterou o login/email
      if (data.portalLogin && data.portalLogin !== patient.user?.email) {
        const existing = await db.user.findUnique({ where: { email: data.portalLogin } });
        if (existing) return { error: "Este novo login/e-mail já está em uso." };
        updateData.email = data.portalLogin;
      }

      if (Object.keys(updateData).length > 0) {
        await db.user.update({
          where: { id: patient.userId },
          data: updateData
        });
      }
    }

    await db.patient.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        address: data.address || null,
        notes: data.notes || null,
        active: data.active,
        birthDate: (data.birthDate && !isNaN(Date.parse(data.birthDate))) ? new Date(data.birthDate) : null,
        origin: data.origin || null,
        treatmentStart: (data.treatmentStart && !isNaN(Date.parse(data.treatmentStart))) ? new Date(data.treatmentStart) : null,
      }
    });

    revalidatePath("/dashboard/pacientes");
    revalidatePath(`/dashboard/pacientes/${id}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro interno ao atualizar paciente." };
  }
}

export async function deletePatientAction(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };
  
  try {
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const patient = await db.patient.findFirst({ where: { id, tenantId: tenant.id } });
    if (!patient) return { error: "Paciente não encontrado" };
    
    await db.patient.delete({ where: { id } });
    revalidatePath("/dashboard/pacientes");
    return { success: true };
  } catch(err) {
    console.error(err);
    return { error: "Erro interno ao excluir paciente." };
  }
}

export async function togglePatientStatusAction(id: string) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const tenant = await db.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return { error: "Clínica não encontrada" };

    const patient = await db.patient.findFirst({ where: { id, tenantId: tenant.id } });
    if (!patient) return { error: "Paciente não encontrado" };

    await db.patient.update({
      where: { id },
      data: { active: !patient.active }
    });

    revalidatePath("/dashboard/pacientes");
    revalidatePath(`/dashboard/pacientes/${id}`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro interno ao alterar status do paciente." };
  }
}
