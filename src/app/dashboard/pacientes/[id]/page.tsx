import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, FileText, Phone, Mail, Activity, Edit } from "lucide-react";
import EvolutionForm from "./EvolutionForm";
import DocumentClient from "../../documentos/DocumentClient";

export default async function PatientDetailsPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
  if (!tenant) return redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id: params.id, tenantId: tenant.id },
    include: {
      clinicalRecords: { orderBy: { date: 'desc' } },
      appointments: { 
        orderBy: { date: 'desc' },
        include: { service: { select: { name: true } } }
      },
      documents: { orderBy: { createdAt: 'desc' }, include: { patient: { select: { name: true } } } },
      transactions: {
        orderBy: { date: 'desc' },
        include: { service: { select: { name: true } } }
      }
    }
  });

  if (!patient) return redirect("/dashboard/pacientes");

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <Link href="/dashboard/pacientes" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para pacientes
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start gap-6 relative">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
          <User className="w-10 h-10 text-slate-400" />
        </div>
        <div className="flex-1 space-y-3 w-full">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{patient.name}</h1>
              <p className="text-sm font-medium text-slate-500">Cadastrado em {new Date(patient.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <Link href={`/dashboard/pacientes/${patient.id}/editar`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm shadow-sm">
              <Edit className="w-4 h-4" /> Editar
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
            {patient.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-slate-400"/> {patient.phone}</div>}
            {patient.email && <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-slate-400"/> {patient.email}</div>}
            <div className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-slate-400"/> {patient.cpf || 'Sem CPF'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Evolutions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-teal-600" /> Nova Evolução Clínica
            </h2>
            <EvolutionForm patientId={patient.id} />
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg px-2">Histórico de Sessões ({patient.clinicalRecords.length})</h3>
            {patient.clinicalRecords.length === 0 ? (
              <div className="p-8 text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl border-dashed">
                Nenhuma anotação clínica registrada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {patient.clinicalRecords.map(record => (
                  <div key={record.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                    <p className="text-sm font-extrabold text-slate-400 mb-4 tracking-tight uppercase">
                      {new Date(record.date).toLocaleDateString('pt-BR')} • {new Date(record.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {record.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Agendas & Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-sky-600" /> Próximas Sessões
            </h2>
            {patient.appointments.length === 0 ? (
               <p className="text-sm font-medium text-slate-500">Nenhuma sessão agendada no momento.</p>
            ) : (
               <div className="space-y-3">
                  {patient.appointments.map(app => (
                    <div key={app.id} className="px-4 py-3 bg-slate-50 rounded-2xl text-sm border border-slate-100 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-700">{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                        <span className="font-semibold text-slate-500">{new Date(app.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {app.service && (
                        <p className="text-xs font-bold text-blue-600">{app.service.name}</p>
                      )}
                    </div>
                  ))}
               </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-emerald-600" /> Histórico Financeiro
            </h2>
            {patient.transactions.length === 0 ? (
               <p className="text-sm font-medium text-slate-500">Nenhum lançamento vinculado.</p>
            ) : (
               <div className="space-y-3">
                 {patient.transactions.map(tx => (
                   <div key={tx.id} className="px-4 py-3 bg-slate-50 rounded-2xl text-sm border border-slate-100">
                     <div className="flex justify-between items-start">
                       <span className="font-bold text-slate-700 line-clamp-1">{tx.description}</span>
                       <span className={`font-black tracking-tight shrink-0 ml-2 ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {tx.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                       </span>
                     </div>
                     <div className="flex justify-between items-center mt-1 text-[11px] font-bold text-slate-400 uppercase">
                       <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                       {tx.service && <span>{tx.service.name}</span>}
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          <div className="space-y-4">
             <h3 className="font-bold text-slate-800 text-lg px-2 flex items-center gap-2">
               <FileText className="w-5 h-5 text-indigo-500" /> Documentos do Paciente
             </h3>
             <DocumentClient documents={patient.documents} patients={[{ id: patient.id, name: patient.name }]} />
          </div>
        </div>
      </div>
    </div>
  );
}
