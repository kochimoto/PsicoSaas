import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "PSICOLOGO") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { description, amount, date, patientId, paymentLink, paymentMethod, pixKey, paymentProofData } = data;

    if (!description || !amount || !patientId) {
       return NextResponse.json({ error: "Preencha descrição, valor e paciente." }, { status: 400 });
    }

    const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
    if (!tenant) return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 });

    await (prisma.transaction.create as any)({
      data: {
        description,
        amount: Math.abs(amount),
        type: 'INCOME',
        date: new Date(date),
        status: "PENDING",
        paymentLink: paymentLink || null,
        paymentMethod: paymentMethod || null,
        pixKey: pixKey || null,
        paymentProofData: paymentProofData || null,
        tenantId: tenant.id,
        patientId: patientId
      }
    });

    revalidatePath("/dashboard/financeiro");
    revalidatePath("/portal");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Charge error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao criar cobrança." }, { status: 500 });
  }
}
