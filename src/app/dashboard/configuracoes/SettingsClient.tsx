"use client";

import { useState } from "react";
import { updateSettingsAction } from "@/app/actions/settings";
import { Save, Settings, MessageCircle, AlertCircle } from "lucide-react";

export default function SettingsClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await updateSettingsAction(formData);
    if (res?.error) {
       setError(res.error);
    } else {
       setSuccess(true);
       setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Clinic settings */}
      <div className="bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-8 tracking-tight">
          <Settings className="w-7 h-7 text-brand-accent" /> Perfil da Clínica
        </h2>
        
        <div className="space-y-6 max-w-2xl relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome da Clínica ou Consultório</label>
            <input 
              type="text" 
              value={formData.clinicName}
              onChange={e => setFormData({...formData, clinicName: e.target.value})}
              placeholder="Ex: Consultório de Psicologia Dra. Ana"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700"
            />
          </div>
        </div>
      </div>



      {/* Backup and Security */}
      <div className="bg-slate-900 p-6 md:p-10 rounded-[2.5rem] border border-slate-800 shadow-xl relative overflow-hidden backdrop-blur-sm">
        <h2 className="text-2xl font-black text-white flex items-center gap-3 mb-4 tracking-tight">
          <AlertCircle className="w-7 h-7 text-amber-500" /> Backup e Segurança
        </h2>
        <p className="text-slate-400 font-medium mb-8 max-w-xl">
          Baixe uma cópia completa de todos os seus dados (pacientes, sessões, finanças e documentos) em formato JSON para sua segurança pessoal.
        </p>
        
        <button
          type="button"
          onClick={async () => {
            const { exportDataAction } = await import("@/app/actions/backup");
            setLoading(true);
            const res = await exportDataAction();
            setLoading(false);
            if (res.success && res.data) {
              const blob = new Blob([res.data], { type: "application/json" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = res.filename || "backup.json";
              a.click();
              window.URL.revokeObjectURL(url);
            } else {
              alert(res.error || "Erro ao gerar backup");
            }
          }}
          disabled={loading}
          className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 text-slate-300 px-6 py-4 rounded-2xl font-bold border border-slate-800 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
        >
          <Settings className="w-5 h-5 text-brand-accent" /> Baixar Cópia de Segurança (.json)
        </button>
      </div>

      {error && <div className="p-4 bg-rose-500/10 text-rose-400 text-[15px] font-bold rounded-2xl border border-rose-500/20">{error}</div>}
      
      <div className="flex justify-end items-center gap-6 pb-12">
        {success && <span className="text-emerald-400 font-black bg-emerald-500/10 px-5 py-3 rounded-2xl border border-emerald-500/20 animate-in fade-in slide-in-from-right-4 shadow-xl">🎉 Configurações atualizadas!</span>}
        <button 
          type="submit" 
          disabled={loading}
          className="bg-brand hover:bg-brand-hover text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_4px_20px_rgba(13,148,136,0.3)] active:scale-95 disabled:opacity-70"
        >
          {loading ? (
             <div className="flex items-center gap-2">
               <Save className="w-5 h-5 animate-pulse" /> Processando...
             </div>
          ) : <><Save className="w-6 h-6" /> Salvar Tudo</>}
        </button>
      </div>
    </form>
  );
}
