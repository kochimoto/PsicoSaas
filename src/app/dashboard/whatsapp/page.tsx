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
      <div className="p-4 md:p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
          <Lock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Automação de WhatsApp</h1>
        <p className="text-slate-500 max-w-md mb-8">
          Esta é uma funcionalidade exclusiva do Plano VIP. Envie mensagens automáticas e acabe com as faltas dos seus pacientes.
        </p>
        <VIPCheckoutButton />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-teal-600" /> WhatsApp VIP
        </h1>
        <p className="text-slate-500">Configure os parâmetros do seu robô de lembretes automáticos.</p>
      </div>

      <WhatsappClient initialData={initialData} />
    </div>
  );
}
