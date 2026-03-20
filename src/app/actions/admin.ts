"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

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
