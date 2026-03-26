"use client";

import { useState } from "react";
import { updatePatientAction } from "@/app/actions/patients";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, User, Shield } from "lucide-react";

export default function EditClientForm({ patient }: { patient: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: patient.name,
    email: patient.email || "",
    phone: patient.phone || "",
    cpf: patient.cpf || "",
    address: patient.address || "",
    notes: patient.notes || "",
    active: patient.active
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await updatePatientAction(patient.id, formData);
    if (res.success) {
      toast.success("Paciente atualizado!");
      router.push(`/dashboard/pacientes/${patient.id}`);
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao atualizar");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-slate-700">
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo</label>
            <input 
              required value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
            <input 
              type="email" value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Telefone</label>
            <input 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">CPF</label>
            <input 
              value={formData.cpf}
              onChange={e => setFormData({...formData, cpf: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Endereço Residencial</label>
          <input 
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Observações Privadas</label>
          <textarea 
            className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium resize-none"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        <div className="flex items-center gap-2 py-4">
           <input 
            type="checkbox" checked={formData.active}
            onChange={e => setFormData({...formData, active: e.target.checked})}
            className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            id="active-check"
           />
           <label htmlFor="active-check" className="text-sm font-bold text-slate-600 cursor-pointer">Paciente está ativo no consultório</label>
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all"
        >
          {loading ? "Salvando..." : <><Save className="w-5 h-5" /> Salvar Alterações</>}
        </button>
      </div>
    </form>
  );
}
