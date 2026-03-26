"use client";

import { useTransition } from "react";
import { togglePatientStatusAction } from "@/app/actions/patients";
import { toast } from "sonner";

export default function StatusToggle({ id, active }: { id: string, active: boolean }) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const res = await togglePatientStatusAction(id);
      if (res.success) {
        toast.success(`Paciente ${!active ? 'ativado' : 'inativado'} com sucesso!`);
      } else {
        toast.error("Erro ao atualizar status");
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        active ? "bg-teal-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
          active ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}
