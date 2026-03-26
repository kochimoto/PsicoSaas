"use client";

import { useTransition } from "react";
import { togglePatientStatusAction } from "@/app/actions/patients";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function StatusToggle({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await togglePatientStatusAction(id);
      if (result.success) {
        toast.success(active ? "Paciente inativado" : "Paciente ativado");
      } else if (result.error) {
        toast.error(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={active ? "Clique para desativar" : "Clique para ativar"}
      className={`inline-flex items-center w-fit px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
        active 
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
          : 'bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        active ? 'Ativo' : 'Inativo'
      )}
    </button>
  );
}
