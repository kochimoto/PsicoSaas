import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Calendar, Wallet, TrendingUp, Sparkles } from "lucide-react";
import StripeCheckoutButton from "./StripeCheckoutButton";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.user) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    include: {
      patients: true,
      appointments: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 5
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Olá, {session.user.name.split(" ")[0]}</h1>
        <p className="text-slate-500 mt-1">Bem-vindo(a) ao seu resumo da {tenant.clinicName}</p>
      </div>

      {tenant.plan === "FREE" && (
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
          <StripeCheckoutButton />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Pacientes Ativos" value={tenant.patients.length.toString()} icon={<Users className="w-6 h-6 text-blue-500" />} />
        <MetricCard title="Sessões Hoje" value="0" icon={<Calendar className="w-6 h-6 text-indigo-500" />} />
        <MetricCard title="Receita Mensal" value="R$ 0,00" icon={<Wallet className="w-6 h-6 text-emerald-500" />} />
        <MetricCard title="Novos Pacientes" value="0" icon={<TrendingUp className="w-6 h-6 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Próximas Sessões</h2>
          {tenant.appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              Nenhuma sessão agendada para os próximos dias.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Map appointments here */}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Avisos Recentes</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 text-sm">
              <span className="font-bold block mb-1">Dica do PsicoGestão</span>
              Ative as mensagens automatizadas de WhatsApp no menu Configurações para reduzir faltas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
