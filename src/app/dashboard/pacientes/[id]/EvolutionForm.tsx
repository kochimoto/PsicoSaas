"use client";

import { useTransition } from "react";
import { addClinicalRecord } from "@/app/actions/records";
import { toast } from "sonner";
import { ClipboardList, Shield } from "lucide-react";

export default function EvolutionForm({ patientId }: { patientId: string }) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    const content = formData.get("content") as string;
    if (!content) {
      toast.error("O conteúdo da evolução não pode estar vazio.");
      return;
    }

    startTransition(async () => {
      const res = await addClinicalRecord(patientId, content);
      if (res.success) {
        toast.success("Evolução salva com sucesso!");
        (document.getElementById("evolution-form") as HTMLFormElement)?.reset();
      } else {
        toast.error(res.error || "Erro ao salvar evolução");
      }
    });
  }

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-teal-600" /> Evolução do Paciente
      </h3>
      <form id="evolution-form" action={handleSubmit} className="space-y-4">
        <textarea 
          name="content"
          placeholder="Descreva o progresso da sessão, comportamentos e insights..."
          className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none transition-all"
        ></textarea>
        <button 
          type="submit"
          disabled={isPending}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isPending ? "Salvando..." : <><Shield className="w-4 h-4" /> Salvar Evolução</>}
        </button>
      </form>
    </div>
  );
}


