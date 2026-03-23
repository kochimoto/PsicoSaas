"use client";

import { useState, useEffect } from "react";
import { updateSettingsAction } from "@/app/actions/settings";
import { getWhatsappQrCodeAction, checkWhatsappStatusAction } from "@/app/actions/whatsapp";
import { Save, MessageCircle, AlertCircle, QrCode, CheckCircle2, RefreshCw } from "lucide-react";

export default function WhatsappClient({ initialData }: { initialData: any }) {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Estados do WhatsApp
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Poll de status quando o QR Code é gerado
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (qrCode && !isConnected) {
      interval = setInterval(async () => {
        const res = await checkWhatsappStatusAction();
        if (res.connected) {
          setIsConnected(true);
          setQrCode(null);
          clearInterval(interval);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [qrCode, isConnected]);

  // Verificar status inicial
  useEffect(() => {
    checkWhatsappStatusAction().then(res => {
      if (res.connected) setIsConnected(true);
    });
  }, []);

  async function handleConnect() {
    setStatusLoading(true);
    setError("");
    const res = await getWhatsappQrCodeAction();
    if (res.error) {
      setError(res.error);
    } else if (res.connected) {
      setIsConnected(true);
      setQrCode(null);
    } else if (res.qrcode) {
      setQrCode(res.qrcode);
    }
    setStatusLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await updateSettingsAction(formData);
    if (res?.error) {
       setError(res.error);
    } else {
       setSuccess(true);
       setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-50 rounded-bl-full -z-10 opacity-60"></div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 tracking-tight">
             Ativar Robô Oficial
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              value="" 
              className="sr-only peer"
              checked={formData.whatsappEnabled}
              onChange={e => setFormData({...formData, whatsappEnabled: e.target.checked})}
            />
            <div className="w-16 h-8 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="bg-sky-50 border border-sky-100 p-5 rounded-2xl flex gap-4 text-sky-900 shadow-sm">
          <AlertCircle className="w-6 h-6 shrink-0 text-sky-600 mt-0.5" />
          <p className="font-medium leading-relaxed">Quando ativado, os pacientes receberão links no WhatsApp com mensagens formatadas dinamicamente.</p>
        </div>

        <div className={`space-y-6 transition-opacity duration-300 pt-2 ${!formData.whatsappEnabled ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
          <div className="max-w-2xl">
            <label className="block text-sm font-bold text-slate-700 mb-2">Número de Resposta (Seu WhatsApp)</label>
            <input 
              type="text" 
              value={formData.whatsappNumber}
              onChange={e => setFormData({...formData, whatsappNumber: e.target.value})}
              placeholder="Ex: 11999999999"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
            />
          </div>

          <div className="max-w-4xl">
            <label className="block text-sm font-bold text-slate-700 mb-2">Mensagem Padrão de Lembrete</label>
            <textarea 
              value={formData.whatsappMessage}
              onChange={e => setFormData({...formData, whatsappMessage: e.target.value})}
              className="w-full min-h-[140px] bg-slate-50 border border-slate-200 rounded-2xl p-5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700 resize-y leading-relaxed"
            />
            <p className="text-sm text-slate-500 mt-3 font-semibold">
              Variáveis suportadas: <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold ml-1 mr-1 border border-emerald-100/50">{"{nome}"}</code> <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold mr-1 border border-emerald-100/50">{"{data}"}</code> <code className="bg-emerald-50 px-2 py-1 rounded text-emerald-700 font-bold border border-emerald-100/50">{"{hora}"}</code>
            </p>
          </div>
        </div>

        {/* Seção de Conexão */}
        <div className="border-t border-slate-100 pt-8 mt-4">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            Conexão com o Aparelho
          </h3>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              {isConnected ? (
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4 text-emerald-800">
                  <div className="bg-emerald-500 p-2 rounded-full">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">WhatsApp Conectado!</p>
                    <p className="text-sm opacity-80">Seu sistema já pode disparar mensagens automaticamente.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4 text-center">
                  <p className="text-slate-600 font-medium">Seu WhatsApp ainda não está pareado com a VPS.</p>
                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={statusLoading}
                    className="w-full bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {statusLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Gerar QR Code de Conexão</>
                    )}
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-8 bg-slate-50/50 min-h-[300px]">
              {qrCode ? (
                <div className="space-y-4 text-center">
                  <div className="bg-white p-4 rounded-2xl shadow-md inline-block">
                    <img src={`data:image/png;base64,${qrCode}`} alt="WhatsApp QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium px-4">
                    Abra o WhatsApp no seu celular {'>'} Aparelhos Conectados {'>'} Conectar um Aparelho
                  </p>
                </div>
              ) : isConnected ? (
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
                  <p className="text-slate-500 font-bold">Aparelho Pronto</p>
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

      {error && <div className="p-4 bg-rose-50 text-rose-600 text-[15px] font-bold rounded-2xl border border-rose-100">{error}</div>}
      
      <div className="flex justify-end items-center gap-6 pb-12">
        {success && <span className="text-emerald-700 font-extrabold bg-emerald-50 px-5 py-3 rounded-xl border border-emerald-200 animate-in fade-in slide-in-from-right-4 shadow-sm">🎉 Configurações de WhatsApp atualizadas!</span>}
        <button 
          type="submit" 
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] active:scale-95 disabled:opacity-70"
        >
          {loading ? "Salvando Alterações..." : <><Save className="w-5 h-5" /> Salvar Regras</>}
        </button>
      </div>
    </form>
  );
}
