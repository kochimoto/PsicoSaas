import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentClient from "./DocumentClient";
import { FileText } from "lucide-react";

export default async function DocumentosPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const patients = await prisma.patient.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const documents = await prisma.document.findMany({
    where: { tenantId: tenant.id },
    include: { patient: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center">
          <FileText className="w-6 h-6 text-slate-700" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Documentos Clínicos</h1>
          <p className="text-slate-500 font-medium">Faça upload de Laudos, Receitas e Recibos para seus pacientes.</p>
        </div>
      </div>

      <DocumentClient documents={documents} patients={patients} />
    </div>
  );
}
