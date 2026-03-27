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
    active: patient.active,
    portalLogin: patient.user?.email || "",
    portalPassword: "",
    birthDate: patient.birthDate ? new Date(patient.birthDate).toISOString().split('T')[0] : "",
    origin: patient.origin || "",
    treatmentStart: patient.treatmentStart ? new Date(patient.treatmentStart).toISOString().split('T')[0] : ""
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data de Nascimento</label>
            <input 
              type="date"
              value={formData.birthDate}
              onChange={e => setFormData({...formData, birthDate: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Origem do Cliente</label>
            <select 
              value={formData.origin}
              onChange={e => setFormData({...formData, origin: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            >
              <option value="">Selecione uma opção...</option>
              <option value="Indicação">Indicação</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Google">Google</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Início do Tratamento</label>
            <input 
              type="date"
              value={formData.treatmentStart}
              onChange={e => setFormData({...formData, treatmentStart: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase ml-1">Observações Privadas</label>
          <textarea 
            className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium resize-none"
            value={formData.notes}
            onChange={e => setFormData({...formData, notes: e.target.value})}
          ></textarea>
        </div>

        <div className="flex items-center gap-2 py-2">
           <input 
            type="checkbox" checked={formData.active}
            onChange={e => setFormData({...formData, active: e.target.checked})}
            className="w-5 h-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            id="active-check"
           />
           <label htmlFor="active-check" className="text-sm font-bold text-slate-600 cursor-pointer">Paciente está ativo no consultório</label>
        </div>

        {patient.userId && (
          <div className="pt-6 border-t border-slate-100 space-y-6">
            <div className="flex items-center gap-2 text-teal-700">
              <Shield className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Acesso ao Portal do Paciente</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Usuário / Login (Email)</label>
                <input 
                  value={formData.portalLogin}
                  onChange={e => setFormData({...formData, portalLogin: e.target.value})}
                  placeholder={patient.user?.email || "Definir login..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
                <p className="text-[10px] text-slate-400 ml-1">Login atual: <span className="font-bold">{patient.user?.email}</span></p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Alterar Senha</label>
                <input 
                  type="text"
                  value={formData.portalPassword}
                  onChange={e => setFormData({...formData, portalPassword: e.target.value})}
                  placeholder="Deixe em branco para manter"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>
            </div>
          </div>
        )}

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



