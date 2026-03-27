import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus, Tag } from "lucide-react";
import Link from "next/link";

export default async function ServicesPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Serviços e Procedimentos</h1>
          <p className="text-slate-500 text-sm">Configure os tipos de atendimento da sua clínica</p>
        </div>
        <Link 
          href="/dashboard/servicos/novo"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <div key={service.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
              <Tag className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="font-bold text-slate-900">{service.name}</p>
              <p className="text-xs text-slate-500 mb-2">R$ {service.price.toFixed(2)}</p>
              <Link href={`/dashboard/servicos/${service.id}/editar`} className="text-xs font-bold text-teal-600 hover:underline">Editar</Link>
            </div>
          </div>
        ))}
        {services.length === 0 && (
           <div className="col-span-full py-12 text-center text-slate-400 italic">Nenhum serviço cadastrado.</div>
        )}
      </div>
    </div>
  );
}



