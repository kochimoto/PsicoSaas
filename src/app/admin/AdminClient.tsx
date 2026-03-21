"use client";

import { useState } from "react";
import { Users, Server, DollarSign, Key, Trash2, Shield } from "lucide-react";
import { updateTenantPlanAction, deleteAccountAction, resetPasswordAction } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export default function AdminClient({ tenants, usersCount, mrr }: { tenants: any[], usersCount: number, mrr: number }) {
  const router = useRouter();
  const [workingId, setWorkingId] = useState("");
  const [resetModalData, setResetModalData] = useState<{userId: string, name: string} | null>(null);
  const [newPassword, setNewPassword] = useState("");

  async function handlePlanChange(tenantId: string, plan: string) {
    if(!confirm(`Deseja alterar o plano desta clínica para ${plan}?`)) return;
    setWorkingId(tenantId);
    await updateTenantPlanAction(tenantId, plan);
    setWorkingId("");
    router.refresh();
  }

  async function handleDelete(userId: string, name: string) {
    const confirmName = prompt(`⚠️ ATENÇÃO EXTREMA ⚠️\nIsso irá excluir PERMANENTEMENTE o usuário ${name}, a clínica, todos os pacientes, transações e prontuários vinculados!\n\nPara confirmar, digite EXCLUIR:`);
    if(confirmName !== "EXCLUIR") return;
    
    setWorkingId(userId);
    const res = await deleteAccountAction(userId);
    if(res?.error) alert(res.error);
    setWorkingId("");
    router.refresh();
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if(!resetModalData) return;
    setWorkingId("reset");
    const res = await resetPasswordAction(resetModalData.userId, newPassword);
    if(res?.error) {
      alert(res.error);
    } else {
      alert("Senha alterada com sucesso!");
      setResetModalData(null);
      setNewPassword("");
    }
    setWorkingId("");
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">MRR Geração</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">R$ {mrr.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <Server className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Clínicas Ativas</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{tenants.length}</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-5 hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Usuários (SaaS)</p>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{usersCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Últimas Clínicas Cadastradas</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5 font-bold">Clínica / Nome</th>
                <th className="px-8 py-5 font-bold">Plano Atual</th>
                <th className="px-8 py-5 font-bold">Pacientes</th>
                <th className="px-8 py-5 font-bold text-right">Ações de Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tenants.map(tenant => (
                <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-900 text-base">{tenant.clinicName || 'Clínica Padrão'}</div>
                    <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Users className="w-4 h-4 text-slate-400" /> {tenant.owner.name} ({tenant.owner.email})
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <select
                      value={tenant.plan}
                      disabled={workingId === tenant.id}
                      onChange={(e) => handlePlanChange(tenant.id, e.target.value)}
                      className="text-sm font-bold bg-slate-100 border border-slate-200 text-slate-700 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="FREE">INICIANTE (FREE)</option>
                      <option value="VIP_MENSAL">VIP MENSAL (R$97)</option>
                      <option value="VIP_ANUAL">VIP ANUAL (R$997)</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <div className="font-bold text-slate-700">{tenant._count.patients}</div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setResetModalData({ userId: tenant.owner.id, name: tenant.owner.name })}
                        className="p-2 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors tooltip"
                        title="Redefinir Senha do Usuário"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button 
                         onClick={() => handleDelete(tenant.owner.id, tenant.owner.name)}
                         disabled={workingId === tenant.owner.id}
                         className="p-2 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors tooltip disabled:opacity-50"
                         title="Excluir Conta Permanentemente"
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

      {resetModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <form onSubmit={handleResetPassword} className="p-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4 border border-slate-200">
                <Shield className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Redefinir Senha</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Insira a nova senha para o usuário <strong>{resetModalData.name}</strong>.</p>
              
              <input
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Ex: novaSenha!123"
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />

              <div className="flex gap-3">
                <button type="button" onClick={() => setResetModalData(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={workingId === "reset" || newPassword.length < 6} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
                  {workingId === "reset" ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
