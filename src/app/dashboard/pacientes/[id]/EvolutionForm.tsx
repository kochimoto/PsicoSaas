"use client";

import { useState } from "react";
import { addClinicalRecord } from "@/app/actions/records";
import { CheckCircle2 } from "lucide-react";

export default function EvolutionForm({ patientId }: { patientId: string }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit() {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await addClinicalRecord(patientId, content);
    if (res?.error) {
      setError(res.error);
    } else {
      setContent("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 relative">
      {error && <div className="p-4 bg-rose-500/10 text-rose-400 text-sm font-bold rounded-2xl border border-rose-500/20 animate-pulse">{error}</div>}
      {success && (
        <div className="absolute -top-16 right-0 flex items-center gap-3 text-emerald-400 text-xs font-black uppercase tracking-widest bg-slate-950 px-6 py-3 rounded-2xl border border-emerald-500/30 shadow-2xl animate-in fade-in slide-in-from-top-4 backdrop-blur-md">
          <CheckCircle2 className="w-4 h-4" /> Relatório salvo
        </div>
      )}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Descreva a evolução, comportamentos e notas da sessão de hoje..."
        className="w-full min-h-[200px] p-6 bg-slate-950 border border-slate-800 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-brand focus:bg-slate-900 transition-all text-slate-200 font-medium leading-relaxed resize-y shadow-inner placeholder:text-slate-700"
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={loading || !content.trim()}
          className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-[0_4px_20px_rgba(13,148,136,0.3)] active:scale-95 flex items-center gap-2"
        >
          {loading ? "Salvando..." : <><CheckCircle2 className="w-5 h-5" /> Salvar Evolução</>}
        </button>
      </div>
    </div>
  );
}
