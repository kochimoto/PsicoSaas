import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, MapPin, User, ChevronRight, CheckCircle2, AlertCircle, FileText, Phone } from "lucide-react";
import ConfirmButtons from "./ConfirmButtons";

export default async function PortalPage({ searchParams }: { searchParams: any }) {
  const patientId = searchParams.id;
  const appointmentId = searchParams.app;

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId || "" },
    include: {
      patient: true,
      tenant: true,
    }
  });

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h1 className="text-xl font-bold text-slate-900">Agendamento não encontrado</h1>
          <p className="text-slate-500 text-sm">O link pode ter expirado ou o agendamento foi cancelado.</p>
        </div>
      </div>
    );
  }

  const { patient, tenant } = appointment;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="flex-1 max-w-md mx-auto w-full p-4 space-y-6 pt-10 pb-20">
        <div className="text-center space-y-2">
           <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl shadow-teal-600/20 mb-4">
              <Calendar className="w-8 h-8" />
           </div>
           <h1 className="text-2xl font-bold text-slate-900">Confirmação de Consulta</h1>
           <p className="text-slate-500">{tenant.clinicName}</p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="p-6 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-teal-600 text-xl">
                    {patient.name.charAt(0)}
                 </div>
                 <div>
                    <h2 className="font-bold text-slate-900">{patient.name}</h2>
                    <p className="text-xs text-slate-500">Paciente</p>
                 </div>
              </div>
           </div>

           <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-teal-600" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data</p>
                    <p className="text-slate-900 font-bold capitalize">
                       {format(new Date(appointment.date), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                 </div>
              </div>

              <div className="flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-teal-600" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Horário</p>
                    <p className="text-slate-900 font-bold">
                       {format(new Date(appointment.date), "HH:mm")}h
                    </p>
                 </div>
              </div>

              {tenant.address && (
                <div className="flex items-start gap-4 pt-4 border-t border-slate-100">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-slate-400" />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Local</p>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{tenant.address}</p>
                   </div>
                </div>
              )}
           </div>

           <div className="p-6 bg-slate-50 border-t border-slate-100">
             {appointment.status === 'SCHEDULED' ? (
                <ConfirmButtons id={appointment.id} />
             ) : (
                <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 font-bold">
                   <CheckCircle2 className="w-5 h-5" />
                   Consulta Confirmada
                </div>
             )}
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group cursor-pointer hover:border-teal-200 transition-colors">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                 <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                 <p className="text-sm font-bold text-slate-900">Documentos</p>
                 <p className="text-xs text-slate-500">Acessar prontuário e laudos</p>
              </div>
           </div>
           <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
        </div>

        <p className="text-center text-[10px] text-slate-400 font-medium">
          Dúvidas? Entre em contato pelo telefone: <br/>
          <span className="font-bold text-slate-500">{tenant.owner.email}</span>
        </p>
      </div>
    </div>
  );
}
