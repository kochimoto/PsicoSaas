import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const patientId = searchParams.get("patientId");
  const serviceId = searchParams.get("serviceId");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return new NextResponse("Tenant not found", { status: 404 });

  const whereClause: any = { tenantId: tenant.id };

  if (startDateStr && endDateStr) {
    whereClause.date = {
      gte: new Date(`${startDateStr}T00:00:00`),
      lte: new Date(`${endDateStr}T23:59:59`)
    };
  } else if (startDateStr) {
    whereClause.date = { gte: new Date(`${startDateStr}T00:00:00`) };
  } else if (endDateStr) {
    whereClause.date = { lte: new Date(`${endDateStr}T23:59:59`) };
  }

  if (patientId) whereClause.patientId = patientId;
  if (serviceId) whereClause.serviceId = serviceId;

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      patient: { select: { name: true } },
      service: { select: { name: true } }
    },
    orderBy: { date: 'desc' }
  });

  const lines = [
    ["Data", "Descricao", "Paciente", "Servico", "Tipo", "Status", "Valor"]
  ];

  for (const t of transactions) {
    const formattedDate = format(new Date(t.date), "dd/MM/yyyy", { locale: ptBR });
    lines.push([
      formattedDate,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.patient?.name || "-"}"`,
      `"${t.service?.name || "-"}"`,
      t.type === 'INCOME' ? "Receita" : "Despesa",
      t.status === 'PAID' ? "Pago" : "Pendente",
      (Math.abs(t.amount)).toFixed(2).replace('.', ',')
    ]);
  }

  const csvString = lines.map(row => row.join(";")).join("\n");
  
  // Add BOM for Excel character encoding support
  const bom = "\uFEFF";
  const csvBuffer = Buffer.from(bom + csvString, "utf-8");

  return new NextResponse(csvBuffer, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorio-financeiro.csv"`
    }
  });
}
