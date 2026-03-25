"use server";

import { prisma } from "@/lib/prisma";
import { setSession, clearSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { sendTextMessage } from "@/lib/whatsapp";
import crypto from "crypto";

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
    const verificationToken = crypto.randomBytes(32).toString("hex");

    console.log("DEBUG - Dados recebidos no registro:", { ...data, password: "[REDACTED]" });
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        whereFound: data.whereFound,
        verificationToken,
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

    // Enviar Boas-Vindas via WhatsApp do Sistema
    if (data.phone) {
      try {
        const masterInstance = process.env.WHATS_MASTER_INSTANCE || "psico_system_master";
        let cleanPhone = data.phone.replace(/\D/g, "");
        if (cleanPhone.length === 10 || cleanPhone.length === 11) {
          cleanPhone = `55${cleanPhone}`;
        }
        const welcomeMsg = `Olá ${data.name.split(" ")[0]}! 🌟 Seja bem-vindo(a) ao PsicoGestão.\n\nFicamos muito felizes em ter você conosco. Sua conta foi criada com sucesso e você já pode começar a organizar seu consultório.\n\nSe precisar de qualquer ajuda, é só chamar por aqui!`;
        await sendTextMessage(masterInstance, cleanPhone, welcomeMsg);
      } catch (err) {
        console.error("Erro ao enviar boas-vindas WhatsApp:", err);
      }
    }

    // Mock Envio de E-mail
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const host = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
    const verifyLink = `${protocol}://${host.replace(/^https?:\/\//, "")}/verify-email?token=${verificationToken}`;
    console.log("-----------------------------------------");
    console.log("EMAIL VERIFICATION LINK (MOCK):", verifyLink);
    console.log("-----------------------------------------");

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
      return { error: "Esta conta não possui uma senha definida. Por favor, entre em contato com o suporte." };
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      return { error: "Credenciais inválidas." };
    }

    // Verificar se o e-mail foi verificado (apenas para Psicólogos)
    if (user.role === "PSICOLOGO" && !user.emailVerified) {
      return { error: "Por favor, verifique seu e-mail antes de acessar. Verifique sua caixa de entrada (ou spam)." };
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
