import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AgendaClient from "./AgendaClient";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AgendaPage() {
  noStore();
  await headers(); // Force dynamic

  const session = await getSession();
  if (!session) return redirect("/login");

  let patients: any[] = [];
  let services: any[] = [];
  let appointments: any[] = [];
  let tenant: any = null;

     try {
        const { prisma } = await import("@/lib/prisma");
        tenant = await prisma.tenant.findUnique({
          where: { ownerId: session.user.id }
        });

        if (tenant) {
          patients = await prisma.patient.findMany({
            where: { tenantId: tenant.id },
            select: { id: true, name: true, phone: true },
            orderBy: { name: 'asc' }
          });

          services = await prisma.service.findMany({
            where: { tenantId: tenant.id },
            orderBy: { name: 'asc' }
          });

          appointments = await prisma.appointment.findMany({
            where: { 
              tenantId: tenant.id, 
              date: { gte: new Date(new Date().setHours(0,0,0,0)) } 
            },
            include: { 
              patient: { select: { name: true, phone: true } },
              service: { select: { name: true } }
            },
            orderBy: { date: 'asc' }
          });
        }
     } catch (err) {
        console.error("Agenda fetch error:", err);
     }

  if (!tenant) return redirect("/login");

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agenda</h1>
          <p className="text-slate-500 mt-1">Gerencie suas próximas sessões e alertas via WhatsApp.</p>
        </div>
      </div>

      <AgendaClient 
        initialAppointments={appointments} 
        patients={patients} 
        services={services}
        tenantSettings={{
          whatsappEnabled: tenant?.whatsappEnabled || false,
          whatsappMessage: tenant?.whatsappMessage || ""
        }}
      />
    </div>
  );
}
