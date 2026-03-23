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

    console.log("DEBUG - Dados recebidos no registro:", { ...data, password: "[REDACTED]" });
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        whereFound: data.whereFound,
        role: "PSICOLOGO",
        tenantOwner: {
          create: {
            plan: "FREE",
            clinicName: `Consultório de ${data.name.split(" ")[0]}`,
            whatsappNumber: data.phone,
          }
        }
      }
    });

    console.log("DEBUG - Usuário e Tenant criados com sucesso:", user.id);
    await setSession({ id: user.id, email: user.email, role: user.role, name: user.name });
    return { success: true };
  } catch (error) {
    console.error("DEBUG - Erro crítico no registro:", error);
    if (error instanceof Error) {
      console.error("DEBUG - Mensagem do erro:", error.message);
      console.error("DEBUG - Stack trace:", error.stack);
    }
    return { error: `Erro ao criar a conta: ${error instanceof Error ? error.message : "Erro desconhecido"}` };
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

    if (!user.password) {
      return { error: "Esta conta foi criada com o Google. Por favor, entre usando o botão do Google." };
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
