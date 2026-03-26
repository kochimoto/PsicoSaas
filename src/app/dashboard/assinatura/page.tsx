import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Shield, CheckCircle2, Crown, Star } from "lucide-react";
import VIPCheckoutButton from "../VIPCheckoutButton";

export default async function BillingPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Assinatura e Plano</h1>
        <p className="text-slate-500">Gerencie sua licença de uso da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Plano Atual */}
         <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-50 rounded-full opacity-50"></div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Seu Plano Atual</h3>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  {tenant.plan === 'VIP' ? <Crown className="w-6 h-6 text-amber-400" /> : <Star className="w-6 h-6 text-slate-400" />}
               </div>
               <div>
                  <p className="text-2xl font-black text-slate-900">Plano {tenant.plan}</p>
                  <p className="text-sm font-medium text-slate-500 italic">Renovação mensal</p>
               </div>
            </div>
            
            <div className="space-y-3 pt-4 border-t border-slate-100">
               <span className="text-[10px] font-bold text-slate-400 uppercase">Recursos de Segurança</span>
               <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> SSL Ativo
               </div>
               <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Backup Diário (VIP)
               </div>
            </div>
         </div>

         {/* Upgrade Section */}
         {tenant.plan === 'FREE' && (
           <div className="bg-teal-600 p-8 rounded-[2.5rem] shadow-xl shadow-teal-600/20 text-white space-y-6">
              <h3 className="text-xl font-bold">Faça o Upgrade para VIP</h3>
              <p className="text-teal-50 text-sm leading-relaxed">Libere o envio ilimitado de documentos, automação total de WhatsApp e suporte dedicado.</p>
              <ul className="space-y-2 text-sm">
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-200" /> WhatsApp Ilimitado</li>
                 <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-teal-200" /> Pacientes Ilimitados</li>
              </ul>
              <VIPCheckoutButton />
           </div>
         )}
      </div>
    </div>
  );
}
