import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChevronLeft, UserPlus, Shield } from "lucide-react";
import Link from "next/link";
import { createPatientAction } from "@/app/actions/patients";

export default async function NewPatientPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const cpf = formData.get("cpf") as string;
    const address = formData.get("address") as string;
    const notes = formData.get("notes") as string;
    
    // Portal Access
    const createPortalAccess = formData.get("createPortalAccess") === "true";
    const portalLogin = formData.get("portalLogin") as string;
    const portalPassword = formData.get("portalPassword") as string;

    const res = await createPatientAction({ 
      name, email, phone, cpf, address, notes,
      createPortalAccess,
      portalLogin,
      portalPassword
    });
    
    if (res.success) {
      redirect("/dashboard/pacientes");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/pacientes" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors">
        <ChevronLeft className="w-4 h-4" /> Cancelar e voltar
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white"><UserPlus className="w-5 h-5" /></div>
             Cadastrar Novo Paciente
          </h1>
        </div>

        <form action={handleCreate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome Completo *</label>
              <input 
                name="name" required
                placeholder="Ex: João da Silva"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">E-mail</label>
              <input 
                name="email" type="email"
                placeholder="joao@email.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Telefone / WhatsApp</label>
              <input 
                name="phone"
                placeholder="5511999999999"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">CPF</label>
              <input 
                name="cpf"
                placeholder="000.000.000-00"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Endereço Residencial</label>
            <input 
              name="address"
              placeholder="Rua, Número, Bairro, Cidade - UF"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
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
                <label htmlFor="createPortalAccess" className="text-sm font-semibold text-slate-700 underline decoration-slate-200">Criar acesso ao portal agora</label>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">E-mail de Login</label>
                   <input 
                     name="portalLogin"
                     placeholder="paciente@portal.com"
                     className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-sm"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Senha de Acesso</label>
                   <input 
                     name="portalPassword"
                     type="text"
                     placeholder="Defina uma senha"
                     className="w-full bg-white border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-sm"
                   />
                </div>
             </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Observações Internas</label>
            <textarea 
              name="notes"
              className="w-full min-h-[120px] bg-slate-50 border border-slate-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium resize-none"
              placeholder="Histórico médico relevante, queixas iniciais, etc."
            ></textarea>
          </div>

          <div className="pt-4">
             <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all">
               <Shield className="w-5 h-5" /> Confirmar Cadastro
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}



