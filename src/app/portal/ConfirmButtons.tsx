"use client";

import { useState } from "react";
import { updateAppointmentStatusAction } from "@/app/actions/appointments";
import { toast } from "sonner";
import { Check, X, RefreshCw } from "lucide-react";

export default function ConfirmButtons({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    const res = await updateAppointmentStatusAction(id, "CONFIRMED");
    if (res.success) {
      setStatus("CONFIRMED");
      toast.success("Consulta confirmada com sucesso!");
    } else {
      toast.error("Erro ao confirmar consulta");
    }
    setLoading(false);
  }

  if (status === "CONFIRMED") {
     return (
        <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 font-bold animate-in zoom-in-95">
           <Check className="w-5 h-5" />
           Confirmado com Sucesso
        </div>
     );
  }

  return (
    <div className="flex flex-col gap-3">
       <button 
        disabled={loading}
        onClick={handleConfirm}
        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70"
       >
         {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
         Confirmar Presença
       </button>
       <button 
        disabled={loading}
        className="w-full bg-white border border-slate-200 text-slate-500 font-bold py-4 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
       >
         <X className="w-5 h-5" />
         Não poderei comparecer
       </button>
    </div>
  );
}



