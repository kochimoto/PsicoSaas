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
  RefreshCw, LogOut, Clock,
} from "lucide-react";

const POLL_INTERVAL = 4000;
const MAX_POLL_TIME = 120000;

export default function WhatsappClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Estados WhatsApp
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function startPolling() {
    stopPolling();
    startTimeRef.current = Date.now();
    pollRef.current = setInterval(async () => {
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
    <form onSubmit={handleSave} className="max-w-4xl space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-teal-600" /> Configuração do WhatsApp
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.whatsappEnabled}
              onChange={e => setFormData({ ...formData, whatsappEnabled: e.target.checked })}
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600" />
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-blue-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>Quando ativado, os pacientes receberão lembretes automáticos no WhatsApp sobre consultas e cobranças.</p>
        </div>

        <div className={`space-y-4 ${!formData.whatsappEnabled ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Seu Número WhatsApp (Para Respostas)</label>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="Ex: 5511999999999"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Mensagem Padrão de Lembrete</label>
            <textarea
              value={formData.whatsappMessage}
              onChange={e => setFormData({ ...formData, whatsappMessage: e.target.value })}
              className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Olá {nome}, lembrete da sua consulta em {data} às {hora}."
            />
            <p className="text-xs text-slate-500">
              Tags: <code className="bg-slate-200 px-1 rounded">{"{nome}"}</code>, <code className="bg-slate-200 px-1 rounded">{"{data}"}</code>, <code className="bg-slate-200 px-1 rounded">{"{hora}"}</code>
            </p>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-700">Mensagem de Lembrete Financeiro (Cobrança)</label>
             <textarea
              value={formData.whatsappPaymentMessage}
              onChange={e => setFormData({ ...formData, whatsappPaymentMessage: e.target.value })}
              className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Lembrete de pagamento pendente..."
            />
             <p className="text-xs text-slate-500">
              Tags: <code className="bg-slate-200 px-1 rounded">{"{nome}"}</code>, <code className="bg-slate-200 px-1 rounded">{"{valor}"}</code>, <code className="bg-slate-200 px-1 rounded">{"{descricao}"}</code>, <code className="bg-slate-200 px-1 rounded">{"{link_pagamento}"}</code>
            </p>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-semibold text-slate-700">Mensagem de Envio de Documento</label>
             <textarea
              value={formData.whatsappDocumentMessage}
              onChange={e => setFormData({ ...formData, whatsappDocumentMessage: e.target.value })}
              className="w-full min-h-[100px] bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="Seu documento {documento} está disponível..."
            />
             <p className="text-xs text-slate-500">
              Tags: <code className="bg-slate-200 px-1 rounded">{"{nome}"}</code>, <code className="bg-slate-200 px-1 rounded">{"{documento}"}</code>, <code className="bg-slate-200 px-1 rounded">{"{link}"}</code>
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
             <QrCode className="w-5 h-5 text-teal-600" /> Conexão do Aparelho
          </h3>

          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="w-full sm:w-1/2 space-y-4">
              {isConnected ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">Conectado!</p>
                    <p className="text-xs">Seu WhatsApp está pronto para enviar mensagens.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Desconectar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">
                    {timedOut ? "O servidor demorou para responder. Tente novamente." : "Pare o seu WhatsApp para começar a disparar mensagens automáticas."}
                  </p>
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={statusLoading || isInitializing}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {statusLoading || isInitializing ? (
                       <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <QrCode className="w-5 h-5" />
                    )}
                    {statusLoading || isInitializing ? "Aguarde..." : timedOut ? "Tentar Novamente" : "Gerar QR Code"}
                  </button>
                </div>
              )}
            </div>

            <div className="w-full sm:w-1/2 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center aspect-square max-w-[240px]">
              {qrCode ? (
                <div className="p-4 bg-white rounded-xl shadow-sm">
                   <img src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`} alt="WhatsApp QR Code" className="w-full h-full" />
                </div>
              ) : isConnected ? (
                <div className="text-center text-emerald-600">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                  <p className="font-bold">WhatsApp Ativo</p>
                </div>
              ) : isInitializing ? (
                <div className="text-center text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Iniciando sessão...</p>
                </div>
              ) : (
                <div className="text-center text-slate-400 px-4">
                   <QrCode className="w-10 h-10 mx-auto mb-2 opacity-20" />
                   <p className="text-xs">O QR Code aparecerá aqui aguardando conexão.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 disabled:opacity-70 flex items-center gap-2"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          {loading ? "Salvando..." : <><Save className="w-4 h-4" /> Salvar Configurações</>}
        </button>
        {success && <span className="text-emerald-600 font-bold text-sm animate-in fade-in slide-in-from-left-2">Configurações salvas com sucesso!</span>}
      </div>
    </form>
  );
}



