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
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-center shrink-0">
          <FileText className="w-7 h-7 text-brand-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Documentos Clínicos</h1>
          <p className="text-slate-400 font-medium mt-1">Gerencie laudos, receitas e documentos dos seus pacientes.</p>
        </div>
      </div>

      <DocumentClient documents={documents} patients={patients} whatsappEnabled={tenant.whatsappEnabled} />
    </div>
  );
}
