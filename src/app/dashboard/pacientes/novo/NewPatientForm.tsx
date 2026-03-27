"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield, UserPlus, Loader2 } from "lucide-react";
import { createPatientAction } from "@/app/actions/patients";

export default function NewPatientForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            cpf: formData.get("cpf") as string,
            address: formData.get("address") as string,
            notes: formData.get("notes") as string,
            createPortalAccess: formData.get("createPortalAccess") === "true",
            portalLogin: formData.get("portalLogin") as string,
            portalPassword: formData.get("portalPassword") as string,
        };

        try {
            const res = await createPatientAction(data);
            if (res.success) {
                toast.success(res.message || "Paciente cadastrado com sucesso!");
                router.push("/dashboard/pacientes");
                router.refresh();
            } else {
                toast.error(res.error || "Ocorreu um erro ao cadastrar");
            }
        } catch (err) {
            toast.error("Erro de conexão com o servidor");
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo *</label>
              <input 
                name="name" required
                placeholder="Ex: João da Silva"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
              <input 
                name="email" type="email"
                placeholder="joao@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Telefone / WhatsApp</label>
              <input 
                name="phone"
                placeholder="5511999999999"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">CPF</label>
              <input 
                name="cpf"
                placeholder="000.000.000-00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Endereço Residencial</label>
            <input 
              name="address"
              placeholder="Rua, Número, Bairro, Cidade - UF"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700"
            />
          </div>

          {/* Portal Access Section */}
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">Acesso ao Portal do Paciente</h3>
             </div>
             <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  name="createPortalAccess" 
                  id="createPortalAccess"
                  value="true"
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="createPortalAccess" className="text-sm font-semibold text-slate-700">Criar acesso ao portal agora</label>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Usuário de Login</label>
                   <input 
                     name="portalLogin"
                     placeholder="Ex: joao123 ou joao@email.com"
                     className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-sm text-slate-700"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Senha de Acesso</label>
                   <input 
                     name="portalPassword"
                     type="text"
                     placeholder="Defina uma senha"
                     className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-sm text-slate-700"
                   />
                </div>
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Observações Internas</label>
            <textarea 
              name="notes"
              className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium resize-none text-slate-700"
              placeholder="Histórico médico relevante, queixas iniciais, etc."
            ></textarea>
          </div>

          <div className="pt-4">
             <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all disabled:opacity-70"
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
               {loading ? "Processando..." : "Confirmar Cadastro"}
             </button>
          </div>
        </form>
    );
}
