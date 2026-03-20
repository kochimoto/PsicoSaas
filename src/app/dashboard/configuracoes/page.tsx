import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const initialData = {
    clinicName: tenant.clinicName || "",
    whatsappEnabled: tenant.whatsappEnabled,
    whatsappNumber: tenant.whatsappNumber || "",
    whatsappMessage: tenant.whatsappMessage || ""
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Configurações e Automação</h1>
        <p className="text-slate-500 mt-2 text-lg font-medium">Personalize sua clínica e configure alertas automáticos via WhatsApp.</p>
      </div>

      <SettingsClient initialData={initialData} />
    </div>
  );
}
