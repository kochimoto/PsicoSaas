import { NextResponse } from "next/server";
export const dynamic = 'force-dynamic';

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

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("MERCADOPAGO_ACCESS_TOKEN não configurado.");
      return NextResponse.json({ error: "Integração do Mercado Pago não configurada" }, { status: 500 });
    }

    // Cria a sessão de Checkout no Mercado Pago Dinamicamente para o Plano VIP (Assinatura)
    const response = await fetch("https://api.mercadopago.com/preapproval", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reason: "PsicoGestão VIP",
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: 1, // R$ 1,00 para teste inicial
          currency_id: "BRL"
        },
        back_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        payer_email: tenant.owner.email,
        external_reference: tenant.id // ID local da clínica para ligar com o Webhook
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro no Mercado Pago:", data);
      return NextResponse.json({ error: "Erro ao gerar link de pagamento no Mercado Pago" }, { status: response.status });
    }

    return NextResponse.json({ url: data.init_point });

  } catch (error: any) {
    console.error("Erro no checkout mercado pago:", error);
    return NextResponse.json({ error: "Erro interno ao gerar pagamento" }, { status: 500 });
  }
}
