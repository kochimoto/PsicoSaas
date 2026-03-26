"use client";

import { useState } from "react";
import { Plus, X, ArrowUpRight, ArrowDownRight, FileText, Edit2, MessageCircle, RefreshCw, CheckCircle, Link as LinkIcon, Paperclip, Download } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { createTransactionAction, updateTransactionAction, createChargeAction, approveTransactionAction } from "@/app/actions/finance";
import { sendManualPaymentReminderAction } from "@/app/actions/whatsapp";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Maps for client side
type Patient = { id: string; name: string };
type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: Date | string | number;
  status: string;
  paymentLink?: string | null;
  receiptUrl?: string | null;
  patient: { name: string } | null;
  service?: { name: string } | null;
};
type Service = { id: string; name: string; price: number };

export default function FinanceClient({ initialTransactions, patients, services, whatsappEnabled, currentPage = 1, totalPages = 1 }: { initialTransactions: Transaction[], patients: Patient[], services: Service[], whatsappEnabled: boolean, currentPage?: number, totalPages?: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  const [reportStart, setReportStart] = useState("");
  const [reportEnd, setReportEnd] = useState("");
  const [reportPatientId, setReportPatientId] = useState("");
  const [reportServiceId, setReportServiceId] = useState("");

  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [pixKey, setPixKey] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [patientId, setPatientId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [editTxId, setEditTxId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount || !date) {
      setError("Preencha descrição, valor e data.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount)) {
      setError("Valor numérico inválido.");
      setLoading(false);
      return;
    }
    
    const dateTime = new Date(`${date}T12:00:00`);
    
    let res;
    if (editTxId) {
      res = await updateTransactionAction(editTxId, { 
        description, 
        amount: parsedAmount, 
        date: dateTime, 
        patientId: patientId || undefined 
      });
    } else {
      res = await createTransactionAction({ 
        description, 
        amount: parsedAmount, 
        type, 
        date: dateTime, 
        patientId: patientId || undefined,
        serviceId: serviceId || undefined
      });
    }
    
    if (res?.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      setDescription("");
      setAmount("");
      setPatientId("");
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSendWhatsapp(transactionId: string) {
    setWorkingId(transactionId);
    const res = await sendManualPaymentReminderAction(transactionId);
    if (res.success) {
      toast.success("Lembrete de pagamento enviado!");
    } else {
      toast.error(res.error || "Erro ao enviar lembrete.");
    }
    setWorkingId("");
  }

  async function handleChargeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description || !amount || !patientId) {
      setError("Preencha descrição, valor e paciente.");
      return;
    }
    setLoading(true);
    const parsedAmount = parseFloat(amount.replace(',', '.'));
    const res = await createChargeAction({
      description,
      amount: parsedAmount,
      date: new Date(`${date}T12:00:00`),
      patientId,
      paymentLink: paymentLink || undefined,
      paymentMethod,
      pixKey: paymentMethod === 'PIX' ? pixKey : undefined
    });

    if (res?.error) {
      setError(res.error);
    } else {
      setIsChargeModalOpen(false);
      toast.success("Cobrança criada com sucesso!");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6 mt-8 text-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Histórico de Lançamentos</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg border border-slate-800"
          >
            <Download className="w-5 h-5" /> Exportar Relatório
          </button>
          <button 
            onClick={() => {
              setPatientId(""); setDescription("Cobrança de Sessão"); setAmount(""); setPaymentLink(""); setError(""); setIsChargeModalOpen(true);
            }}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg border border-slate-700"
          >
            <LinkIcon className="w-5 h-5 text-brand-accent" /> Nova Cobrança
          </button>
          <button 
            onClick={() => {
              setEditTxId(""); setType("INCOME"); setDescription(""); setAmount(""); setDate(format(new Date(), 'yyyy-MM-dd')); setPatientId(""); setServiceId(""); setError(""); setIsModalOpen(true);
            }}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(13,148,136,0.25)] active:scale-95"
          >
            <Plus className="w-5 h-5" /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        {initialTransactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-950 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <FileText className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum lançamento financeiro</h3>
            <p className="text-slate-400 max-w-sm mx-auto font-medium mb-8">Você ainda não registrou entradas ou saídas financeiras na sua clínica.</p>
            <button 
              onClick={() => {
                setEditTxId(""); setType("INCOME"); setDescription(""); setAmount(""); setDate(format(new Date(), 'yyyy-MM-dd')); setPatientId(""); setServiceId(""); setError(""); setIsModalOpen(true);
              }}
              className="text-brand-accent font-bold hover:text-brand transition-colors"
            >
              Registrar o primeiro
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50 p-2 sm:p-6">
            {initialTransactions.map(t => (
              <div key={t.id} className="flex items-center gap-4 sm:gap-6 py-5 hover:bg-slate-800/30 transition-all rounded-2xl px-2 sm:px-4">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {t.type === 'INCOME' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-100 truncate">{t.description}</h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1.5 text-xs font-bold uppercase tracking-wider">
                    <span className="text-slate-500">{format(new Date(t.date), "dd 'de' MMM, yyyy", { locale: ptBR })}</span>
                    {t.patient && (
                      <span className="text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-md">Paciente: {t.patient.name}</span>
                    )}
                    {t.service && (
                      <span className="text-brand-accent bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-md">Serviço: {t.service.name}</span>
                    )}
                    {t.status === 'PENDING' ? (
                      <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">Pendente</span>
                    ) : (
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">Pago</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-xl sm:text-2xl font-black tracking-tight ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {t.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
                  </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.paymentLink && (
                       <a href={t.paymentLink} target="_blank" className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-xl transition-colors" title="Ver Link de Pagamento">
                         <LinkIcon className="w-5 h-5" />
                       </a>
                    )}
                    {t.receiptUrl && (
                       <a href={t.receiptUrl} target="_blank" className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-xl transition-colors" title="Ver Comprovante Anexado">
                         <Paperclip className="w-5 h-5" />
                       </a>
                    )}
                    {t.status === 'PENDING' && t.receiptUrl && (
                       <button
                         onClick={async () => {
                           if (confirm("Confirmar que este pagamento foi recebido?")) {
                             await approveTransactionAction(t.id);
                             toast.success("Pagamento aprovado!");
                             router.refresh();
                           }
                         }}
                         className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors"
                         title="Aprovar Pagamento"
                       >
                         <CheckCircle className="w-5 h-5" />
                       </button>
                    )}
                    {whatsappEnabled && t.type === 'INCOME' && t.status === 'PENDING' && t.patient && (
                       <button
                         onClick={() => handleSendWhatsapp(t.id)}
                         disabled={workingId === t.id}
                         title="Enviar cobrança via WhatsApp"
                         className="p-2 bg-slate-950 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors border border-slate-800 disabled:opacity-50"
                       >
                         {workingId === t.id ? <RefreshCw className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                       </button>
                    )}
                    <button 
                    onClick={() => {
                      setEditTxId(t.id);
                      setType(t.type as any);
                      setDescription(t.description);
                      setAmount(Math.abs(t.amount).toString());
                      setDate(format(new Date(t.date), "yyyy-MM-dd"));
                      setPatientId(t.patient?.name ? patients.find(p => p.name === t.patient!.name)?.id || "" : "");
                      setError("");
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pt-6 mt-4 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                  Página <span className="font-bold text-white">{currentPage}</span> de <span className="font-bold text-white">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link 
                      href={`/dashboard/financeiro?page=${currentPage - 1}`}
                      className="px-5 py-2.5 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <button disabled className="px-5 py-2.5 border border-slate-800/50 bg-slate-950 text-slate-700 rounded-xl text-sm font-bold cursor-not-allowed">
                      Anterior
                    </button>
                  )}
                  
                  {currentPage < totalPages ? (
                    <Link 
                      href={`/dashboard/financeiro?page=${currentPage + 1}`}
                      className="px-5 py-2.5 border border-slate-800 rounded-xl text-sm font-bold text-slate-300 bg-slate-900 hover:bg-slate-800 transition-colors shadow-lg"
                    >
                      Próxima
                    </Link>
                  ) : (
                    <button disabled className="px-5 py-2.5 border border-slate-800/50 bg-slate-950 text-slate-700 rounded-xl text-sm font-bold cursor-not-allowed">
                      Próxima
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-2xl font-black text-white tracking-tight">Novo Lançamento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-950 p-2.5 rounded-full border border-slate-800 transition-all hover:scale-110">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              {/* Type Switcher */}
              <div className={`flex bg-slate-950 p-1.5 rounded-2xl mb-8 border border-slate-800 ${editTxId ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${type === 'INCOME' ? 'bg-slate-800 text-emerald-400 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Entrada
                </button>
                <button 
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${type === 'EXPENSE' ? 'bg-slate-800 text-rose-400 shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Saída
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                {error && <div className="p-4 bg-rose-500/10 text-rose-400 text-sm font-bold rounded-2xl border border-rose-500/20">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ex: Sessão, Aluguel, Provisão..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Valor (R$)</label>
                    <input 
                      type="number"
                      step="0.01" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white placeholder:text-slate-700 text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Data</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                {type === 'INCOME' && (
                  <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Serviço</label>
                        <select 
                          value={serviceId} 
                          onChange={e => {
                            const val = e.target.value;
                            setServiceId(val);
                            const svc = services.find(s => s.id === val);
                            if (svc) {
                              setAmount(svc.price.toString());
                              if (!description) setDescription(svc.name);
                            }
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                        >
                          <option value="">Opcional...</option>
                          {services.map(s => (
                             <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Paciente</label>
                        <select 
                          value={patientId} 
                          onChange={e => setPatientId(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                        >
                          <option value="">Opcional...</option>
                          {patients.map(p => (
                             <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={loading}
                  className={`w-full text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all disabled:opacity-50 mt-4 active:scale-95 shadow-2xl ${type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'}`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Salvando...
                    </div>
                  ) : (editTxId ? "Confirmar Edição" : "Confirmar Lançamento")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Charge Modal */}
      {isChargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-sky-500/10 backdrop-blur-sm">
              <h2 className="text-2xl font-black text-white tracking-tight">Nova Cobrança</h2>
              <button onClick={() => setIsChargeModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-950 p-2.5 rounded-full border border-slate-800 transition-all hover:scale-110">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <form onSubmit={handleChargeSubmit} className="space-y-6">
                {error && <div className="p-4 bg-rose-500/10 text-rose-400 text-sm font-bold rounded-2xl border border-rose-500/20">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Paciente</label>
                  <select 
                    value={patientId} 
                    onChange={e => setPatientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                  >
                    <option value="">Selecionar paciente...</option>
                    {patients.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Descrição</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-bold text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Valor (R$)</label>
                    <input 
                      type="number"
                      step="0.01" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-bold text-white text-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Vencimento</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Método de Pagamento</label>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                    >
                      <option value="PIX">Pix</option>
                      <option value="BOLETO">Boleto</option>
                      <option value="CARD">Cartão de Crédito</option>
                    </select>
                  </div>
                  {paymentMethod === 'PIX' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-2">
                      <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Chave Pix</label>
                      <input 
                        type="text" 
                        value={pixKey}
                        onChange={e => setPixKey(e.target.value)}
                        placeholder="CPF, E-mail..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-bold text-white"
                      />
                    </div>
                  )}
                  {paymentMethod === 'CARD' && (
                    <div className="animate-in fade-in zoom-in-95 duration-300 space-y-2">
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Link de Pagamento</label>
                      <input 
                        type="url" 
                        value={paymentLink}
                        onChange={e => setPaymentLink(e.target.value)}
                        placeholder="https://link.pagamento/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-bold text-white"
                      />
                    </div>
                  )}
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all disabled:opacity-50 mt-4 active:scale-95 shadow-2xl shadow-sky-600/20"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    </div>
                  ) : "Gerar Cobrança"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/50">
              <h2 className="text-2xl font-black text-white tracking-tight">Exportar Relatório</h2>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-950 p-2.5 rounded-full border border-slate-800 transition-all hover:scale-110">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Início</label>
                    <input 
                      type="date" 
                      value={reportStart}
                      onChange={e => setReportStart(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Fim</label>
                    <input 
                      type="date" 
                      value={reportEnd}
                      onChange={e => setReportEnd(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Filtrar Paciente</label>
                  <select 
                    value={reportPatientId} 
                    onChange={e => setReportPatientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                  >
                    <option value="">Todos os pacientes</option>
                    {patients.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Filtrar Serviço</label>
                  <select 
                    value={reportServiceId} 
                    onChange={e => setReportServiceId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-bold text-white [color-scheme:dark]"
                  >
                    <option value="">Todos os serviços</option>
                    {services.map(s => (
                       <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (reportStart) params.append("startDate", reportStart);
                    if (reportEnd) params.append("endDate", reportEnd);
                    if (reportPatientId) params.append("patientId", reportPatientId);
                    if (reportServiceId) params.append("serviceId", reportServiceId);
                    window.open(`/api/finance/export?${params.toString()}`, "_blank");
                    setIsReportModalOpen(false);
                  }}
                  className="w-full bg-slate-100 hover:bg-white text-slate-900 font-black uppercase tracking-widest py-5 rounded-2xl transition-all mt-4 shadow-2xl active:scale-95"
                >
                  Fazer Download .CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
