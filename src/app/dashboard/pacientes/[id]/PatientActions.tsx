"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, Shield, Loader2, X } from "lucide-react";
import { 
  deletePatientAction, 
  togglePatientStatusAction, 
  createPortalAccessForExistingPatientAction 
} from "@/app/actions/patients";

export default function PatientActions({ patientId, active, hasPortal }: { 
  patientId: string; 
  active: boolean; 
  hasPortal: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPortalForm, setShowPortalForm] = useState(false);
  const [portalData, setPortalData] = useState({ login: "", password: "" });

  async function handleToggleStatus() {
    setLoading(true);
    const res = await togglePatientStatusAction(patientId);
    if (res.success) {
      toast.success(active ? "Paciente desativado" : "Paciente ativado");
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao alterar status");
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const res = await deletePatientAction(patientId);
    if (res.success) {
      toast.success("Paciente excluído com sucesso");
      router.push("/dashboard/pacientes");
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao excluir paciente");
      setLoading(false);
    }
  }

  async function handleCreatePortal(e: React.FormEvent) {
    e.preventDefault();
    if (!portalData.login || !portalData.password) {
      return toast.error("Preencha todos os campos");
    }

    setLoading(true);
    const res = await createPortalAccessForExistingPatientAction(patientId, {
      portalLogin: portalData.login,
      portalPassword: portalData.password
    });

    if (res.success) {
      toast.success("Acesso ao portal criado!");
      if (res.message) {
         // Credenciais formatadas e retornadas pela action
         alert(res.message);
      }
      setShowPortalForm(false);
      router.refresh();
    } else {
      toast.error(res.error || "Erro ao criar acesso");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={handleToggleStatus}
          disabled={loading}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
            active 
            ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-100' 
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border-emerald-100'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (active ? 'Desativar' : 'Ativar')}
        </button>
        
        <button 
          onClick={() => setShowDeleteConfirm(true)}
          disabled={loading}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all border border-slate-200 flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" /> Excluir
        </button>
      </div>

      {!hasPortal && !showPortalForm && (
        <button 
          onClick={() => setShowPortalForm(true)}
          className="w-full bg-teal-50 hover:bg-teal-100 text-teal-700 py-3 rounded-xl font-bold text-xs transition-all border border-teal-100 flex items-center justify-center gap-2"
        >
          <Shield className="w-4 h-4" /> Criar Acesso ao Portal
        </button>
      )}

      {/* Portal Form */}
      {showPortalForm && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative animate-in fade-in zoom-in duration-200">
          <button onClick={() => setShowPortalForm(false)} className="absolute top-2 right-2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
          <h4 className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest mb-1">
            <Shield className="w-3 h-3 text-teal-600" /> Configurar Portal
          </h4>
          <form onSubmit={handleCreatePortal} className="space-y-2">
            <input 
              placeholder="Usuário (Email)"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              value={portalData.login}
              onChange={e => setPortalData({...portalData, login: e.target.value})}
            />
            <input 
              placeholder="Senha"
              type="text"
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              value={portalData.password}
              onChange={e => setPortalData({...portalData, password: e.target.value})}
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-teal-700 transition-all shadow-sm"
            >
              {loading ? "Criando..." : "Confirmar Acesso"}
            </button>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal Overlay */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
              <Trash2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Excluir Paciente?</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Esta ação é irreversível. Todos os dados, evoluções e o acesso ao portal deste paciente serão removidos permanentemente.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="py-4 rounded-2xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
              >
                {loading ? "Excluindo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
