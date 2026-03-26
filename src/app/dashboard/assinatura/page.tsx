import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import VIPCheckoutButton from "../VIPCheckoutButton";
import { Crown, CheckCircle2, ShieldAlert } from "lucide-react";

export default async function AssinaturaPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const isVip = tenant.plan === "VIP_MENSAL" || tenant.plan === "VIP_ANUAL";

  // Check usage
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const patientCount = await prisma.patient.count({ where: { tenantId: tenant.id, createdAt: { gte: currentMonthStart } } });
  const docCount = await prisma.document.count({ where: { tenantId: tenant.id, createdAt: { gte: currentMonthStart } } });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-xl shadow-amber-500/5">
            <Crown className="w-10 h-10 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          Minha Assinatura
        </h1>
        <p className="text-slate-400 mt-4 text-lg font-medium italic">Gerencie seu plano atual e acompanhe o uso dos seus limites do mês.</p>
      </div>

      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 pb-10 border-b border-slate-800/50 relative">
           <div className="space-y-2">
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seu plano atual é</p>
             <h2 className={`text-5xl font-black tracking-tighter ${isVip ? 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-white'}`}>
                {isVip ? "VIP Ouro" : "Membro Gratuito"}
             </h2>
           </div>
           {!isVip && (
              <div className="shrink-0 pt-2 sm:pt-0">
                 <VIPCheckoutButton />
              </div>
           )}
           {isVip && ((tenant.stripeSubscriptionStatus === "active" || tenant.mpSubscriptionStatus === "authorized") || tenant.mpSubscriptionStatus === "authorized") && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-xs shadow-xl backdrop-blur-md">
                 <CheckCircle2 className="w-5 h-5"/> Pagamento em dia
              </div>
           )}
        </div>

        <div>
           <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
             <div className="w-2 h-8 bg-brand rounded-full"></div> Uso Mensal <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">(Renova todo dia 1º)</span>
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              
              <div className="p-6 rounded-[2rem] bg-slate-950 border border-slate-800 shadow-inner group hover:border-slate-700 transition-all">
                 <div className="flex items-center justify-between mb-4">
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Novos Pacientes</p>
                    <p className="text-[10px] font-black text-white bg-slate-900 px-3 py-1.5 rounded-lg shadow-xl border border-slate-800 uppercase tracking-widest">{isVip ? 'Ilimitado' : `${patientCount} / 10`}</p>
                 </div>
                 {!isVip && (
                 <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden shadow-inner border border-slate-800">
                    <div className="bg-brand h-full rounded-full transition-all shadow-[0_0_10px_rgba(13,148,136,0.5)]" style={{ width: `${Math.min(100, (patientCount / 10) * 100)}%` }}></div>
                 </div>
                 )}
              </div>

              <div className="p-6 rounded-[2rem] bg-slate-950 border border-slate-800 shadow-inner group hover:border-slate-700 transition-all">
                 <div className="flex items-center justify-between mb-4">
                    <p className="font-black text-slate-300 uppercase tracking-widest text-xs">Envio de Laudos</p>
                    <p className="text-[10px] font-black text-white bg-slate-900 px-3 py-1.5 rounded-lg shadow-xl border border-slate-800 uppercase tracking-widest">{isVip ? 'Ilimitado' : `${docCount} / 5`}</p>
                 </div>
                 {!isVip && (
                 <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden shadow-inner border border-slate-800">
                    <div className="bg-indigo-500 h-full rounded-full transition-all shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${Math.min(100, (docCount / 5) * 100)}%` }}></div>
                 </div>
                 )}
              </div>

           </div>
        </div>

        {!isVip && (
           <div className="mt-10 bg-amber-500/5 border border-amber-500/20 p-8 rounded-[2rem] flex gap-6 backdrop-blur-md relative group hover:bg-amber-500/10 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full -mr-8 -mt-8 blur-2xl"></div>
              <ShieldAlert className="w-10 h-10 text-amber-500 shrink-0 mt-1" />
              <div>
                 <p className="font-black text-amber-500 mb-2 text-xl tracking-tight uppercase tracking-wider">Por que ser VIP?</p>
                 <p className="text-slate-400 font-medium leading-relaxed">No plano gratuito seu crescimento é limitado e você não tem acesso à <span className="text-amber-500 font-bold">Automação de WhatsApp</span>. Ao fazer o Upgrade por apenas <strong className="font-black text-white">R$ 1,00</strong>, sua clínica não terá mais limites de cadastros.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
