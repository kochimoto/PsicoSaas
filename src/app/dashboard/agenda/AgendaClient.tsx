"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Clock, UserIcon, MessageCircle, MoreVertical, X, Check, Phone, RefreshCw
} from "lucide-react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";
import { toast } from "sonner";

export default function AgendaClient({ initialAppointments, patients }: { initialAppointments: any[], patients: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState(initialAppointments);
  const [view, setView] = useState("month");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  // Navegação
  const next = () => setCurrentDate(addDays(currentDate, view === "month" ? 30 : 7));
  const prev = () => setCurrentDate(addDays(currentDate, view === "month" ? -30 : -7));

  async function handleStatusChange(id: string, status: string) {
    setLoading(id);
    const res = await updateAppointmentStatusAction(id, status);
    if (res.success) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
      toast.success("Status atualizado!");
    } else {
      toast.error("Erro ao atualizar status");
    }
    setLoading(null);
  }

  // Lógica de Renderização do Mês
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900 capitalize">
            {format(currentDate, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={prev} className="p-1.5 hover:bg-white rounded-md transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold hover:bg-white rounded-md transition-all">Hoje</button>
            <button onClick={next} className="p-1.5 hover:bg-white rounded-md transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <button onClick={() => setView("month")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === "month" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>Mês</button>
            <button onClick={() => setView("week")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${view === "week" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500"}`}>Semana</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
        {view === "month" ? (
          <div className="grid grid-cols-7 border-b border-slate-200">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
              <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase border-r border-slate-100 last:border-0">{day}</div>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-7 h-full">
          {days.map((day, i) => {
            const dayAppointments = appointments.filter(app => isSameDay(new Date(app.date), day));
            return (
              <div key={i} className={`min-h-[120px] p-2 border-r border-b border-slate-100 group transition-colors hover:bg-slate-50 ${!isSameDay(day, currentDate) && format(day, "M") !== format(currentDate, "M") ? "bg-slate-50/50" : ""}`}>
                <div className={`text-sm font-bold mb-2 flex items-center justify-center w-7 h-7 rounded-full ${isSameDay(day, new Date()) ? "bg-teal-600 text-white" : "text-slate-600"}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayAppointments.map(app => (
                    <div key={app.id} className="p-1 px-2 text-[10px] bg-teal-50 border border-teal-100 text-teal-800 rounded-md font-bold truncate cursor-pointer hover:bg-teal-100 transition-colors flex items-center justify-between" title={app.patient.name}>
                       <span>{format(new Date(app.date), "HH:mm")} {app.patient.name.split(" ")[0]}</span>
                       {loading === app.id ? <RefreshCw className="w-2 h-2 animate-spin" /> : null}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


