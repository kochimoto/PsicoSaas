"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPatientAction } from "../../../actions/patients";

const patientSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  cpf: z.string().optional(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  createPortalAccess: z.boolean(),
  portalLogin: z.string().optional(),
  portalPassword: z.string().optional(),
}).refine(data => {
  if (data.createPortalAccess && (!data.portalLogin || !data.portalPassword)) {
    return false;
  }
  return true;
}, {
  message: "Usuário e Senha de Acesso são obrigatórios para gerar o Portal.",
  path: ["createPortalAccess"]
});

type PatientData = z.infer<typeof patientSchema>;

export default function NovoPacientePage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
    defaultValues: { createPortalAccess: false }
  });

  const createPortalAccess = watch("createPortalAccess");

  async function onSubmit(data: PatientData) {
    setIsPending(true);
    setErrorMsg("");
    setSuccessMsg("");

    const result = await createPatientAction(data);
    setIsPending(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.success) {
      setSuccessMsg(result.message);
      // Aguarda o usuario ler
    }
  }

  if (successMsg) {
    return (
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] text-center shadow-2xl backdrop-blur-sm">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-inner">
            <Save className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Paciente Cadastrado!</h2>
          <pre className="text-left bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-300 text-sm whitespace-pre-wrap max-w-md mx-auto my-8 font-mono leading-relaxed shadow-inner">
            {successMsg}
          </pre>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/pacientes" className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-brand/20">
              Ver Todos os Pacientes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pacientes" className="p-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-2xl transition-all hover:scale-110 shadow-lg text-slate-400 hover:text-white">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Novo Paciente</h1>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 md:p-10 space-y-10">
          
          {errorMsg && (
            <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl text-sm font-bold border border-rose-500/20 animate-pulse">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-8">
            <h3 className="text-xl font-black text-white border-b border-slate-800/50 pb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-brand rounded-full"></span> Dados Pessoais
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo *</label>
                <input {...register("name")} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700" placeholder="Nome do paciente" />
                {errors.name && <p className="mt-1 text-xs font-bold text-rose-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">CPF</label>
                <input {...register("cpf")} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700" placeholder="Apenas números" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                <input type="email" {...register("email")} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700" />
                {errors.email && <p className="mt-1 text-xs font-bold text-rose-500">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                <input {...register("phone")} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Endereço Completo</label>
              <input {...register("address")} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Anotações Internas (Opcional)</label>
              <textarea {...register("notes")} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700"></textarea>
            </div>
          </div>

          <div className="bg-slate-950 p-8 rounded-[1.5rem] border border-slate-800 shadow-inner">
            <div className="flex items-start gap-4">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  {...register("createPortalAccess")}
                  className="w-6 h-6 text-brand rounded-lg border-slate-800 bg-slate-900 focus:ring-brand cursor-pointer" 
                />
              </div>
              <div>
                <label className="font-extrabold text-white text-lg">Gerar acesso ao Portal do Paciente</label>
                <p className="text-sm text-slate-500 mt-1 font-medium italic">
                  O paciente poderá acessar o portal para baixar laudos e visualizar recibos usando o E-mail e uma Senha criada por você.
                </p>
                {errors.createPortalAccess && <p className="mt-2 text-xs font-black text-rose-500 uppercase tracking-widest">{errors.createPortalAccess.message}</p>}
              </div>
            </div>
            {createPortalAccess && (
              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Usuário de Acesso (Login) *</label>
                    <input 
                      type="text" 
                      {...register("portalLogin")} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand outline-none font-bold text-white placeholder:text-slate-700 shadow-inner" 
                      placeholder="Ex: joaosilva ou e-mail" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Definir Senha de Acesso *</label>
                    <input 
                      type="text" 
                      {...register("portalPassword")} 
                      className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand outline-none font-bold text-white placeholder:text-slate-700 shadow-inner" 
                      placeholder="Ex: paciente123" 
                    />
                  </div>
                </div>
                <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-brand-accent bg-brand/5 p-4 rounded-xl border border-brand/10 inline-block">
                  Dica: O usuário pode ser o próprio e-mail ou qualquer nome único que você escolher.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={isPending}
              className="bg-brand hover:bg-brand-hover text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center shadow-[0_4px_20px_rgba(13,148,136,0.3)] disabled:opacity-70 active:scale-95"
            >
              {isPending && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
              {isPending ? "Salvando..." : <><Save className="w-5 h-5 mr-3" /> Salvar Paciente</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
