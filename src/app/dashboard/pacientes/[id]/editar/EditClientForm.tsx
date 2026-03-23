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
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
          {errorMsg}
        </div>
      )}
      
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Dados Pessoais</h3>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo *</label>
            <input {...register("name")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">CPF</label>
            <input {...register("cpf")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700" placeholder="Apenas números" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">E-mail</label>
            <input type="email" {...register("email")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Telefone / WhatsApp</label>
            <input {...register("phone")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700" />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Endereço Completo</label>
          <input {...register("address")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700" />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Anotações Internas (Opcional)</label>
          <textarea {...register("notes")} rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700"></textarea>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 p-6 rounded-2xl">
          <div>
            <h4 className="font-bold text-slate-900">Status do Prontuário</h4>
            <p className="text-sm text-slate-500 font-medium">Pacientes inativos não aparecem na lista padrão.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register("active")} className="sr-only peer" />
            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {patient.userId && (
          <div className="pt-4 space-y-4">
             <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Acesso ao Portal</h3>
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Alterar Senha do Paciente</label>
               <input 
                 type="password" 
                 {...register("portalPassword")} 
                 placeholder="Deixe em branco para manter a atual"
                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all font-medium text-slate-700" 
               />
               {errors.portalPassword && <p className="mt-1 text-xs text-red-500">{errors.portalPassword.message}</p>}
               <p className="mt-2 text-xs text-slate-400 font-medium">O login do paciente é: <span className="font-bold">{patient.portalLogin}</span></p>
             </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isPending}
          className="w-full sm:w-auto text-rose-600 bg-rose-50 hover:bg-rose-100 px-6 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 border border-rose-100 disabled:opacity-50"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Excluir Paciente
        </button>

        <button
          type="submit"
          disabled={isPending || isDeleting}
          className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center shadow-lg shadow-blue-600/20 disabled:opacity-70 active:scale-95"
        >
          {isPending && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {isPending ? "Salvando..." : "Atualizar Cadastro"}
        </button>
      </div>
    </form>
  );
}
