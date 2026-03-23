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
      paymentLink: paymentLink || undefined
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
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Histórico de Lançamentos</h2>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <Download className="w-5 h-5" /> Exportar Relatório
          </button>
          <button 
            onClick={() => {
              setPatientId(""); setDescription("Cobrança de Sessão"); setAmount(""); setPaymentLink(""); setError(""); setIsChargeModalOpen(true);
            }}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <LinkIcon className="w-5 h-5" /> Nova Cobrança
          </button>
          <button 
            onClick={() => {
              setEditTxId(""); setType("INCOME"); setDescription(""); setAmount(""); setDate(format(new Date(), 'yyyy-MM-dd')); setPatientId(""); setServiceId(""); setError(""); setIsModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.39)]"
          >
            <Plus className="w-5 h-5" /> Novo Lançamento
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {initialTransactions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100">
              <FileText className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum lançamento financeiro</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium mb-8">Você ainda não registrou entradas ou saídas financeiras na sua clínica.</p>
            <button 
              onClick={() => {
                setEditTxId(""); setType("INCOME"); setDescription(""); setAmount(""); setDate(format(new Date(), 'yyyy-MM-dd')); setPatientId(""); setServiceId(""); setError(""); setIsModalOpen(true);
              }}
              className="text-emerald-600 font-bold hover:text-emerald-700"
            >
              Registrar o primeiro
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 p-2 sm:p-6">
            {initialTransactions.map(t => (
              <div key={t.id} className="flex items-center gap-4 sm:gap-6 py-5 hover:bg-slate-50/50 transition-all rounded-xl px-2 sm:px-4 -mx-4 sm:mx-0">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-inner' : 'bg-rose-50 text-rose-600 border-rose-100 shadow-inner'}`}>
                  {t.type === 'INCOME' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900">{t.description}</h4>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5 text-[15px] font-semibold text-slate-500">
                    <span>{format(new Date(t.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                    {t.patient && (
                      <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md inline-flex max-w-max">Paciente: {t.patient.name}</span>
                    )}
                    {t.service && (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md inline-flex max-w-max">Serviço: {t.service.name}</span>
                    )}
                    {t.status === 'PENDING' ? (
                      <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md inline-flex max-w-max">Pendente</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-md inline-flex max-w-max">Pago</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-xl sm:text-2xl font-black tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {t.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
                  </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {t.paymentLink && (
                       <a href={t.paymentLink} target="_blank" className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors" title="Ver Link de Pagamento">
                         <LinkIcon className="w-5 h-5" />
                       </a>
                    )}
                    {t.receiptUrl && (
                       <a href={t.receiptUrl} target="_blank" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Ver Comprovante Anexado">
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
                         className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
                         className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-100 disabled:opacity-50"
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
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-500 font-medium whitespace-nowrap">
                  Página <span className="font-bold text-slate-800">{currentPage}</span> de <span className="font-bold text-slate-800">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  {currentPage > 1 ? (
                    <Link 
                      href={`/dashboard/financeiro?page=${currentPage - 1}`}
                      className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Anterior
                    </Link>
                  ) : (
                    <button disabled className="px-5 py-2.5 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed">
                      Anterior
                    </button>
                  )}
                  
                  {currentPage < totalPages ? (
                    <Link 
                      href={`/dashboard/financeiro?page=${currentPage + 1}`}
                      className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      Próxima
                    </Link>
                  ) : (
                    <button disabled className="px-5 py-2.5 border border-slate-100 bg-slate-50 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Novo Lançamento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Type Switcher */}
              <div className={`flex bg-slate-100 p-1.5 rounded-xl mb-6 ${editTxId ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Entrada (Receita)
                </button>
                <button 
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Saída (Despesa)
                </button>
              </div>

              <form onSubmit={handleAdd} className="space-y-5">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">{error}</div>}
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ex: Sessão Carlos, Aluguel sala..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor (R$)</label>
                    <input 
                      type="number"
                      step="0.01" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="150.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Data</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                {type === 'INCOME' && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Vincular Serviço</label>
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
                        >
                          <option value="">Nenhum...</option>
                          {services.map(s => (
                             <option key={s.id} value={s.id}>{s.name} (R$ {s.price})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Vincular Paciente</label>
                        <select 
                          value={patientId} 
                          onChange={e => setPatientId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-slate-700"
                        >
                          <option value="">Nenhum...</option>
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
                  className={`w-full text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-4 active:scale-95 ${type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)]' : 'bg-rose-600 hover:bg-rose-700 shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)]'}`}
                >
                  {loading ? "Salvando..." : (editTxId ? "Confirmar Edição" : "Confirmar Lançamento")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Charge Modal */}
      {isChargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-sky-50/50">
              <h2 className="text-xl font-bold text-sky-900">Nova Cobrança</h2>
              <button onClick={() => setIsChargeModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleChargeSubmit} className="space-y-5">
                {error && <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">{error}</div>}
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Paciente</label>
                  <select 
                    value={patientId} 
                    onChange={e => setPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-medium text-slate-700"
                  >
                    <option value="">Selecionar paciente...</option>
                    {patients.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Descrição</label>
                  <input 
                    type="text" 
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor (R$)</label>
                    <input 
                      type="number"
                      step="0.01" 
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Vencimento</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 font-sans">Link de Pagamento (Opcional)</label>
                  <input 
                    type="url" 
                    value={paymentLink}
                    onChange={e => setPaymentLink(e.target.value)}
                    placeholder="https://link.pagamento/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all font-medium text-slate-700"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Ex: Link do Mercado Pago, Stripe, etc.</p>
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-4 active:scale-95 shadow-md"
                >
                  {loading ? "Gerando..." : "Gerar Cobrança"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Gerar Relatório (CSV)</h2>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Data Inicial</label>
                    <input 
                      type="date" 
                      value={reportStart}
                      onChange={e => setReportStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Data Final</label>
                    <input 
                      type="date" 
                      value={reportEnd}
                      onChange={e => setReportEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Filtrar por Paciente</label>
                  <select 
                    value={reportPatientId} 
                    onChange={e => setReportPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-medium text-slate-700"
                  >
                    <option value="">Todos os pacientes</option>
                    {patients.map(p => (
                       <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Filtrar por Serviço</label>
                  <select 
                    value={reportServiceId} 
                    onChange={e => setReportServiceId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-slate-500 focus:outline-none transition-all font-medium text-slate-700"
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
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all mt-4 shadow-md"
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
