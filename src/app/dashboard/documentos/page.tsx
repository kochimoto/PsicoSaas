import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DocumentClient from "./DocumentClient";

export default async function DocumentosPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id },
    select: { id: true, whatsappEnabled: true }
  });

  if (!tenant) return redirect("/login");

  const documents = await prisma.document.findMany({
    where: { tenantId: tenant.id },
    include: { patient: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const patients = await prisma.patient.findMany({
    where: { tenantId: tenant.id, active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      <DocumentClient 
        documents={documents as any} 
        patients={patients} 
        whatsappEnabled={tenant.whatsappEnabled} 
      />
    </div>
  );
}


