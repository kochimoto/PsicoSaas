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



      {error && <div className="p-4 bg-rose-50 text-rose-600 text-[15px] font-bold rounded-2xl border border-rose-100">{error}</div>}
      
      <div className="flex justify-end items-center gap-6 pb-12">
        {success && <span className="text-emerald-700 font-extrabold bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-200 animate-in fade-in slide-in-from-right-4 shadow-sm">🎉 Configurações atualizadas!</span>}
        <button 
          type="submit" 
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-slate-900/10 active:scale-95 disabled:opacity-70"
        >
          {loading ? "Salvando Alterações..." : <><Save className="w-5 h-5" /> Salvar Configurações</>}
        </button>
      </div>
    </form>
  );
}
