import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { fileData: true, tenant: true, patient: true }
    });

    if (!document || !document.fileData) {
      return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
    }

    // Validação de acesso:
    // Se for psicólogo, precisa ser o dono do tenant
    // Se for paciente, o documento precisa pertencer a ele
    if (session.user.role === "PSICOLOGO") {
      if (document.tenant.ownerId !== session.user.id) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
    } else if (session.user.role === "PACIENTE") {
      if (!document.patient || document.patient.userId !== session.user.id) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
      }
      
      // Marcar como lido pelo paciente
      if (!document.patientRead) {
        await prisma.document.update({
          where: { id: document.id },
          data: { patientRead: true }
        });
      }
    } else {
      return NextResponse.json({ error: "Papel de usuário inválido" }, { status: 403 });
    }

    // Converter Base64 de volta para Buffer
    const fileBuffer = Buffer.from(document.fileData.data, "base64");

    const headers = new Headers();
    headers.set("Content-Type", document.fileData.mimeType);
    headers.set("Content-Disposition", `inline; filename="${encodeURIComponent(document.name)}"`);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
