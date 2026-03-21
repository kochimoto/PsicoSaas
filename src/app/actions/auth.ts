"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  plan?: string;
  phone?: string;
  whereFound?: string;
}

export async function registerAction(data: RegisterData) {
  try {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return { error: "Este email já está cadastrado." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        whereFound: data.whereFound,
        role: "PSICOLOGO",
        tenantOwner: {
          create: {
            plan: data.plan || "FREE",
            clinicName: `Consultório de ${data.name.split(" ")[0]}`,
            whatsappNumber: data.phone,
          }
        }
      }
    });

    await setSession({ id: user.id, email: user.email, role: user.role, name: user.name });
    return { success: true };
  } catch (error) {
    console.error("DEBUG - Erro detalhado no registro:", error);
    return { error: "Erro interno ao criar a conta. Verifique sua conexão ou se o e-mail já existe." };
  }
}

interface LoginData {
  email: string;
  password: string;
}

export async function loginAction(data: LoginData) {
  try {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      return { error: "Credenciais inválidas." };
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      return { error: "Credenciais inválidas." };
    }

    await setSession({ id: user.id, email: user.email, role: user.role, name: user.name });
    return { success: true, role: user.role };
  } catch (error) {
    console.error(error);
    return { error: "Erro interno. Tente novamente." };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
