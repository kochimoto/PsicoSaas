import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event;

  try {
    // Tenta validar a assinatura, se houver Segredo configurado
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (secret) {
      event = stripe.webhooks.constructEvent(body, signature, secret);
    } else {
      // Se estamos em DEV sem webhook config, confiamos no payload bruto
      event = JSON.parse(body);
    }
  } catch (error: any) {
    console.error("Webhook signature verification failed.", error.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object;
      
      // Só ativa se o pagamento estiver de fato confirmado
      if (session.payment_status === 'paid') {
        const tenantId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (tenantId) {
          await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              plan: "VIP_MENSAL",
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              stripeSubscriptionStatus: "active"
            }
          });
          console.log(`✅ Assinatura VIP ativada via ${event.type} para Clínica: ${tenantId}`);
        }
      } else {
        console.log(`⏳ Sessão completada mas pagamento ainda pendente (${session.payment_status}).`);
      }
      break;
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const status = subscription.status;
      
      // Procura o Tenant pelo ID da assinatura do Stripe
      const tenant = await prisma.tenant.findFirst({
        where: { stripeSubscriptionId: subscription.id }
      });

      if (tenant) {
        // Se a assinatura não estiver ativa/trialling, voltamos para o plano FREE
        const isPaid = status === "active" || status === "trialing";
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            plan: isPaid ? "VIP_MENSAL" : "FREE",
            stripeSubscriptionStatus: status
          }
        });
        console.log(`🔄 Assinatura da Clínica ${tenant.id} atualizada para ${status}. Plano: ${isPaid ? 'VIP' : 'FREE'}`);
      }
      break;
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object;
      console.error(`❌ Pagamento assíncrono falhou para sessão: ${session.id}`);
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
