import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import WhatsappClient from "./WhatsappClient";
import VIPCheckoutButton from "../VIPCheckoutButton";
import { Lock, MessageCircle } from "lucide-react";

export default async function WhatsappPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    include: { services: { orderBy: { name: 'asc' } } }
  });

  if (!tenant) return redirect("/login");

  const initialData = {
    whatsappEnabled: tenant.whatsappEnabled,
    whatsappNumber: tenant.whatsappNumber || "",
    whatsappMessage: tenant.whatsappMessage || "",
    whatsappPaymentMessage: tenant.whatsappPaymentMessage || "",
    whatsappDocumentMessage: tenant.whatsappDocumentMessage || "",
    services: tenant.services.map(s => ({
      id: s.id,
      name: s.name,
      whatsappMessage: s.whatsappMessage || ""
    }))
  };

  if (tenant.plan === "FREE") {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-28 h-28 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border border-amber-500/20 relative group">
          <div className="absolute inset-0 bg-amber-500/5 blur-2xl rounded-full group-hover:bg-amber-500/10 transition-colors"></div>
          <Lock className="w-12 h-12 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        </div>
        <h1 className="text-5xl font-black text-white tracking-tight mb-6">Automação de WhatsApp</h1>
        <p className="text-xl text-slate-400 font-medium max-w-xl mb-10 leading-relaxed italic">
          Esta é uma funcionalidade exclusiva do <strong className="text-amber-500">Plano VIP</strong>. Envie mensagens automáticas e acabe com as faltas dos seus pacientes usando Lembretes Inteligentes.
        </p>
        <div className="w-full max-w-xs scale-110">
           <VIPCheckoutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
            <MessageCircle className="w-10 h-10 text-emerald-500" />
          </div>
          WhatsApp VIP
        </h1>
        <p className="text-slate-400 mt-4 text-lg font-medium italic">Configure os parâmetros do seu robô de lembretes automáticos.</p>
      </div>

      <WhatsappClient initialData={initialData} />
    </div>
  );
}
