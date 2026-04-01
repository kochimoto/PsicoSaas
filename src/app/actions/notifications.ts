"use server";

import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotificationsAction() {
  const session = await getSession();
  if (!session) return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return { success: true, notifications };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao buscar notificações" };
  }
}

export async function markNotificationAsReadAction(id: string) {
  const session = await getSession();
  if (!session) return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    await db.notification.update({
      where: { id, userId: session.user.id },
      data: { read: true }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao marcar notificação" };
  }
}

export async function markAllNotificationsAsReadAction() {
  const session = await getSession();
  if (!session) return { error: "Não autorizado" };

  try {
    const { prisma: db } = await import("@/lib/prisma");
    await db.notification.updateMany({
      where: { userId: session.user.id, read: false },
      data: { read: true }
    });
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Erro ao marcar todas notificações" };
  }
}

// Utility function to create a notification (Server Side internal)
export async function createNotification(data: { tenantId: string, userId: string, title: string, message: string, type: string, link?: string }) {
  try {
    const { prisma: db } = await import("@/lib/prisma");
    await db.notification.create({
      data: {
        tenantId: data.tenantId,
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link
      }
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { error: "Erro ao criar notificação" };
  }
}
