"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, Clock, Plus, X, MessageCircle, CheckCircle2, Ban, Edit2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createAppointmentAction, updateAppointmentStatusAction, updateAppointmentDateAction } from "@/app/actions/appointments";
import { sendManualReminderAction } from "@/app/actions/whatsapp";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Patient = { id: string; name: string; phone?: string | null };
type Appointment = {
  id: string;
  date: Date | string | number;
  status: string;
  patient: { name: string; phone?: string | null } | null;
  service?: { name: string } | null;
};
type Service = { id: string; name: string; price: number };
type TenantSettings = { whatsappEnabled: boolean; whatsappMessage: string };

export default function AgendaClient({ initialAppointments, patients, services, tenantSettings }: { initialAppointments: Appointment[], patients: Patient[], services: Service[], tenantSettings: TenantSettings }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurring, setRecurring] = useState<"NONE"|"WEEKLY"|"BIWEEKLY">("NONE");
  const [occurrences, setOccurrences] = useState(4);
  const [editAppId, setEditAppId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  function openNewModal() {
    setEditAppId(""); setPatientId(""); setServiceId(""); setDate(""); setTime(""); setRecurring("NONE"); setOccurrences(4); setError(""); setIsModalOpen(true);
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
      res = await createAppointmentAction({ patientId, date: dateTime, recurring, occurrences, serviceId: serviceId || null });
    }

    if (res?.error) {
      setError(res.error);
      toast.error(res.error);
    } else {
      setIsModalOpen(false);
      toast.success(editAppId ? "Sessão Remarcada" : "Sessão Agendada");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleStatus(id: string, status: string) {
    setWorkingId(id);
    const res = await updateAppointmentStatusAction(id, status);
    if (res?.success) {
      const msg = status === 'COMPLETED' ? 'Sessão Concluída' : status === 'CANCELED' ? 'Sessão Cancelada' : 'Status Atualizado';
      toast.success(msg);
    } else if (res?.error) {
      toast.error(res.error);
    }
    setWorkingId("");
    router.refresh();
  }

  async function handleSendReminder(id: string) {
    setWorkingId(id);
    const res = await sendManualReminderAction(id);
    if (res.success) {
      toast.success("Lembrete enviado via WhatsApp!");
    } else {
      toast.error(res.error || "Erro ao enviar lembrete.");
    }
    setWorkingId("");
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
          className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_4px_20px_rgba(13,148,136,0.3)] active:scale-95"
        >
          <Plus className="w-5 h-5" /> Agendar Sessão
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-sm">
        {initialAppointments.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-inner group hover:scale-110 transition-transform">
              <CalendarIcon className="w-12 h-12 text-slate-700 group-hover:text-brand-accent transition-colors" />
            </div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Agenda vazia</h3>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium italic">Nenhuma sessão programada para hoje ou dias futuros.</p>
            <button 
              onClick={openNewModal}
              className="bg-slate-950 border border-slate-800 text-brand-accent font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-slate-900 transition-all active:scale-95"
            >
              Agendar agora
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50 p-4 sm:p-8">
            {initialAppointments.map(appointment => {
              const waLink = getWhatsAppLink(appointment);
              return (
                <div key={appointment.id} className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 py-8 hover:bg-slate-950/30 transition-all rounded-[2rem] px-4 sm:px-8 group">
                  <div className="flex items-center gap-6 sm:gap-8">
                    <div className={`w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center shrink-0 border shadow-2xl transition-transform group-hover:scale-105 ${appointment.status === 'COMPLETED' ? 'bg-slate-950 border-slate-800 text-slate-600' : appointment.status === 'CANCELED' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-brand/10 text-brand-accent border-brand/20 shadow-brand/5'}`}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{format(new Date(appointment.date), 'MMM', { locale: ptBR })}</span>
                      <span className="text-3xl font-black leading-none mt-1 uppercase tracking-tighter">{format(new Date(appointment.date), 'dd')}</span>
                    </div>
                    <div>
                      <h4 className={`text-xl sm:text-2xl font-black tracking-tight ${appointment.status === 'CANCELED' ? 'text-slate-600 line-through' : 'text-white'}`}>{appointment.patient?.name || "Paciente Removido"}</h4>
                      <div className="flex items-center gap-3 sm:gap-4 mt-3 text-xs font-black uppercase tracking-widest flex-wrap">
                        <span className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800"><Clock className="w-4 h-4 text-brand-accent" /> {format(new Date(appointment.date), 'HH:mm')}</span>
                        {appointment.service && <span className="flex items-center gap-2 text-brand-accent bg-brand/10 px-3 py-1.5 rounded-lg border border-brand/20">{appointment.service.name}</span>}
                        {appointment.status === 'COMPLETED' && <span className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"><CheckCircle2 className="w-4 h-4" /> Concluído</span>}
                        {appointment.status === 'CANCELED' && <span className="flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20"><Ban className="w-4 h-4" /> Cancelado</span>}
                        {appointment.status === 'SCHEDULED' && <span className="flex items-center gap-2 text-sky-400 bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20">Agendado</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-6 xl:mt-0 w-full xl:w-auto opacity-100 transition-opacity">
                    {appointment.status === 'SCHEDULED' && (
                      <>
                        {tenantSettings.whatsappEnabled && (
                          <button 
                            onClick={() => handleSendReminder(appointment.id)}
                            disabled={workingId === appointment.id}
                            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-emerald-500/20 shadow-xl disabled:opacity-50 active:scale-95"
                            title="Avisar cliente no WhatsApp"
                          >
                            {workingId === appointment.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                            Zap
                          </button>
                        )}
                        <button 
                          onClick={() => openEditModal(appointment)}
                          disabled={workingId === appointment.id}
                          className="flex items-center justify-center gap-2 px-5 py-3 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-slate-800 disabled:opacity-50 active:scale-95"
                        >
                          <Edit2 className="w-4 h-4 text-brand-accent" /> Remarcar
                        </button>
                        <button 
                          onClick={() => handleStatus(appointment.id, 'COMPLETED')}
                          disabled={workingId === appointment.id}
                          className="flex items-center justify-center gap-2 px-5 py-3 bg-brand/10 text-brand-accent hover:bg-brand/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-brand/20 disabled:opacity-50 active:scale-95 shadow-lg shadow-brand/5"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Concluir
                        </button>
                        <button 
                          onClick={() => handleStatus(appointment.id, 'CANCELED')}
                          disabled={workingId === appointment.id}
                          className="flex items-center justify-center gap-2 px-5 py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-rose-500/20 disabled:opacity-50 active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-2xl font-black text-white tracking-tight">{editAppId ? "Remarcar Sessão" : "Agendar Sessão"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-950 hover:bg-slate-800 p-3 rounded-2xl border border-slate-800 transition-all shadow-xl active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-6">
              {error && <div className="p-4 bg-rose-500/10 text-rose-400 text-sm font-bold rounded-2xl border border-rose-500/20 animate-pulse">{error}</div>}
              
              {!editAppId && (
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Paciente</label>
                    <select 
                      value={patientId} 
                      onChange={e => setPatientId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white appearance-none"
                    >
                      <option value="">Selecione...</option>
                      {patients.map(p => (
                         <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Serviço</label>
                    <select 
                      value={serviceId} 
                      onChange={e => setServiceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white appearance-none"
                    >
                      <option value="">Nenhum (Manual)</option>
                      {services.map(s => (
                         <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white shadow-inner inv-scheme-dark"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Horário</label>
                  <input 
                    type="time" 
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white shadow-inner inv-scheme-dark"
                  />
                </div>
              </div>

              {!editAppId && (
                <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-800">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Repetição</label>
                    <select 
                      value={recurring} 
                      onChange={e => setRecurring(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white appearance-none"
                    >
                      <option value="NONE">Sessão Única</option>
                      <option value="WEEKLY">Toda Semana</option>
                      <option value="BIWEEKLY">A cada 15 dias</option>
                    </select>
                  </div>
                  {recurring !== "NONE" && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Vezes</label>
                      <input 
                        type="number" 
                        min="2" max="24"
                        value={occurrences}
                        onChange={e => setOccurrences(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white shadow-inner"
                      />
                    </div>
                  )}
                </div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-brand/20 disabled:opacity-50 mt-6 active:scale-95"
              >
                {loading ? <RefreshCw className="w-5 h-5 mx-auto animate-spin" /> : (editAppId ? "Confirmar Remarcação" : "Confirmar Sessão")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
