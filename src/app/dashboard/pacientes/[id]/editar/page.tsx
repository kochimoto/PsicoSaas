import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditClientForm from "./EditClientForm";

export default async function EditPatientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
  if (!tenant) return redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, tenantId: tenant.id },
    include: { user: { select: { id: true, email: true } } }
  });

  if (!patient) return redirect("/dashboard/pacientes");

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/pacientes/${patient.id}`} className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl transition-all hover:scale-110 shadow-lg text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Editar Paciente</h1>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
        <EditClientForm patient={patient} />
      </div>
    </div>
  );
}
