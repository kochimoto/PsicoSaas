import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "PSICOLOGO") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { ownerId: session.user.id },
      include: { owner: true }
    });

    if (!tenant) {
      return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 });
    }

    // Cria a sessão de Checkout no Stripe Dinamicamente para o Plano VIP (R$ 1,00)
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: tenant.owner.email,
      client_reference_id: tenant.id, // ID local da clínica para ligar com o Webhook
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: "PsicoGestão VIP (Teste)",
              description: "Acesso ilimitado à gestão completa.",
            },
            unit_amount: 100, // R$ 1,00 (em centavos)
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=canceled`,
    });

    return NextResponse.json({ url: stripeSession.url });

  } catch (error: any) {
    console.error("Erro no checkout:", error);
    return NextResponse.json({ error: "Erro interno ao gerar pagamento" }, { status: 500 });
  }
}
