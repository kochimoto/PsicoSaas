"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Check, Trash2, X, Calendar, Wallet, AlertCircle } from "lucide-react";
import { getNotificationsAction, markNotificationAsReadAction, markAllNotificationsAsReadAction } from "@/app/actions/notifications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.notifications) {
      setNotifications(res.notifications);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Polling every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsReadAction(id);
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsReadAction();
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'APPOINTMENT_CONFIRMED': return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'APPOINTMENT_CANCELED': return <X className="w-4 h-4 text-rose-500" />;
      case 'PAYMENT_PROOF_UPLOADED': return <Wallet className="w-4 h-4 text-amber-500" />;
      default: return <AlertCircle className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-teal-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in duration-300">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-3xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              Notificações
              {unreadCount > 0 && <span className="bg-teal-100 text-teal-700 text-[10px] px-2 py-0.5 rounded-full font-black">{unreadCount} novas</span>}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
              >
                <Check className="w-3 h-3" /> Lidas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="p-10 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-50">
                  <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">Nenhuma notificação por aqui.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 group ${!n.read ? 'bg-teal-50/30' : ''}`}
                >
                  <div className="mt-1 w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                       <p className={`text-sm font-bold truncate ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                         {n.title}
                       </p>
                       {!n.read && (
                         <button 
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1 text-slate-300 hover:text-teal-600 transition-colors"
                          title="Marcar como lida"
                         >
                           <Check className="w-4 h-4" />
                         </button>
                       )}
                    </div>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                         {format(new Date(n.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                       </span>
                       {n.link && (
                         <Link 
                           href={n.link} 
                           onClick={() => { setOpen(false); handleMarkAsRead(n.id); }}
                           className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline"
                         >
                           Ver Detalhes
                         </Link>
                       )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-center">
             <button onClick={() => setOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
