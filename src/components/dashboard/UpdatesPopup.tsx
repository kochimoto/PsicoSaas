"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Megaphone, CheckCircle2 } from "lucide-react";

const CURRENT_VERSION = "1.2.0"; // Increment when you have new major updates

export default function UpdatesPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen this version
    const lastSeenVersion = localStorage.getItem("psico_last_seen_version");
    
    // Only show on desktop (window width > 1024px)
    const isDesktop = window.innerWidth >= 1024;

    if (lastSeenVersion !== CURRENT_VERSION && isDesktop) {
      const timer = setTimeout(() => setIsOpen(true), 1500); // Small delay for better UX
      return () => clearTimeout(timer);
    }
  }, []);

  const closePopup = () => {
    localStorage.setItem("psico_last_seen_version", CURRENT_VERSION);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="relative p-8 sm:p-10">
          <button 
            onClick={closePopup}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
              <Megaphone className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Novidades no Sistema! <Sparkles className="inline-block w-6 h-6 text-amber-500" />
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Confira o que preparamos para você nesta última atualização.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <UpdateItem 
              title="Dashboard Inteligente" 
              description="Veja suas sessões diárias e receita mensal em tempo real com o novo sistema de métricas." 
            />
            <UpdateItem 
              title="Programa VIP Trial" 
              description="Novos usuários agora ganham 7 dias de acesso completo aos recursos VIP automaticamente." 
            />
            <UpdateItem 
              title="Layout Mobile Sênior" 
              description="Tabelas e menus redesenhados para uma navegação muito mais fluida no celular." 
            />
            <UpdateItem 
              title="Domínio Oficial" 
              description="Sistema migrado para laisbritoofc.com.br com links de portal corrigidos." 
            />
          </div>

          <button 
            onClick={closePopup}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            Entendido, vamos lá!
          </button>
        </div>
      </div>
    </div>
  );
}

function UpdateItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
      <CheckCircle2 className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
      <div className="text-left">
        <h4 className="font-bold text-slate-900 text-[15px]">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
