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
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-8 tracking-tight">
          <Settings className="w-7 h-7 text-slate-400" /> Perfil da Clínica
        </h2>
        
        <div className="space-y-4 max-w-2xl relative z-10">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Clínica ou Consultório</label>
            <input 
              type="text" 
              value={formData.clinicName}
              onChange={e => setFormData({...formData, clinicName: e.target.value})}
              placeholder="Ex: Consultório de Psicologia Dra. Ana"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
            />
          </div>
        </div>
      </div>



      {/* Backup and Security */}
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-4 tracking-tight">
          <AlertCircle className="w-7 h-7 text-amber-500" /> Backup e Segurança
        </h2>
        <p className="text-slate-500 font-medium mb-8 max-w-xl">
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
          className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold border border-slate-200 transition-all active:scale-95 disabled:opacity-50"
        >
          <Settings className="w-4 h-4" /> Baixar Cópia de Segurança (.json)
        </button>
      </div>

      {error && <div className="p-4 bg-rose-50 text-rose-600 text-[15px] font-bold rounded-2xl border border-rose-100">{error}</div>}
      
      <div className="flex justify-end items-center gap-6 pb-12">
        {success && <span className="text-emerald-700 font-extrabold bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-200 animate-in fade-in slide-in-from-right-4 shadow-sm">🎉 Configurações atualizadas!</span>}
        <button 
          type="submit" 
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-70"
        >
          {loading ? "Processando..." : <><Save className="w-5 h-5" /> Salvar Configurações</>}
        </button>
      </div>
    </form>
  );
}
