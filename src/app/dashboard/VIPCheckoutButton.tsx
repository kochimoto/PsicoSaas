"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";

export default function VIPCheckoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    try {
      setLoading(true);
      const res = await fetch("/api/mercadopago/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Erro ao conectar com Mercado Pago");
        setLoading(false);
      }
    } catch (err) {
      alert("Erro de comunicação.");
      setLoading(false);
    }
  }

  return (
    <button 
      disabled={loading}
      onClick={handleCheckout}
      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-[0_4px_14px_0_rgba(59,130,246,0.39)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.23)] transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 sm:w-auto w-full justify-center shrink-0"
    >
      <Sparkles className="w-5 h-5" />
      {loading ? "Redirecionando..." : "Assinar com Mercado Pago (R$ 1,00/mês)"}
    </button>
  );
}


