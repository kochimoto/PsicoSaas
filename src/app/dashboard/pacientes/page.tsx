import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Search, User } from "lucide-react";
import StatusToggle from "./StatusToggle";

export default async function PacientesPage({ searchParams }: { searchParams: Promise<{ status?: string, page?: string }> }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  const { status: statusParam, page: pageParam } = await searchParams;
  const status = statusParam || "active";
  const currentPage = Number(pageParam) || 1;
  const ITEMS_PER_PAGE = 5;

  const whereClause = status === "all" ? {} : { active: status === "active" };

  const [tenant, totalPatients] = await Promise.all([
    prisma.tenant.findUnique({
      where: { ownerId: session.user.id },
      include: { 
        patients: { 
          where: whereClause,
          orderBy: { name: 'asc' },
          skip: (currentPage - 1) * ITEMS_PER_PAGE,
          take: ITEMS_PER_PAGE
        } 
      }
    }),
    prisma.patient.count({
      where: {
        tenant: { ownerId: session.user.id },
        ...whereClause
      }
    })
  ]);

  const totalPages = Math.ceil(totalPatients / ITEMS_PER_PAGE);

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
                <tr className="bg-slate-50/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 font-bold">Paciente</th>
                  <th className="px-6 py-4 font-bold hidden sm:table-cell">Contato</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenant.patients.map((patient: any) => (
                  <tr key={patient.id} className={`hover:bg-blue-50/30 transition-colors group ${!patient.active ? 'bg-slate-50/50 grayscale-[0.5] opacity-80' : ''}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0 border border-slate-200">
                          {patient.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{patient.name}</div>
                          <div className="text-xs text-slate-500 font-medium sm:hidden">{patient.phone || "Sem telefone"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden sm:table-cell">
                      <div className="text-sm text-slate-700 font-medium">{patient.phone || "-"}</div>
                      <div className="text-xs text-slate-400">{patient.email || "-"}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1.5">
                        <StatusToggle id={patient.id} active={patient.active} />
                        {patient.userId && (
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                            ATIVO NO PORTAL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link href={`/dashboard/pacientes/${patient.id}`} className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm">
                        Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/30">
                <p className="text-sm text-slate-500">
                  Mostrando página <span className="font-bold text-slate-700">{currentPage}</span> de <span className="font-bold text-slate-700">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link 
                      href={`/dashboard/pacientes?status=${status}&page=${currentPage - 1}`}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed">
                      Anterior
                    </button>
                  )}
                  
                  {currentPage < totalPages ? (
                    <Link 
                      href={`/dashboard/pacientes?status=${status}&page=${currentPage + 1}`}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Próxima
                    </Link>
                  ) : (
                    <button disabled className="px-4 py-2 border border-slate-100 bg-slate-50 text-slate-400 rounded-lg text-sm font-bold cursor-not-allowed">
                      Próxima
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
