"use client";

import { useState } from "react";
import { 
  Users, Shield, Activity, Search, 
  Trash2, Mail, CheckCircle2, RefreshCw, Building, Key, Lock
} from "lucide-react";
import { 
  updateTenantPlanAction, 
  deleteAccountAction, 
  resetPasswordAction 
} from "@/app/actions/admin";
import { toast } from "sonner";

export default function AdminClient({ initialTenants }: { initialTenants: any[] }) {
  const [tenants, setTenants] = useState(initialTenants);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const filteredTenants = tenants.filter(t => 
    t.clinicName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(ownerId: string) {
    if (!confirm("Tem certeza que deseja excluir esta conta? Esta ação é irreversível e apagará todos os dados da clínica.")) return;
    setLoading(true);
    const res = await deleteAccountAction(ownerId);
    if (res.success) {
      setTenants(prev => prev.filter(t => t.ownerId !== ownerId));
      toast.success("Conta excluída com sucesso");
    } else {
      toast.error(res.error || "Erro ao excluir conta");
    }
    setLoading(false);
  }

  async function handleUpdatePlan(id: string, currentPlan: string) {
    const newPlan = currentPlan === 'VIP' ? 'FREE' : 'VIP';
    const res = await updateTenantPlanAction(id, newPlan);
    if (res.success) {
      setTenants(prev => prev.map(t => t.id === id ? { ...t, plan: newPlan } : t));
      toast.success(`Plano atualizado para ${newPlan}`);
    } else {
      toast.error(res.error || "Erro ao atualizar plano");
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestão do SaaS</h1>
          <p className="text-slate-500">Administre clínicas e profissionais da plataforma</p>
        </div>
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
                    <button 
                      onClick={() => handleUpdatePlan(t.id, t.plan)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${t.plan === 'VIP' ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {t.plan}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            const newPass = prompt("Nova senha:");
                            if (newPass) resetPasswordAction(t.ownerId, newPass).then(r => r.success ? toast.success("Senha alterada") : toast.error(r.error));
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                          title="Resetar Senha"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(t.ownerId)}
                          disabled={loading}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Excluir Conta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
