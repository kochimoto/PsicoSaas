import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentClient from "./DocumentClient";
import { FileText } from "lucide-react";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function DocumentosPage() {
  noStore();
  await headers();
  
  const session = await getSession();
  if (!session) return redirect("/login");

  let patients: any[] = [];
  let documents: any[] = [];
  let tenant: any = null;

     try {
        const { prisma } = await import("@/lib/prisma");
        tenant = await prisma.tenant.findUnique({
          where: { ownerId: session.user.id }
        });

        if (tenant) {
          [patients, documents] = await Promise.all([
            prisma.patient.findMany({
              where: { tenantId: tenant.id },
              select: { id: true, name: true },
              orderBy: { name: 'asc' }
            }),
            prisma.document.findMany({
              where: { tenantId: tenant.id },
              include: { patient: { select: { name: true } } },
              orderBy: { createdAt: 'desc' }
            })
          ]);
        }
     } catch (err) {
        console.error("Documents fetch error:", err);
     }

  if (!tenant) return redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
          <FileText className="w-7 h-7 text-slate-700" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Documentos Clínicos</h1>
          <p className="text-slate-500 font-medium">Faça upload de Laudos, Receitas e Recibos para seus pacientes.</p>
        </div>
      </div>

      <DocumentClient 
        documents={documents} 
        patients={patients} 
        whatsappEnabled={tenant?.whatsappEnabled || false} 
      />
    </div>
  );
}
