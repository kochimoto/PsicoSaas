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
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Pacientes</h1>
          <p className="text-slate-400 mt-1 font-medium">Gerencie os prontuários e acessos dos seus pacientes.</p>
        </div>
        <Link 
          href="/dashboard/pacientes/novo" 
          className="bg-brand hover:bg-brand-hover text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(13,148,136,0.3)] active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Novo Paciente
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl w-fit border border-slate-800">
            <Link href="/dashboard/pacientes?status=active" className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'active' ? 'bg-slate-800 text-brand-accent shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Ativos</Link>
            <Link href="/dashboard/pacientes?status=inactive" className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'inactive' ? 'bg-slate-800 text-brand-accent shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Inativos</Link>
            <Link href="/dashboard/pacientes?status=all" className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${status === 'all' ? 'bg-slate-800 text-brand-accent shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>Todos</Link>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
            <input 
              type="text" 
              placeholder="Buscar pelo nome ou CPF..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand transition-all font-bold text-white placeholder:text-slate-700"
            />
          </div>
        </div>

        {tenant.patients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-950 rounded-[1.5rem] flex items-center justify-center mb-6 border border-slate-800">
              <User className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum paciente cadastrado</h3>
            <p className="text-slate-400 max-w-sm mb-8 font-medium">Adicione seu primeiro paciente para começar a registrar sessões e documentos.</p>
            <Link 
              href="/dashboard/pacientes/novo" 
              className="text-brand-accent font-bold hover:text-brand transition-colors"
            >
              Adicionar agora
            </Link>
          </div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 text-slate-500 text-[11px] font-black uppercase tracking-widest border-b border-slate-800/50">
                  <th className="px-6 py-5 font-bold">Paciente</th>
                  <th className="px-6 py-5 font-bold hidden sm:table-cell">Contato</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                  <th className="px-6 py-5 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 p-2">
                {tenant.patients.map((patient: any) => (
                  <tr key={patient.id} className={`hover:bg-slate-800/30 transition-all group ${!patient.active ? 'opacity-50 grayscale' : ''}`}>
                    <td className="px-6 py-6 font-bold">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-400 font-black border border-slate-800 shadow-inner group-hover:scale-105 transition-transform">
                          {patient.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-slate-100 text-lg truncate group-hover:text-white transition-colors">{patient.name}</div>
                          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider sm:hidden">{patient.phone || "Sem telefone"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 hidden sm:table-cell">
                      <div className="text-sm text-slate-300 font-bold">{patient.phone || "-"}</div>
                      <div className="text-xs text-slate-500">{patient.email || "-"}</div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        <StatusToggle id={patient.id} active={patient.active} />
                        {patient.userId && (
                          <span className="inline-flex items-center w-fit px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            ATIVO NO PORTAL
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link href={`/dashboard/pacientes/${patient.id}`} className="inline-flex items-center px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-brand-accent hover:bg-slate-900 hover:text-brand hover:border-brand-accent/30 transition-all shadow-lg active:scale-95">
                        Ver Perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/50">
                <p className="text-sm text-slate-500 font-medium">
                  Página <span className="font-bold text-white">{currentPage}</span> de <span className="font-bold text-white">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link 
                      href={`/dashboard/pacientes?status=${status}&page=${currentPage - 1}`}
                      className="px-5 py-2.5 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 bg-slate-950 hover:bg-slate-900 transition-colors shadow-lg"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <button disabled className="px-5 py-2.5 border border-slate-800/50 bg-slate-950 text-slate-700 rounded-xl text-sm font-bold cursor-not-allowed">
                      Anterior
                    </button>
                  )}
                  
                  {currentPage < totalPages ? (
                    <Link 
                      href={`/dashboard/pacientes?status=${status}&page=${currentPage + 1}`}
                      className="px-5 py-2.5 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 bg-slate-950 hover:bg-slate-900 transition-colors shadow-lg"
                    >
                      Próxima
                    </Link>
                  ) : (
                    <button disabled className="px-5 py-2.5 border border-slate-800/50 bg-slate-950 text-slate-700 rounded-xl text-sm font-bold cursor-not-allowed">
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
