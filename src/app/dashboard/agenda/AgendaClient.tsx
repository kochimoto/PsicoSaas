"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus, X, MessageCircle, CheckCircle2, Ban, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createAppointmentAction, updateAppointmentStatusAction, updateAppointmentDateAction } from "@/app/actions/appointments";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Patient = { id: string; name: string; phone?: string | null };
type Appointment = {
  id: string;
  date: Date | string | number;
  status: string;
  patient: { name: string; phone?: string | null } | null;
};
type TenantSettings = { whatsappEnabled: boolean; whatsappMessage: string };

export default function AgendaClient({ initialAppointments, patients, tenantSettings }: { initialAppointments: Appointment[], patients: Patient[], tenantSettings: TenantSettings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurring, setRecurring] = useState<"NONE"|"WEEKLY"|"BIWEEKLY">("NONE");
  const [occurrences, setOccurrences] = useState(4);
  const [editAppId, setEditAppId] = useState("");
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  function openNewModal() {
    setEditAppId(""); setPatientId(""); setDate(""); setTime(""); setRecurring("NONE"); setOccurrences(4); setError(""); setIsModalOpen(true);
  }

  function openEditModal(app: Appointment) {
    setEditAppId(app.id);
    const d = new Date(app.date);
    setDate(format(d, "yyyy-MM-dd"));
    setTime(format(d, "HH:mm"));
    setError("");
    setIsModalOpen(true);
  }
  
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!editAppId && !patientId) {
      setError("Selecione um paciente."); return;
    }
    if (!date || !time) {
      setError("Preencha data e horário."); return;
    }
    
    setLoading(true);
    setError("");
    
    const dateTime = new Date(`${date}T${time}:00`);
    
    let res;
    if (editAppId) {
      res = await updateAppointmentDateAction(editAppId, dateTime);
    } else {
      res = await createAppointmentAction({ patientId, date: dateTime, recurring, occurrences });
    }

    if (res?.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleStatus(id: string, status: string) {
    setWorkingId(id);
    await updateAppointmentStatusAction(id, status);
    setWorkingId("");
    router.refresh();
  }

  function getWhatsAppLink(app: Appointment) {
    if (!app.patient?.phone || !tenantSettings.whatsappMessage) return null;
    let msg = tenantSettings.whatsappMessage;
    msg = msg.replace("{nome}", app.patient.name);
    msg = msg.replace("{data}", format(new Date(app.date), "dd/MM/yyyy"));
    msg = msg.replace("{hora}", format(new Date(app.date), "HH:mm"));
    const phone = app.patient.phone.replace(/\D/g, "");
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]"
        >
          <Plus className="w-5 h-5" /> Agendar Sessão
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {initialAppointments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <CalendarIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Agenda vazia</h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">Nenhuma sessão programada para hoje ou dias futuros.</p>
            <button 
              onClick={openNewModal}
              className="text-blue-600 font-bold hover:text-blue-700"
            >
              Agendar agora
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 p-2 sm:p-6">
            {initialAppointments.map(appointment => {
              const waLink = getWhatsAppLink(appointment);
              return (
                <div key={appointment.id} className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 py-6 hover:bg-slate-50/50 transition-all rounded-2xl px-2 sm:px-6 group">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-inner ${appointment.status === 'COMPLETED' ? 'bg-slate-50 border-slate-200 text-slate-500' : appointment.status === 'CANCELED' ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-gradient-to-b from-blue-50 to-indigo-50/30 text-blue-700 border-blue-100/50'}`}>
                      <span className="text-xs font-bold uppercase tracking-wider">{format(new Date(appointment.date), 'MMM', { locale: ptBR })}</span>
                      <span className="text-2xl font-black leading-none mt-0.5">{format(new Date(appointment.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className={`text-lg sm:text-xl font-bold ${appointment.status === 'CANCELED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{appointment.patient?.name || "Paciente Removido"}</h4>
                      <div className="flex items-center gap-3 sm:gap-4 mt-2 text-sm font-semibold text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600"><Clock className="w-4 h-4 text-slate-400" /> {format(new Date(appointment.date), 'HH:mm')}</span>
                        {appointment.status === 'COMPLETED' && <span className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200"><CheckCircle2 className="w-4 h-4" /> Concluído</span>}
                        {appointment.status === 'CANCELED' && <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"><Ban className="w-4 h-4" /> Cancelado</span>}
                        {appointment.status === 'SCHEDULED' && <span className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">Agendado</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-20 xl:pl-0 opacity-100 xl:opacity-0 group-hover:opacity-100 transition-opacity">
                    {appointment.status === 'SCHEDULED' && (
                      <>
                        {tenantSettings.whatsappEnabled && waLink && (
                          <Link 
                            href={waLink} 
                            target="_blank" 
                            className="flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-sm transition-colors border border-emerald-200 shadow-sm"
                            title="Avisar cliente no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" /> Zap
                          </Link>
                        )}
                        <button 
                          onClick={() => openEditModal(appointment)}
                          disabled={workingId === appointment.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold text-sm transition-colors border border-blue-200 disabled:opacity-50"
                        >
                          <Edit2 className="w-4 h-4" /> Remarcar
                        </button>
                        <button 
                          onClick={() => handleStatus(appointment.id, 'COMPLETED')}
                          disabled={workingId === appointment.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Concluir
                        </button>
                        <button 
                          onClick={() => handleStatus(appointment.id, 'CANCELED')}
                          disabled={workingId === appointment.id}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-sm transition-colors border border-rose-200 disabled:opacity-50"
                        >
                          <Ban className="w-4 h-4" /> Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal is unchanged functionally */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editAppId ? "Remarcar Sessão" : "Agendar Sessão"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-5">
              {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">{error}</div>}
              
              {!editAppId && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Paciente</label>
                  <select 
                    value={patientId} 
                    onChange={e => setPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700"
                  >
                    <option value="">Selecione um paciente...</option>
                    {patients.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Horário</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700"
                  />
                </div>
              </div>

              {!editAppId && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Repetição</label>
                    <select 
                      value={recurring} 
                      onChange={e => setRecurring(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700"
                    >
                      <option value="NONE">Sessão Única</option>
                      <option value="WEEKLY">Toda Semana</option>
                      <option value="BIWEEKLY">A cada 15 dias</option>
                    </select>
                  </div>
                  {recurring !== "NONE" && (
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Quantas vezes?</label>
                      <input 
                        type="number" 
                        min="2" max="24"
                        value={occurrences}
                        onChange={e => setOccurrences(parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700"
                      />
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] disabled:opacity-50 mt-4 active:scale-95"
              >
                {loading ? "Salvando..." : (editAppId ? "Confirmar Remarcação" : "Confirmar Sessão")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
