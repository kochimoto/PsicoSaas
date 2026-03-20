"use client";

import { useState } from "react";
import { confirmAppointmentAction, confirmDocumentAction } from "@/app/actions/portal";
import { Check, CheckCircle2 } from "lucide-react";

export function ConfirmSessionButton({ id, confirmed }: { id: string, confirmed: boolean }) {
  const [loading, setLoading] = useState(false);
  if (confirmed) return <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/60 uppercase tracking-widest text-[10px] flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> VOcê Confirmou Presença</span>;

  return (
    <button disabled={loading} onClick={async () => { setLoading(true); await confirmAppointmentAction(id); setLoading(false); }} className="cursor-pointer text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm px-3 py-1 rounded-lg border border-blue-200 uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50 active:scale-95">
      {loading ? "Confirmando..." : "Confirmar Presença"}
    </button>
  );
}

export function ConfirmDocumentButton({ id, read }: { id: string, read: boolean }) {
  const [loading, setLoading] = useState(false);
  if (read) return <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 uppercase tracking-widest bg-emerald-50 px-2 rounded-md"><Check className="w-3 h-3"/> Lido</span>;

  return (
    <button disabled={loading} onClick={async () => { setLoading(true); await confirmDocumentAction(id); setLoading(false); }} className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-blue-100 transition-colors disabled:opacity-50 shadow-sm border border-blue-100">
      {loading ? "..." : "Marcar Lida"}
    </button>
  );
}
