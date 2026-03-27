"use client";

import { useState } from "react";
import { confirmAppointmentAction, confirmDocumentAction, uploadPaymentProofAction } from "@/app/actions/portal";
import { Check, CheckCircle2, Paperclip } from "lucide-react";

export function ConfirmSessionButton({ id, confirmed }: { id: string, confirmed: boolean }) {
  const [loading, setLoading] = useState(false);
  if (confirmed) return <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100/60 uppercase tracking-widest text-[10px] flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Você Confirmou Presença</span>;

  return (
    <button 
      disabled={loading} 
      onClick={async () => { 
        setLoading(true); 
        await confirmAppointmentAction(id); 
        setLoading(false); 
        window.location.reload();
      }} 
      className="cursor-pointer text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm px-3 py-1 rounded-lg border border-blue-200 uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50 active:scale-95"
    >
      {loading ? "Confirmando..." : "Confirmar Presença"}
    </button>
  );
}

export function ConfirmDocumentButton({ id, read }: { id: string, read: boolean }) {
  const [loading, setLoading] = useState(false);
  if (read) return <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1 uppercase tracking-widest bg-emerald-50 px-2 rounded-md"><Check className="w-3 h-3"/> Lido</span>;

  return (
    <button 
      disabled={loading} 
      onClick={async () => { 
        setLoading(true); 
        await confirmDocumentAction(id); 
        setLoading(false); 
        window.location.reload();
      }} 
      className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-widest hover:bg-blue-100 transition-colors disabled:opacity-50 shadow-sm border border-blue-100"
    >
      {loading ? "..." : "Marcar Lida"}
    </button>
  );
}

export function UploadReceiptButton({ id, hasReceipt }: { id: string, hasReceipt: boolean }) {
  const [loading, setLoading] = useState(false);
  
  if (hasReceipt) {
    return (
      <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/60 uppercase tracking-widest text-[10px] font-bold flex items-center gap-1 shadow-sm">
        <CheckCircle2 className="w-3 h-3 text-emerald-500"/> Comprovante Enviado
      </span>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande. O limite é 5MB.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const res = await uploadPaymentProofAction(id, base64);
        if (res?.success) {
          window.location.reload();
        } else {
          alert(res?.error || "Erro ao enviar comprovante");
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Erro de conexão ao enviar o arquivo.");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      alert("Erro ao ler o arquivo local.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      <input 
        type="file" 
        id={`upload-${id}`} 
        className="hidden" 
        accept="image/*,.pdf" 
        onChange={handleFileChange}
        disabled={loading}
      />
      <button 
        disabled={loading} 
        onClick={() => document.getElementById(`upload-${id}`)?.click()} 
        className="cursor-pointer text-amber-700 bg-amber-50 hover:bg-amber-100 shadow-sm px-3 py-1.5 rounded-lg border border-amber-200 uppercase tracking-widest text-[10px] font-bold transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2"
      >
        <Paperclip className="w-3.5 h-3.5" />
        {loading ? "Enviando..." : "Anexar Comprovante"}
      </button>
    </div>
  );
}
