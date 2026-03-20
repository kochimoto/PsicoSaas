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
  portalPassword: z.string().optional(),
}).refine(data => {
  if (data.createPortalAccess && (!data.email || !data.portalPassword)) {
    return false;
  }
  return true;
}, {
  message: "E-mail e Senha de Acesso são obrigatórios para gerar o Portal.",
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
        <div className="bg-green-50 border border-green-200 p-8 rounded-3xl text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">Sucesso!</h2>
          <pre className="text-left bg-white p-4 rounded-xl border border-green-100 text-slate-700 text-sm whitespace-pre-wrap max-w-md mx-auto my-6 font-mono leading-relaxed shadow-sm">
            {successMsg}
          </pre>
          <div className="flex justify-center gap-4">
            <Link href="/dashboard/pacientes" className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 font-bold">
              Voltar para Pacientes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/pacientes" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-500" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Novo Paciente</h1>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
          
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}
          
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Dados Pessoais</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                <input {...register("name")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input {...register("cpf")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Apenas números" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input type="email" {...register("email")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                <input {...register("phone")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Endereço Completo</label>
              <input {...register("address")} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Anotações Internas (Opcional)</label>
              <textarea {...register("notes")} rows={3} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="flex items-start gap-4">
              <div className="flex items-center h-6">
                <input 
                  type="checkbox" 
                  {...register("createPortalAccess")}
                  className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="font-bold text-slate-900">Gerar acesso ao Portal do Paciente</label>
                <p className="text-sm text-slate-500 mt-1">
                  O paciente poderá acessar o portal para baixar laudos e visualizar recibos usando o E-mail e uma Senha criada por você.
                </p>
                {errors.createPortalAccess && <p className="mt-2 text-xs font-bold text-red-500">{errors.createPortalAccess.message}</p>}
              </div>
            </div>
            {createPortalAccess && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail de Acesso (Login)</label>
                    <input type="email" disabled value={watch("email")} className="w-full px-4 py-3 border border-slate-300 bg-slate-100/50 rounded-xl focus:outline-none" placeholder="Preencha o e-mail acima" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1">Definir Senha de Acesso *</label>
                    <input type="text" {...register("portalPassword")} className="w-full px-4 py-3 border border-blue-200 bg-white rounded-xl focus:ring-2 focus:ring-blue-500 placeholder-slate-400" placeholder="Ex: paciente123" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center shadow-lg shadow-blue-600/20 disabled:opacity-70"
            >
              {isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
              {isPending ? "Salvando..." : "Salvar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
