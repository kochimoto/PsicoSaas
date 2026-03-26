"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePatientAction, deletePatientAction } from "@/app/actions/patients";

const patientSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  cpf: z.string().optional().nullable(),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")).nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  active: z.boolean().default(true),
  portalPassword: z.string().min(6, "Senha deve ter 6 caracteres").optional().or(z.literal("")),
});

type PatientData = z.input<typeof patientSchema>;

export default function EditClientForm({ patient }: { patient: any }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PatientData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: patient.name,
      cpf: patient.cpf,
      email: patient.email,
      phone: patient.phone,
      address: patient.address,
      notes: patient.notes,
      active: patient.active ?? true,
      portalPassword: ""
    }
  });

  async function onSubmit(data: PatientData) {
    setIsPending(true);
    setErrorMsg("");

    const result = await updatePatientAction(patient.id, data);
    setIsPending(false);

    if (result.error) {
      setErrorMsg(result.error);
    } else {
      router.push(`/dashboard/pacientes/${patient.id}`);
    }
  }

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esse paciente? Todos os prontuários, agendamentos e transações vinculadas serão APAGADAS DEFINITIVAMENTE. Esta ação não pode ser desfeita.")) return;
    
    setIsDeleting(true);
    const result = await deletePatientAction(patient.id);
    if (result.error) {
      setErrorMsg(result.error);
      setIsDeleting(false);
    } else {
      router.push('/dashboard/pacientes');
    }
  }

  return (
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
            <input {...register("name")} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700" />
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

        <div className="pt-6 border-t border-slate-800/50 flex items-center justify-between bg-slate-950 p-8 rounded-[1.5rem] shadow-inner">
          <div>
            <h4 className="font-extrabold text-white text-lg">Status do Prontuário</h4>
            <p className="text-sm text-slate-500 font-medium italic">Pacientes inativos não aparecem na lista padrão.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register("active")} className="sr-only peer" />
            <div className="w-16 h-8 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-brand shadow-xl"></div>
          </label>
        </div>

        {patient.userId && (
          <div className="pt-8 space-y-8">
             <h3 className="text-xl font-black text-white border-b border-slate-800/50 pb-3 flex items-center gap-2">
               <span className="w-2 h-2 bg-indigo-500 rounded-full"></span> Acesso ao Portal
             </h3>
             <div className="space-y-2">
               <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Alterar Senha do Paciente</label>
               <input 
                 type="password" 
                 {...register("portalPassword")} 
                 placeholder="Deixe em branco para manter a atual"
                 className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700 shadow-inner" 
               />
               {errors.portalPassword && <p className="mt-1 text-xs font-black text-rose-500">{errors.portalPassword.message}</p>}
               <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 p-4 rounded-xl border border-indigo-500/10 inline-block">Login: <span className="text-indigo-300">{patient.portalLogin}</span></p>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-10 border-t border-slate-800/50">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isPending}
          className="w-full sm:w-auto text-rose-500 bg-slate-950 hover:bg-rose-500/10 px-8 py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-slate-800 hover:border-rose-500/30 shadow-xl disabled:opacity-50 active:scale-95"
        >
          {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
          Excluir Paciente
        </button>

        <button
          type="submit"
          disabled={isPending || isDeleting}
          className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center shadow-[0_4px_20px_rgba(13,148,136,0.3)] disabled:opacity-70 active:scale-95"
        >
          {isPending && <Loader2 className="w-5 h-5 mr-3 animate-spin" />}
          {isPending ? "Salvando..." : "Atualizar Cadastro"}
        </button>
      </div>
    </form>
  );
}
