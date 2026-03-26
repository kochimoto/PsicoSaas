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
    <form onSubmit={handleSave} className="space-y-10 pb-20">
      <div className="bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-800 shadow-2xl space-y-10 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-60" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 relative">
          <h2 className="text-3xl font-black text-white flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg">
              <MessageCircle className="w-8 h-8 text-emerald-500" />
            </div>
            Ativar Robô Oficial
          </h2>
          <label className="relative inline-flex items-center cursor-pointer scale-125 mr-4">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.whatsappEnabled}
              onChange={e => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
            />
            <div className="w-16 h-8 bg-slate-950 border border-slate-800 rounded-full peer peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500/30 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-700 after:border-slate-800 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 after:shadow-lg peer-checked:after:bg-white" />
          </label>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-[2rem] flex gap-5 text-emerald-400 shadow-2xl backdrop-blur-md relative group hover:bg-emerald-500/10 transition-all">
          <AlertCircle className="w-7 h-7 shrink-0 text-emerald-500 animate-pulse" />
          <p className="font-medium leading-relaxed italic">
            Quando ativado, os pacientes receberão lembretes automáticos no WhatsApp sobre consultas e cobranças.
          </p>
        </div>

        <div className={`space-y-6 transition-opacity duration-300 pt-2 ${!formData.whatsappEnabled ? "opacity-40 pointer-events-none grayscale" : ""}`}>
          <div className="max-w-2xl space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Número de Resposta (Seu WhatsApp)</label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="Ex: 11999999999"
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-white shadow-inner placeholder:text-slate-700"
            />
          </div>

          <div className="max-w-4xl space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Mensagem Padrão de Lembrete</label>
            <textarea
              value={formData.whatsappMessage}
              onChange={e => setFormData({ ...formData, whatsappMessage: e.target.value })}
              className="w-full min-h-[160px] bg-slate-950 border border-slate-800 rounded-3xl p-6 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-white shadow-inner leading-relaxed resize-y placeholder:text-slate-700"
            />
            <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest pl-2">
              Variáveis: <code className="bg-emerald-500/10 px-3 py-1 rounded-lg text-emerald-400 font-bold mx-1 border border-emerald-500/20">{"{nome}"}</code>
              <code className="bg-emerald-500/10 px-3 py-1 rounded-lg text-emerald-400 font-bold mx-1 border border-emerald-500/20">{"{data}"}</code>
              <code className="bg-emerald-500/10 px-3 py-1 rounded-lg text-emerald-400 font-bold border border-emerald-500/20">{"{hora}"}</code>
            </p>
          </div>

          <div className="max-w-4xl pt-10 border-t border-slate-800 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Mensagem de Lembrete Financeiro</label>
            <textarea
              value={formData.whatsappPaymentMessage}
              onChange={e => setFormData({ ...formData, whatsappPaymentMessage: e.target.value })}
              className="w-full min-h-[160px] bg-slate-950 border border-slate-800 rounded-3xl p-6 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-white shadow-inner leading-relaxed resize-y"
              placeholder="Mensagem de cobrança..."
            />
            <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest pl-2 flex flex-wrap gap-2">
              <span className="mt-1">Variáveis:</span>
              <code className="bg-emerald-500/10 px-2 py-1 rounded-md text-emerald-400 font-bold border border-emerald-500/20">{"{nome}"}</code>
              <code className="bg-emerald-500/10 px-2 py-1 rounded-md text-emerald-400 font-bold border border-emerald-500/20">{"{valor}"}</code>
              <code className="bg-emerald-500/10 px-2 py-1 rounded-md text-emerald-400 font-bold border border-emerald-500/20">{"{descricao}"}</code>
              <code className="bg-emerald-500/10 px-2 py-1 rounded-md text-emerald-400 font-bold border border-emerald-500/20">{"{link_pagamento}"}</code>
            </p>
          </div>

          <div className="max-w-4xl pt-10 border-t border-slate-800 space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Mensagem de Envio de Documentos</label>
            <textarea
              value={formData.whatsappDocumentMessage}
              onChange={e => setFormData({ ...formData, whatsappDocumentMessage: e.target.value })}
              className="w-full min-h-[160px] bg-slate-950 border border-slate-800 rounded-3xl p-6 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-white shadow-inner leading-relaxed resize-y"
              placeholder="Mensagem para envio de documentos..."
            />
            <p className="text-[10px] text-slate-600 mt-4 font-black uppercase tracking-widest pl-2">
              Variáveis: <code className="bg-emerald-500/10 px-3 py-1 rounded-lg text-emerald-400 font-bold mx-1 border border-emerald-500/20">{"{nome}"}</code>
              <code className="bg-emerald-500/10 px-3 py-1 rounded-lg text-emerald-400 font-bold mx-1 border border-emerald-500/20">{"{documento}"}</code>
              <code className="bg-emerald-500/10 px-3 py-1 rounded-lg text-emerald-400 font-bold border border-emerald-500/20">{"{link}"}</code>
            </p>
          </div>

          <div className="max-w-4xl pt-10 border-t border-slate-800 space-y-6">
            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div> Mensagens por Serviço <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">(Limite: 5)</span>
            </h3>
            {activeServices.length === 0 && (
              <p className="text-xs text-slate-500 font-bold italic pl-4">Nenhum serviço com mensagem personalizada ainda.</p>
            )}
            <div className="grid grid-cols-1 gap-6">
              {activeServices.map(id => {
                const service = formData.services?.find((s: any) => s.id === id);
                if (!service) return null;
                return (
                  <div key={id} className="p-8 border border-slate-800 rounded-[2.5rem] bg-slate-950 relative shadow-2xl group overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-bl-full -z-10"></div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveServices(prev => prev.filter(x => x !== id));
                        setFormData((prev: any) => ({
                          ...prev,
                          services: prev.services.map((s: any) => s.id === id ? { ...s, whatsappMessage: "" } : s),
                        }));
                      }}
                      className="absolute top-6 right-6 text-slate-600 hover:text-rose-500 transition-all p-3 hover:bg-rose-500/10 rounded-2xl active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <label className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4 block flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      {service.name}
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
                      className="w-full min-h-[120px] border border-slate-800 rounded-2xl p-6 bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-white shadow-inner resize-y placeholder:text-slate-700"
                    />
                  </div>
                );
              })}
            </div>
            {formData.services && activeServices.length < 5 && activeServices.length < formData.services.length && (
              <div className="pt-4 flex items-center gap-4">
                <div className="flex-1 max-w-sm relative group">
                  <select
                    value=""
                    onChange={e => {
                      const val = e.target.value;
                      if (val && activeServices.length < 5 && !activeServices.includes(val)) {
                        setActiveServices([...activeServices, val]);
                      }
                    }}
                    className="w-full appearance-none bg-slate-950 border border-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl pl-6 pr-12 py-4 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer hover:bg-slate-800 transition-all shadow-xl"
                  >
                    <option value="" disabled>+ Adicionar serviço personalizado...</option>
                    {formData.services.filter((s: any) => !activeServices.includes(s.id)).map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <Plus className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none group-hover:scale-110 transition-transform" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-10 mt-6 pt-12">
          <h3 className="text-2xl font-black text-white mb-10 flex items-center gap-4 tracking-tight">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
              <QrCode className="w-7 h-7 text-emerald-500" />
            </div>
            Conexão com o Aparelho
          </h3>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Status + Botões */}
            <div className="space-y-6">
              {isConnected ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 text-emerald-400 shadow-[0_20px_50px_rgba(16,185,129,0.1)] backdrop-blur-md relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full blur-2xl"></div>
                  <div className="bg-emerald-500 p-3 rounded-2xl shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-xl text-white tracking-tight">WhatsApp Conectado!</p>
                    <p className="text-sm font-medium text-emerald-400/70 italic">Seu sistema já pode disparar mensagens automaticamente.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    disabled={statusLoading}
                    className="p-4 bg-slate-950 text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-slate-800 active:scale-90"
                    title="Desconectar"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 text-center shadow-2xl backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-500/5 blur-3xl rounded-full"></div>
                  <p className="text-slate-400 font-bold italic text-lg leading-relaxed relative">
                    {timedOut
                      ? "Tempo esgotado. A Evolution API pode estar inicializando. Tente novamente."
                      : "Seu WhatsApp ainda não está pareado com o servidor."}
                  </p>
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={statusLoading || isInitializing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 active:scale-95 relative"
                  >
                    {statusLoading ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> Aguarde...</>
                    ) : timedOut ? (
                      <><RefreshCw className="w-5 h-5" /> Tentar Novamente</>
                    ) : (
                      <><QrCode className="w-5 h-5" /> Gerar QR Code de Conexão</>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Área do QR */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[3rem] p-10 bg-slate-950/50 min-h-[340px] shadow-inner relative group backdrop-blur-md">
              <div className="absolute inset-0 bg-brand/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {qrCode ? (
                <div className="space-y-6 text-center relative">
                  <div className="bg-white p-6 rounded-[2rem] shadow-2xl inline-block transform rotate-1 hover:rotate-0 transition-transform">
                    <img
                      src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                      alt="WhatsApp QR Code"
                      className="w-56 h-56 rounded-xl"
                    />
                  </div>
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 max-w-[280px] mx-auto">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-relaxed">
                      WhatsApp → <strong>Aparelhos Conectados</strong> → <strong>Conectar um Aparelho</strong>
                    </p>
                  </div>
                </div>
              ) : isConnected ? (
                <div className="text-center space-y-4 relative">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20 shadow-2xl">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  </div>
                  <p className="text-white text-xl font-black tracking-tight uppercase tracking-widest text-xs">Aparelho Pronto</p>
                </div>
              ) : isInitializing ? (
                <div className="text-center space-y-6 relative">
                  <RefreshCw className="w-16 h-16 text-emerald-500 mx-auto animate-spin" />
                  <div className="space-y-2">
                    <p className="text-white font-black text-xl tracking-tight">Gerando QR Code...</p>
                    <p className="text-xs text-slate-500 max-w-[240px] italic">
                      Pode levar até 30 segundos. Aguarde aqui.
                    </p>
                  </div>
                </div>
              ) : timedOut ? (
                <div className="text-center space-y-4 relative opacity-60">
                  <Clock className="w-16 h-16 mx-auto text-amber-500 animate-pulse" />
                  <p className="font-black text-white uppercase tracking-widest text-xs">Tempo Esgotado</p>
                  <p className="text-[10px] text-slate-600 max-w-[220px] font-bold">
                    O servidor demorou mais que o esperado. Tente novamente.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4 relative opacity-40 group-hover:opacity-100 transition-opacity">
                  <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 flex items-center justify-center mx-auto shadow-2xl">
                    <QrCode className="w-16 h-16 text-slate-700" />
                  </div>
                  <p className="font-black text-slate-600 uppercase tracking-widest text-[10px]">QR Code aparecerá aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-rose-500/10 text-rose-400 text-sm font-black uppercase tracking-widest rounded-[2rem] border border-rose-500/20 shadow-2xl animate-in zoom-in-95 backdrop-blur-md">
          <div className="flex items-center gap-3">
             <AlertCircle className="w-5 h-5 shrink-0" />
             {error}
          </div>
        </div>
      )}

      <div className="fixed bottom-8 right-8 flex items-center gap-6 z-50">
        {success && (
          <span className="text-emerald-400 font-black uppercase tracking-widest text-[10px] bg-slate-900/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-emerald-500/20 animate-in fade-in slide-in-from-right-10 shadow-full shadow-brand/10">
            🎉 Configurações de WhatsApp atualizadas!
          </span>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand hover:bg-brand-hover text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs flex items-center gap-3 transition-all shadow-[0_15px_40px_rgba(13,148,136,0.3)] hover:shadow-brand/40 active:scale-95 disabled:opacity-70 group"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> Salvar Regras</>}
        </button>
      </div>
    </form>
  );
}
