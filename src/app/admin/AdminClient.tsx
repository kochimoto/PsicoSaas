"use client";

import { useState } from "react";
import { 
  Users, UserPlus, Shield, Activity, Search, 
  Trash2, Mail, Link as LinkIcon, MoreVertical, 
  CheckCircle2, AlertCircle, RefreshCw, Building
} from "lucide-react";
import { createTenantAction, deleteTenantAction, updateTenantAction } from "@/app/actions/admin";
import { toast } from "sonner";

export default function AdminClient({ initialTenants }: { initialTenants: any[] }) {
  const [tenants, setTenants] = useState(initialTenants);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredTenants = tenants.filter(t => 
    t.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(id: string) {
    if (!confirm("Suspender clínica permanentemente? Isso apagará todos os dados associados.")) return;
    const res = await deleteTenantAction(id);
    if (res.success) {
      setTenants(prev => prev.filter(t => t.id !== id));
      toast.success("Clínica removida com sucesso");
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão do SaaS</h1>
          <p className="text-slate-500">Administre clínicas e profissionais da plataforma</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
        >
          <UserPlus className="w-5 h-5" /> Nova Clínica
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Clínicas" value={tenants.length} icon={<Building className="text-teal-600" />} />
        <StatCard title="Pacientes Totais" value={tenants.reduce((acc, t) => acc + (t._count?.patients || 0), 0)} icon={<Users className="text-blue-600" />} />
        <StatCard title="Plano VIP" value={tenants.filter(t => t.plan === 'VIP').length} icon={<Shield className="text-indigo-600" />} />
        <StatCard title="Receita Prevista" value={`R$ ${(tenants.length * 97).toFixed(2)}`} icon={<Activity className="text-emerald-600" />} />
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por clínica ou profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-teal-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Clínica / Profissional</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Pacientes</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{t.clinicName || "Sem Nome"}</div>
                    <div className="text-xs text-slate-500">{t.owner.name} • {t.owner.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${t.plan === 'VIP' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {t.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {t._count?.patients || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg inline-flex">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ATIVO
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <button 
                      onClick={() => handleDelete(t.id)}
                      className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CreateTenantModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={(newTenant) => {
            setTenants([newTenant, ...tenants]);
            setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
       <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
          {icon}
       </div>
       <div>
         <p className="text-sm font-medium text-slate-500">{title}</p>
         <p className="text-2xl font-bold text-slate-900">{value}</p>
       </div>
    </div>
  );
}

function CreateTenantModal({ onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    clinicName: "",
    plan: "FREE"
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await createTenantAction(formData);
    if (res.success) {
      toast.success("Clínica criada!");
      onSuccess(res.tenant);
    } else {
      toast.error(res.error || "Erro ao criar");
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Novo Tenant (Clínica)</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><AlertCircle className="w-6 h-6 rotate-45" /></button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Profissional</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Ex: Dr. João" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail de Login</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="clinica@psico.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Senha Inicial</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome da Clínica</label>
              <input required value={formData.clinicName} onChange={e => setFormData({...formData, clinicName: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Clínica Psico Gestão" />
            </div>
            <div className="space-y-1">
               <label className="text-xs font-bold text-slate-500 uppercase ml-1">Plano Inicial</label>
               <select value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
                 <option value="FREE">FREE (Limitado)</option>
                 <option value="VIP">VIP (Completo)</option>
               </select>
            </div>
            <div className="pt-4 flex gap-4">
               <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50">Cancelar</button>
               <button disabled={loading} className="flex-1 py-3 bg-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                 {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                 Gerar Acesso
               </button>
            </div>
          </form>
       </div>
    </div>
  );
}
