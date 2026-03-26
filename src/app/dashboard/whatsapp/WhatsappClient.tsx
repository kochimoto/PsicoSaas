"use client";

import { useState, useEffect, useRef } from "react";
import { updateSettingsAction } from "@/app/actions/settings";
import {
  getWhatsappQrCodeAction,
  checkWhatsappStatusAction,
  disconnectWhatsappAction,
} from "@/app/actions/whatsapp";
import {
  Save, MessageCircle, AlertCircle, QrCode, CheckCircle2,
  RefreshCw, Trash2, Plus, LogOut, Clock,
} from "lucide-react";

const POLL_INTERVAL = 4000;    // 4s entre cada poll
const MAX_POLL_TIME = 120000;  // 2 min para gerar QR antes de timeout

export default function WhatsappClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [activeServices, setActiveServices] = useState<string[]>(
    initialData.services?.filter((s: any) => s.whatsappMessage?.trim()).map((s: any) => s.id) || []
  );

  // Estados WhatsApp
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Limpa o polling
  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  // Inicia polling periódico de status
  function startPolling() {
    stopPolling();
    startTimeRef.current = Date.now();

    pollRef.current = setInterval(async () => {
      // Timeout após MAX_POLL_TIME
      if (Date.now() - startTimeRef.current > MAX_POLL_TIME) {
        stopPolling();
        setIsInitializing(false);
        setTimedOut(true);
        return;
      }

      try {
        const res = (await checkWhatsappStatusAction()) as any;

        if (res.connected) {
          stopPolling();
          setIsConnected(true);
          setIsInitializing(false);
          setQrCode(null);
          setTimedOut(false);
          return;
        }

        if (res.qrcode) {
          setQrCode(res.qrcode);
          setIsInitializing(false);
        }
      } catch (err) {
        console.error("[WA] poll error:", err);
      }
    }, POLL_INTERVAL);
  }

  // Verifica status ao montar
  useEffect(() => {
    checkWhatsappStatusAction().then((res: any) => {
      if (res.connected) setIsConnected(true);
      else if (res.qrcode) {
        setQrCode(res.qrcode);
        startPolling();
      }
    });
    return stopPolling;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConnect() {
    setStatusLoading(true);
    setError("");
    setTimedOut(false);
    setQrCode(null);

    const res = (await getWhatsappQrCodeAction()) as any;

    if (res.error) {
      setError(res.error);
    } else if (res.connected) {
      setIsConnected(true);
    } else if (res.qrcode) {
      setQrCode(res.qrcode);
      startPolling();
    } else if (res.initializing) {
      setIsInitializing(true);
      startPolling();
    }

    setStatusLoading(false);
  }

  async function handleDisconnect() {
    if (!confirm("Deseja desconectar o WhatsApp?")) return;
    setStatusLoading(true);
    await disconnectWhatsappAction();
    setIsConnected(false);
    setQrCode(null);
    setIsInitializing(false);
    setTimedOut(false);
    stopPolling();
    setStatusLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await updateSettingsAction(formData);
    if (res?.error) setError(res.error);
    else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-bl-full -z-10 opacity-60" />

        {/* Toggle ativo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
            <MessageCircle className="w-6 h-6 text-emerald-600" />
            Ativar Robô Oficial
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.whatsappEnabled}
              onChange={e => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
            />
            <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500" />
          </label>
        </div>

        <div className="bg-sky-50 border border-sky-100 p-5 rounded-2xl flex gap-4 text-sky-900 shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0 text-sky-600 mt-0.5" />
          <p className="font-medium leading-relaxed">
            Quando ativado, os pacientes receberão lembretes automáticos no WhatsApp sobre consultas e cobranças.
          </p>
        </div>

        <div className={`space-y-6 transition-opacity duration-300 pt-2 ${!formData.whatsappEnabled ? "opacity-40 pointer-events-none grayscale" : ""}`}>
          {/* Número */}
          <div className="max-w-2xl">
            <label className="block text-sm font-bold text-slate-700 mb-2">Número de Resposta (Seu WhatsApp)</label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="Ex: 11999999999"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
            />
          </div>

          {/* Mensagem de consulta */}
          <div className="max-w-4xl">
            <label className="block text-sm font-bold text-slate-700 mb-2">Mensagem Padrão de Lembrete</label>
            <textarea
              value={formData.whatsappMessage}
              onChange={e => setFormData({ ...formData, whatsappMessage: e.target.value })}
              className="w-full min-h-[140px] bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700 resize-y leading-relaxed"
            />
            <p className="text-sm text-slate-500 mt-3 font-semibold">
              Variáveis: <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mx-1 border border-emerald-100/50">{"{nome}"}</code>
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mx-1 border border-emerald-100/50">{"{data}"}</code>
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold border border-emerald-100/50">{"{hora}"}</code>
            </p>
          </div>

          {/* Mensagem de cobrança */}
          <div className="max-w-4xl pt-6 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">Mensagem de Lembrete Financeiro</label>
            <textarea
              value={formData.whatsappPaymentMessage}
              onChange={e => setFormData({ ...formData, whatsappPaymentMessage: e.target.value })}
              className="w-full min-h-[140px] bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700 resize-y leading-relaxed"
              placeholder="Mensagem de cobrança..."
            />
            <p className="text-sm text-slate-500 mt-3 font-semibold pb-2">
              Variáveis: <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mx-1 border border-emerald-100/50">{"{nome}"}</code>
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mx-1 border border-emerald-100/50">{"{valor}"}</code>
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mx-1 border border-emerald-100/50">{"{descricao}"}</code>
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold border border-emerald-100/50">{"{link_pagamento}"}</code>
            </p>
          </div>

          {/* Mensagem de documentos */}
          <div className="max-w-4xl pt-6 border-t border-slate-100">
            <label className="block text-sm font-bold text-slate-700 mb-2">Mensagem de Envio de Documentos</label>
            <textarea
              value={formData.whatsappDocumentMessage}
              onChange={e => setFormData({ ...formData, whatsappDocumentMessage: e.target.value })}
              className="w-full min-h-[140px] bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700 resize-y leading-relaxed"
              placeholder="Mensagem para envio de documentos..."
            />
            <p className="text-sm text-slate-500 mt-3 font-semibold pb-2">
              Variáveis: <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mx-1 border border-emerald-100/50">{"{nome}"}</code>
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mx-1 border border-emerald-100/50">{"{documento}"}</code>
              <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold border border-emerald-100/50">{"{link}"}</code>
            </p>
          </div>

          {/* Mensagens por serviço */}
          <div className="max-w-4xl pt-6 border-t border-slate-100 space-y-4">
            <h3 className="block text-sm font-bold text-slate-700 mb-4">Mensagens Personalizadas por Serviço (Limite: 5)</h3>
            {activeServices.length === 0 && (
              <p className="text-sm text-slate-500 font-medium">Nenhum serviço com mensagem personalizada ainda.</p>
            )}
            <div className="space-y-4">
              {activeServices.map(id => {
                const service = formData.services?.find((s: any) => s.id === id);
                if (!service) return null;
                return (
                  <div key={id} className="p-5 border border-slate-200 rounded-2xl bg-white relative shadow-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveServices(prev => prev.filter(x => x !== id));
                        setFormData((prev: any) => ({
                          ...prev,
                          services: prev.services.map((s: any) => s.id === id ? { ...s, whatsappMessage: "" } : s),
                        }));
                      }}
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <label className="font-bold text-slate-800 text-sm block mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Serviço: {service.name}
                    </label>
                    <textarea
                      value={service.whatsappMessage}
                      onChange={e => {
                        setFormData((prev: any) => ({
                          ...prev,
                          services: prev.services.map((s: any) => s.id === id ? { ...s, whatsappMessage: e.target.value } : s),
                        }));
                      }}
                      placeholder={`Mensagem para ${service.name}`}
                      className="w-full min-h-[100px] border border-slate-200 rounded-xl p-4 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700 resize-y"
                    />
                  </div>
                );
              })}
            </div>
            {formData.services && activeServices.length < 5 && activeServices.length < formData.services.length && (
              <div className="pt-4 flex items-center gap-3">
                <div className="flex-1 max-w-sm relative">
                  <select
                    value=""
                    onChange={e => {
                      const val = e.target.value;
                      if (val && activeServices.length < 5 && !activeServices.includes(val)) {
                        setActiveServices([...activeServices, val]);
                      }
                    }}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-600 font-semibold rounded-xl pl-4 pr-10 py-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>+ Adicionar serviço personalizado...</option>
                    {formData.services.filter((s: any) => !activeServices.includes(s.id)).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <Plus className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conexão */}
        <div className="border-t border-slate-100 pt-8 mt-4">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            Conexão com o Aparelho
          </h3>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Status + Botões */}
            <div className="space-y-4">
              {isConnected ? (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 text-emerald-800">
                  <div className="bg-emerald-500 p-2 rounded-full shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">WhatsApp Conectado!</p>
                    <p className="text-sm opacity-80">Seu sistema já pode disparar mensagens automaticamente.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={statusLoading}
                    title="Desconectar"
                    className="text-rose-400 hover:text-rose-600 transition-colors p-2 shrink-0"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-3 text-center">
                  <p className="text-slate-600 font-medium">
                    {timedOut
                      ? "Tempo esgotado. A Evolution API pode estar inicializando. Tente novamente."
                      : "Seu WhatsApp ainda não está pareado com o servidor."}
                  </p>
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={statusLoading || isInitializing}
                    className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {statusLoading ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> Aguarde...</>
                    ) : timedOut ? (
                      <><RefreshCw className="w-5 h-5" /> Tentar Novamente</>
                    ) : (
                      "Gerar QR Code de Conexão"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Área do QR */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-8 bg-slate-50/50 min-h-[300px]">
              {qrCode ? (
                <div className="space-y-4 text-center">
                  <div className="bg-white p-4 rounded-2xl shadow-md inline-block">
                    <img
                      src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                      alt="WhatsApp QR Code"
                      className="w-52 h-52"
                    />
                  </div>
                  <p className="text-sm text-slate-500 font-medium px-4">
                    Abra o WhatsApp → <strong>Aparelhos Conectados</strong> → <strong>Conectar um Aparelho</strong>
                  </p>
                </div>
              ) : isConnected ? (
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <p className="text-slate-500 font-bold">Aparelho Pronto</p>
                </div>
              ) : isInitializing ? (
                <div className="text-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-emerald-500 mx-auto animate-spin" />
                  <div className="space-y-1">
                    <p className="text-slate-700 font-bold">Gerando QR Code...</p>
                    <p className="text-xs text-slate-500 max-w-[220px]">
                      Pode levar até 30 segundos na primeira vez. Aguarde sem fechar a página.
                    </p>
                  </div>
                </div>
              ) : timedOut ? (
                <div className="text-center space-y-3 opacity-60">
                  <Clock className="w-12 h-12 mx-auto text-amber-500" />
                  <p className="font-bold text-slate-600">Tempo Esgotado</p>
                  <p className="text-xs text-slate-500 max-w-[220px]">
                    O servidor demorou mais que o esperado. Tente novamente.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2 opacity-30">
                  <QrCode className="w-16 h-16 mx-auto" />
                  <p className="font-bold">QR Code aparecerá aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 text-[15px] font-bold rounded-2xl border border-rose-100">
          {error}
        </div>
      )}

      <div className="flex justify-end items-center gap-6 pb-12">
        {success && (
          <span className="text-emerald-700 font-extrabold bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-200 animate-in fade-in slide-in-from-right-4 shadow-sm">
            🎉 Configurações de WhatsApp atualizadas!
          </span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] active:scale-95 disabled:opacity-70"
        >
          {loading ? "Salvando..." : <><Save className="w-5 h-5" /> Salvar Regras</>}
        </button>
      </div>
    </form>
  );
}
