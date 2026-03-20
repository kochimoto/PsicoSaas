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
    <div className="space-y-4 relative">
      {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl">{error}</div>}
      {success && (
        <div className="absolute -top-14 right-0 flex items-center gap-2 text-teal-600 text-sm font-bold bg-teal-50 px-4 py-2 rounded-full border border-teal-100 shadow-sm animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4" /> Relatório salvo
        </div>
      )}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Descreva a evolução, comportamentos e notas da sessão de hoje..."
        className="w-full min-h-[160px] p-5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium leading-relaxed resize-y shadow-inner"
      />
      <div className="flex justify-end">
        <button
          onClick={submit}
          disabled={loading || !content.trim()}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
        >
          {loading ? "Salvando..." : "Salvar Evolução"}
        </button>
      </div>
    </div>
  );
}
