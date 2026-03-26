"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Bell } from "lucide-react";

export default function UpdatesPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("psico_last_update_seen");
    if (!hasSeen) {
      setIsOpen(true);
    }
  }, []);

  const close = () => {
    localStorage.setItem("psico_last_update_seen", "01-03-2026");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> NOVIDADE
          </div>
          <button onClick={close} className="hover:bg-teal-700 p-1 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-3">
          <h4 className="font-bold text-slate-900 text-lg">Módulo de WhatsApp v2.0</h4>
          <p className="text-slate-500 text-sm font-medium">Lançamos uma nova interface de conexão para deixar seu WhatsApp mais estável. Confira no menu da esquerda!</p>
          <button onClick={close} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors">Entendi!</button>
        </div>
      </div>
    </div>
  );
}
