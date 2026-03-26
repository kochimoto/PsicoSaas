import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Calendar, FileText, Phone, Mail, Activity, Edit } from "lucide-react";
import EvolutionForm from "./EvolutionForm";
import DocumentClient from "../../documentos/DocumentClient";

export default async function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { ownerId: session.user.id } });
  if (!tenant) return redirect("/login");

  const patient = await prisma.patient.findFirst({
    where: { id, tenantId: tenant.id },
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
      <Link href="/dashboard/pacientes" className="inline-flex items-center text-sm font-black uppercase tracking-widest text-slate-500 hover:text-brand-accent transition-all group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Voltar para pacientes
      </Link>

      {/* Header Info */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="w-24 h-24 rounded-[2rem] bg-slate-950 flex items-center justify-center border border-slate-800 shrink-0 shadow-inner group transition-transform hover:scale-105">
          <User className="w-12 h-12 text-slate-700 group-hover:text-brand-accent transition-colors" />
        </div>
        <div className="flex-1 space-y-4 w-full">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">{patient.name}</h1>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-1">Cadastrado em {new Date(patient.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <Link href={`/dashboard/pacientes/${patient.id}/editar`} className="bg-slate-950 border border-slate-800 hover:border-brand-accent/30 hover:bg-slate-900 text-slate-300 px-6 py-3.5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 transition-all text-xs shadow-xl active:scale-95">
              <Edit className="w-4 h-4 text-brand-accent" /> Editar Perfil
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 text-sm font-bold text-slate-400">
            {patient.phone && (
               <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/50 hover:text-white transition-colors">
                 <Phone className="w-4 h-4 text-brand-accent"/> {patient.phone}
               </div>
            )}
            {patient.email && (
               <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/50 hover:text-white transition-colors">
                 <Mail className="w-4 h-4 text-brand-accent"/> {patient.email}
               </div>
            )}
            <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/50 hover:text-white transition-colors uppercase tracking-wider text-xs font-black">
              <FileText className="w-4 h-4 text-brand-accent"/> {patient.cpf || 'Sem CPF'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Evolutions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-2xl backdrop-blur-sm">
            <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-8 tracking-tight">
              <Activity className="w-7 h-7 text-brand-accent" /> Nova Evolução Clínica
            </h2>
            <EvolutionForm patientId={patient.id} />
          </div>

          <div className="space-y-6">
            <h3 className="font-black text-white text-xl px-4 flex items-center gap-3">
              <div className="w-2 h-8 bg-brand rounded-full"></div> Histórico de Sessões ({patient.clinicalRecords.length})
            </h3>
            {patient.clinicalRecords.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-[2rem] border-dashed font-bold">
                Nenhuma anotação clínica registrada ainda.
              </div>
            ) : (
              <div className="space-y-6">
                {patient.clinicalRecords.map(record => (
                  <div key={record.id} className="bg-slate-900 p-8 rounded-[2rem] shadow-xl border border-slate-800 hover:border-slate-700 transition-all group">
                    <div className="flex justify-between items-center mb-6">
                      <p className="text-xs font-black text-slate-500 tracking-widest uppercase">
                        {new Date(record.date).toLocaleDateString('pt-BR')} • {new Date(record.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                      <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-brand/30 transition-colors"></div>
                    </div>
                    <div className="text-slate-300 whitespace-pre-wrap font-medium leading-relaxed text-lg">
                      {record.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Agendas & Info */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 tracking-tight">
              <Calendar className="w-5 h-5 text-sky-400" /> Próximas Sessões
            </h2>
            {patient.appointments.length === 0 ? (
               <p className="text-sm font-bold text-slate-600 bg-slate-950 p-6 rounded-2xl border border-slate-800 border-dashed text-center">Nenhuma sessão agendada.</p>
            ) : (
               <div className="space-y-4">
                  {patient.appointments.map(app => (
                    <div key={app.id} className="p-5 bg-slate-950 rounded-2xl text-sm border border-slate-800 space-y-2 group hover:bg-slate-900 transition-colors">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                        <span className="text-slate-200 group-hover:text-brand-accent transition-colors">{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                        <span className="text-slate-500">{new Date(app.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {app.service && (
                        <p className="text-sm font-bold text-slate-400">{app.service.name}</p>
                      )}
                    </div>
                  ))}
               </div>
            )}
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl backdrop-blur-sm">
            <h2 className="text-xl font-black text-white flex items-center gap-3 mb-6 tracking-tight">
              <Activity className="w-5 h-5 text-emerald-400" /> Financeiro
            </h2>
            {patient.transactions.length === 0 ? (
               <p className="text-sm font-bold text-slate-600 bg-slate-950 p-6 rounded-2xl border border-slate-800 border-dashed text-center">Nenhum lançamento.</p>
            ) : (
               <div className="space-y-4">
                 {patient.transactions.map(tx => (
                   <div key={tx.id} className="p-5 bg-slate-950 rounded-2xl text-sm border border-slate-800 group hover:bg-slate-900 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                       <span className="font-extrabold text-slate-200 line-clamp-1 text-base">{tx.description}</span>
                       <span className={`font-black tracking-tighter shrink-0 ml-2 text-lg ${tx.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                         {tx.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(tx.amount).toFixed(2).replace('.', ',')}
                       </span>
                     </div>
                     <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                       <span>{new Date(tx.date).toLocaleDateString('pt-BR')}</span>
                       {tx.service && <span>{tx.service.name}</span>}
                     </div>
                   </div>
                 ))}
               </div>
            )}
          </div>

          <div className="space-y-6">
             <h3 className="font-black text-white text-xl px-4 flex items-center gap-3">
               <div className="w-2 h-8 bg-indigo-500 rounded-full"></div> Documentos ({patient.documents.length})
             </h3>
             <DocumentClient documents={patient.documents} patients={[{ id: patient.id, name: patient.name }]} />
          </div>
        </div>
      </div>
    </div>
  );
}
