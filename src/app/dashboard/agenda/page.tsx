import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AgendaClient from "./AgendaClient";

export default async function AgendaPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const appointments = await prisma.appointment.findMany({
    where: { tenantId: tenant.id },
    include: { patient: { select: { name: true } } },
    orderBy: { date: 'asc' }
  });

  const patients = await prisma.patient.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <AgendaClient initialAppointments={appointments} patients={patients} />
    </div>
  );
}
