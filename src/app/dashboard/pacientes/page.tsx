import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, User } from "lucide-react";
import StatusToggle from "./StatusToggle";

export default async function PacientesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  const { status: statusParam } = await searchParams;
  const status = statusParam || "active";

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    include: { 
      patients: { 
        where: status === "all" ? {} : { active: status === "active" },
        orderBy: { name: 'asc' } 
      } 
    }
  });

  if (!tenant) return redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pacientes</h1>
          <p className="text-slate-500 mt-1">Gerencie os prontuários e acessos dos seus pacientes.</p>
        </div>
        <Link 
          href="/dashboard/pacientes/novo" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Novo Paciente
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
            <Link href="/dashboard/pacientes?status=active" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${status === 'active' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Ativos</Link>
            <Link href="/dashboard/pacientes?status=inactive" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${status === 'inactive' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Inativos</Link>
            <Link href="/dashboard/pacientes?status=all" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${status === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todos</Link>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar pelo nome ou CPF..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {tenant.patients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
              <User className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhum paciente cadastrado</h3>
            <p className="text-slate-500 max-w-sm mb-6">Adicione seu primeiro paciente para começar a registrar sessões e documentos.</p>
            <Link 
              href="/dashboard/pacientes/novo" 
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Adicionar agora
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-slate-100">
                  <th className="px-6 py-4 font-medium">Nome Completo</th>
                  <th className="px-6 py-4 font-medium">Contato</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenant.patients.map((patient: any) => (
                  <tr key={patient.id} className={`hover:bg-slate-50 transition-colors group ${!patient.active ? 'bg-slate-50/50 grayscale-[0.5] opacity-80' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{patient.name}</div>
                      <div className="text-sm text-slate-500">{patient.cpf || "Sem CPF"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{patient.phone || "-"}</div>
                      <div className="text-sm text-slate-500">{patient.email || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <StatusToggle id={patient.id} active={patient.active} />
                        {patient.userId && (
                          <span className="inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                            Tem Portal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/dashboard/pacientes/${patient.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Prontuário
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
