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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all animate-in fade-in duration-300">
      <div className="bg-slate-900 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative p-10 sm:p-12">
          <button 
            onClick={closePopup}
            className="absolute top-8 right-8 p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-brand/10 border border-brand/20 rounded-3xl flex items-center justify-center text-brand mb-8 shadow-2xl shadow-brand/5 animate-bounce-slow">
              <Megaphone className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              Novidades no Sistema! <Sparkles className="inline-block w-8 h-8 text-amber-500" />
            </h2>
            <p className="text-slate-400 font-medium mt-4 italic">
              Confira o que preparamos para você nesta última atualização.
            </p>
          </div>

          <div className="space-y-4 mb-12">
            <UpdateItem 
              title="Novo Modo Dark Premium" 
              description="Uma experiência visual totalmente renovada, focada no seu conforto e produtividade." 
            />
            <UpdateItem 
              title="Dashboard Inteligente" 
              description="Métricas de receita e atendimentos redesenhadas com gráficos de alta fidelidade." 
            />
            <UpdateItem 
              title="Gestão de WhatsApp VIP" 
              description="Nova interface de configuração para seus lembretes automáticos inteligentes." 
            />
            <UpdateItem 
              title="Layout Mobile Sênior" 
              description="Navegação fluida e ultra-rápida em smartphones e tablets." 
            />
          </div>

          <button 
            onClick={closePopup}
            className="w-full py-5 bg-brand hover:bg-brand-hover text-white rounded-[2rem] font-black text-lg transition-all active:scale-95 shadow-[0_15px_30px_rgba(13,148,136,0.3)] uppercase tracking-widest text-xs"
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
    <div className="flex gap-5 p-6 rounded-[2rem] bg-slate-950/50 border border-slate-800 hover:border-brand/30 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <CheckCircle2 className="w-6 h-6 text-brand" />
      </div>
      <div className="text-left">
        <h4 className="font-bold text-white text-[16px] tracking-tight">{title}</h4>
        <p className="text-sm text-slate-500 font-medium leading-relaxed mt-1">{description}</p>
      </div>
    </div>
  );
}
