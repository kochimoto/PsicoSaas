import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Mercado Pago Webhook recebido:", body);

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
      return new NextResponse("Token não configurado", { status: 500 });
    }

    // Identifica se é notificação de Assinatura (Preapproval)
    if (body.type === "subscription_preapproval") {
      const preapprovalId = body.data?.id;

      if (!preapprovalId) return new NextResponse("Id não encontrado", { status: 400 });

      // Busca os detalhes da assinatura no Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/preapproval/${preapprovalId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });

      const subscriptionData = await response.json();

      if (!response.ok) {
        console.error("Erro ao buscar detalhes da assinatura:", subscriptionData);
        return new NextResponse("Erro ao buscar assinatura", { status: parseInt(subscriptionData.status) || 500 });
      }

      const status = subscriptionData.status; // "authorized", "paused", "cancelled"
      const tenantId = subscriptionData.external_reference;

      if (tenantId) {
        // Atualiza a assinatura no banco de dados local
        await prisma.tenant.update({
          where: { id: tenantId },
          data: {
            mpSubscriptionId: preapprovalId,
            mpSubscriptionStatus: status,
            plan: status === "authorized" ? "VIP_MENSAL" : "FREE"
          }
        });
        console.log(`Assinatura Mercado Pago atualizada para o Tenant ${tenantId}. Status: ${status}`);
      }
    }

    // Retorna 200 pro Mercado Pago parar de enviar o webhook
    return new NextResponse("Webhook processado", { status: 200 });

  } catch (error: any) {
    console.error("Erro no webhook mercado pago:", error);
    return new NextResponse(`Mercado Pago Webhook Error: ${error.message}`, { status: 400 });
  }
}
