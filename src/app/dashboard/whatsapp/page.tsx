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
        <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center mb-6 shadow-inner border border-amber-300">
          <Lock className="w-10 h-10 text-amber-700" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Automação de WhatsApp</h1>
        <p className="text-xl text-slate-500 font-medium max-w-xl mb-8 leading-relaxed">
          Esta é uma funcionalidade exclusiva do <strong className="text-amber-600">Plano VIP</strong>. Envie mensagens automáticas e acabe com as faltas dos seus pacientes usando Lembretes Inteligentes.
        </p>
        <div className="w-full max-w-sm">
           <VIPCheckoutButton />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-emerald-500" /> WhatsApp VIP
        </h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Configure os parâmetros do seu robô de lembretes automáticos.</p>
      </div>

      <WhatsappClient initialData={initialData} />
    </div>
  );
}
