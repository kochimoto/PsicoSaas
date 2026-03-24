import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Calendar, Wallet, TrendingUp, Sparkles, Clock } from "lucide-react";
import VIPCheckoutButton from "./VIPCheckoutButton";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, differenceInDays } from "date-fns";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.user) return redirect("/login");

  const now = new Date();

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      patients: {
        where: { active: true }
      },
      appointments: {
        where: { date: { gte: now } },
        orderBy: { date: 'asc' },
        take: 5,
        include: {
          patient: true
        }
      }
    }
  });

  if (!tenant) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">Erro: Tenant não encontrado. Contate o suporte.</div>
      </div>
    );
  }

  // Estatísticas Reais
  const [sessionsToday, monthlyRevenue, newPatientsMonth] = await Promise.all([
    prisma.appointment.count({
      where: {
        tenantId: tenant.id,
        date: {
          gte: startOfDay(now),
          lte: endOfDay(now)
        }
      }
    }),
    prisma.transaction.aggregate({
      where: {
        tenantId: tenant.id,
        type: 'INCOME',
        status: 'PAID',
        date: {
          gte: startOfMonth(now),
          lte: endOfMonth(now)
        }
      },
      _sum: {
        amount: true
      }
    }),
    prisma.patient.count({
      where: {
        tenantId: tenant.id,
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now)
        }
      }
    })
  ]);

  // Lógica de Trial 7 dias
  const trialDaysLimit = 7;
  const daysSinceCreated = differenceInDays(now, tenant.createdAt);
  const remainingTrialDays = trialDaysLimit - daysSinceCreated;
  const isTrialActive = remainingTrialDays > 0 && tenant.plan === "FREE";
  const isVip = tenant.plan !== "FREE" || isTrialActive;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Olá, {session.user.name.split(" ")[0]}</h1>
          <p className="text-slate-500 mt-1">Bem-vindo(a) ao seu resumo da {tenant.clinicName}</p>
        </div>
        
        {isTrialActive && (
          <div className="bg-blue-600 text-white px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/20 animate-pulse">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-bold">{remainingTrialDays} {remainingTrialDays === 1 ? 'dia' : 'dias'} de VIP restante</span>
          </div>
        )}
      </div>

      {!isVip && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col xl:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black text-amber-900 tracking-tight flex items-center gap-2">
              <span className="bg-amber-100 p-2 rounded-xl text-amber-600"><Sparkles className="w-5 h-5"/></span>
              Desbloqueie o Potencial Máximo
            </h3>
            <p className="font-semibold text-amber-700/80 mt-2 max-w-xl text-[15px]">
              Você está usando a licença gratuita do sistema. Assine o <strong className="text-amber-900">Plano VIP</strong> para enviar cobranças, laudos e lembretes de WhatsApp automaticamente aos seus pacientes, sem limites.
            </p>
          </div>
          <VIPCheckoutButton />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Pacientes Ativos" value={tenant.patients.length.toString()} icon={<Users className="w-6 h-6 text-blue-500" />} />
        <MetricCard title="Sessões Hoje" value={sessionsToday.toString()} icon={<Calendar className="w-6 h-6 text-indigo-500" />} />
        <MetricCard title="Receita Mensal" value={`R$ ${(monthlyRevenue._sum.amount || 0).toFixed(2).replace('.', ',')}`} icon={<Wallet className="w-6 h-6 text-emerald-500" />} />
        <MetricCard title="Novos Pacientes" value={newPatientsMonth.toString()} icon={<TrendingUp className="w-6 h-6 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-500" /> Próximas Sessões
          </h2>
          {tenant.appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              Nenhuma sessão agendada para os próximos dias.
            </div>
          ) : (
            <div className="space-y-4">
              {tenant.appointments.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-hover hover:border-indigo-200 hover:bg-white">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-sm">
                      {app.patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{app.patient.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(app.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${app.status === 'SCHEDULED' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Avisos e Novidades
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 text-sm">
              <span className="font-bold block mb-1">Dica do PsicoGestão</span>
              Ative as mensagens automatizadas de WhatsApp no menu Configurações para reduzir faltas em até 40%.
            </div>
            {isTrialActive && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900 text-sm">
                <span className="font-bold block mb-1 text-amber-700">Período de Experiência</span>
                Aproveite todos os recursos VIP gratuitamente pelos primeiros 7 dias.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
}

