"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getConnectionState, createInstance, connectInstance } from "@/lib/whatsapp";

async function verifySuperAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("Não autorizado");
  }
}

export async function updateTenantPlanAction(tenantId: string, plan: string) {
  try {
    await verifySuperAdmin();
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { plan }
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao atualizar plano" };
  }
}

export async function deleteAccountAction(userId: string) {
  try {
    await verifySuperAdmin();
    // Safety check: Cannot delete yourself
    const session = await getSession();
    if (session?.user?.id === userId) {
      return { error: "Você não pode excluir a sua própria conta de Super Admin." };
    }
    
    // Deleting the user automatically cascades to Tenant and all related items
    await prisma.user.delete({ where: { id: userId } });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao excluir conta" };
  }
}

export async function resetPasswordAction(userId: string, newPass: string) {
  try {
    await verifySuperAdmin();
    
    // Require minimum 6 chars
    if (newPass.length < 6) return { error: "A senha precisa ter no mínimo 6 caracteres." };

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao redefinir senha" };
  }
}

export async function getSystemWhatsappStatusAction() {
  try {
    await verifySuperAdmin();
    const instanceName = process.env.WHATS_MASTER_INSTANCE || "psico_system_master";
    const state = await getConnectionState(instanceName).catch(() => null);
    
    return { 
      connected: state?.instance?.state === "open",
      state: state?.instance?.state || "offline"
    };
  } catch (error) {
    return { connected: false, error: "Erro ao checar status" };
  }
}

export async function getSystemWhatsappQrCodeAction() {
  try {
    await verifySuperAdmin();
    const instanceName = process.env.WHATS_MASTER_INSTANCE || "psico_system_master";
    
    let result = await connectInstance(instanceName).catch(async () => {
      return await createInstance(instanceName);
    });

    const qrCodeBase64 = result.base64 || result.qrcode?.base64 || result.qrcode;
    
    if (qrCodeBase64 && typeof qrCodeBase64 === "string") {
      const finalQr = qrCodeBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      return { qrcode: finalQr };
    }

    return { error: "Não foi possível gerar o QR Code." };
  } catch (error: any) {
    return { error: error?.message || "Erro ao conectar com o servidor." };
  }
}

