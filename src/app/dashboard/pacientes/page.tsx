import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus, Search, User as UserIconIcon, ClipboardList, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import StatusToggle from "./StatusToggle";

export default async function PacientesPage({ searchParams }: { searchParams: any }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  // Fetch tenant manually as it's not in session
  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const query = (await searchParams).q || "";
  const showInactive = (await searchParams).inactive === "true";

  const patients = await prisma.patient.findMany({
    where: {
      tenantId: tenant.id,
      active: showInactive ? undefined : true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ]
    },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { appointments: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
           <p className="text-slate-500">Gerencie sua lista de acompanhamentos</p>
        </div>
        <Link 
          href="/dashboard/pacientes/novo"
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 self-start"
        >
          <Plus className="w-5 h-5" /> Adicionar Paciente
        </Link>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <form className="flex flex-col md:flex-row gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
              name="q"
              defaultValue={query}
              placeholder="Buscar por nome, email ou telefone..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
             />
           </div>
           <div className="flex items-center gap-4">
             <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="inactive"
                  defaultValue="true"
                  defaultChecked={showInactive}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                Ver Inativos
             </label>
             <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
               Filtrar
             </button>
           </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                   <th className="px-6 py-3">Paciente</th>
                   <th className="px-6 py-3">Contato</th>
                   <th className="px-6 py-3">Consultas</th>
                   <th className="px-6 py-3">Status</th>
                   <th className="px-6 py-3 text-right">Ações</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {patients.map(patient => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase">
                             {patient.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{patient.name}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="text-sm text-slate-600">{patient.email}</div>
                       <div className="text-[11px] text-slate-400 font-medium">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                       <span className="flex items-center gap-1.5">
                         <CalendarIcon className="w-4 h-4 text-slate-400" />
                         {patient._count.appointments} sessões
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <StatusToggle id={patient.id} active={patient.active} />
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 text-slate-400">
                         <Link 
                           href={`/dashboard/pacientes/${patient.id}`}
                           className="p-2 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                         >
                            <ClipboardList className="w-5 h-5" />
                         </Link>
                         <Link 
                           href={`/dashboard/pacientes/${patient.id}/editar`}
                           className="p-2 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                         >
                            <UserIconIcon className="w-5 h-5" />
                         </Link>
                       </div>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Nenhum paciente encontrado.</td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}



