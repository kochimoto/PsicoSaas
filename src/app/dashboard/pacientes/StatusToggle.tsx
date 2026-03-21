"use client";

import { useTransition } from "react";
import { togglePatientStatusAction } from "@/app/actions/patients";
import { Loader2 } from "lucide-react";

export default function StatusToggle({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await togglePatientStatusAction(id);
      if (result.error) {
        alert(result.error);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={active ? "Clique para desativar" : "Clique para ativar"}
      className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${
        active 
          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' 
          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
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
