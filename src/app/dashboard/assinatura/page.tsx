import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import StripeCheckoutButton from "../StripeCheckoutButton";
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
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-500" /> Minha Assinatura
        </h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Gerencie seu plano atual e acompanhe o uso dos seus limites do mês.</p>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
           <div>
             <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Seu plano atual é</p>
             <h2 className={`text-4xl font-black tracking-tight ${isVip ? 'text-amber-600' : 'text-slate-700'}`}>
                {isVip ? "VIP Ouro" : "Membro Gratuito"}
             </h2>
           </div>
           {!isVip && (
              <div className="shrink-0 pt-2 sm:pt-0">
                 <StripeCheckoutButton />
              </div>
           )}
           {isVip && tenant.stripeSubscriptionStatus === "active" && (
              <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2 text-emerald-700 font-bold">
                 <CheckCircle2 className="w-5 h-5"/> Pagamento em dia
              </div>
           )}
        </div>

        <div>
           <h3 className="text-xl font-bold text-slate-800 mb-6">Uso Mensal (Renova dia 1º)</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                 <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-slate-700">Novos Pacientes</p>
                    <p className="text-[13px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{isVip ? 'Ilimitado' : `${patientCount} / 10`}</p>
                 </div>
                 {!isVip && (
                 <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                   <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (patientCount / 10) * 100)}%` }}></div>
                 </div>
                 )}
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-inner">
                 <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-slate-700">Envio de Laudos / Recibos</p>
                    <p className="text-[13px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{isVip ? 'Ilimitado' : `${docCount} / 5`}</p>
                 </div>
                 {!isVip && (
                 <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                   <div className="bg-teal-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, (docCount / 5) * 100)}%` }}></div>
                 </div>
                 )}
              </div>

           </div>
        </div>

        {!isVip && (
           <div className="mt-8 bg-amber-50 border border-amber-100 p-6 rounded-2xl flex gap-4">
              <ShieldAlert className="w-8 h-8 text-amber-500 shrink-0 mt-1" />
              <div>
                 <p className="font-bold text-amber-900 mb-1 text-lg">Por que assinar o VIP?</p>
                 <p className="text-amber-800/80 font-medium leading-relaxed">No plano gratuito a sua produtividade é limitada e você não tem acesso à Automação de WhatsApp para reduzir as faltas. Ao fazer o Upgrade por apenas <strong className="font-bold text-amber-900">R$ 1,00</strong>, seu sistema não terá mais limites de cadastros.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}
