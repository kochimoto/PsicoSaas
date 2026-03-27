"use client";

import { useState } from "react";
import { updateSettingsAction } from "@/app/actions/settings";
import { Save, Building, Shield, Bell, RefreshCw } from "lucide-react";

export default function SettingsClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
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
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
           <Building className="w-6 h-6 text-teal-600" /> Perfil da Clínica
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Nome da Clínica / Consultório</label>
              <input 
                type="text"
                value={formData.clinicName}
                onChange={e => setFormData({...formData, clinicName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="Ex: Psico Clínica"
              />
           </div>
           <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">CNPJ / CPF (Opcional)</label>
              <input 
                type="text"
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="00.000.000/0001-00"
              />
           </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Endereço Completo</label>
          <input 
             type="text"
             value={formData.address}
             onChange={e => setFormData({...formData, address: e.target.value})}
             className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
             placeholder="Rua Exemplo, 123 - Centro"
          />
        </div>
      </div>

       {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

       <div className="flex items-center gap-4">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
            {loading ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Alterações</>}
          </button>
          {success && <span className="text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-left-2">Configurações salvas com sucesso!</span>}
       </div>
    </form>
  );
}


