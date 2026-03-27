import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "PACIENTE") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { transactionId, base64Data } = await request.json();
    if (!transactionId || !base64Data) {
      return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
    }

    const patientRow = await prisma.patient.findUnique({ where: { userId: session.user.id } });
    if (!patientRow) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });

    const transaction = await prisma.transaction.findFirst({
      where: { id: transactionId, patientId: patientRow.id }
    });
    if (!transaction) return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });

    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProofData: base64Data,
        status: "PAID",
      }
    });

    revalidatePath("/portal");
    revalidatePath(`/dashboard/pacientes/${patientRow.id}`);
    revalidatePath("/dashboard/financeiro");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao enviar comprovante." }, { status: 500 });
  }
}
