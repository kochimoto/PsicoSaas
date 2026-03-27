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
  
  const [paymentProofData, setPaymentProofData] = useState("");
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      toast.success(editTxId ? "Lançamento atualizado" : "Lançamento criado");
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
      paymentLink: (paymentMethod === 'CARD' || paymentMethod === 'BOLETO') ? paymentLink : undefined,
      paymentMethod,
      pixKey: paymentMethod === 'PIX' ? pixKey : undefined,
      paymentProofData: paymentMethod === 'BOLETO' ? paymentProofData : undefined
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Histórico de Lançamentos</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Download className="w-5 h-5" /> Exportar
          </button>
          <button 
            onClick={() => {
              setPatientId(""); setDescription("Cobrança de Sessão"); setAmount(""); setPaymentLink(""); setError(""); setIsChargeModalOpen(true);
            }}
            className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-3 rounded-xl font-bold flex items-center gap-2 transition-all border border-teal-100 shadow-sm active:scale-95"
          >
            <LinkIcon className="w-5 h-5" /> Nova Cobrança
          </button>
          <button 
            onClick={() => {
              setEditTxId(""); setType("INCOME"); setDescription(""); setAmount(""); setDate(format(new Date(), 'yyyy-MM-dd')); setPatientId(""); setServiceId(""); setError(""); setIsModalOpen(true);
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95"
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
            <p className="text-slate-500 max-w-sm mx-auto font-medium mb-8">Você ainda não registrou entradas ou saídas financeiras.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 p-2 sm:p-6">
            {initialTransactions.map(t => (
              <div key={t.id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-5 hover:bg-slate-50 transition-all rounded-xl px-4 group">
                <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${t.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {t.type === 'INCOME' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900">{t.description}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-semibold text-slate-500">
                    <span>{format(new Date(t.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</span>
                    {t.patient && (
                      <span className="text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">Paciente: {t.patient.name}</span>
                    )}
                    {t.status === 'PENDING' ? (
                      <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">Pendente</span>
                    ) : (
                      <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">Pago</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className={`text-xl font-black tracking-tight ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {t.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {t.paymentLink && (
                       <a href={t.paymentLink} target="_blank" className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100" title="Link de Pagamento">
                         <LinkIcon className="w-5 h-5" />
                       </a>
                    )}
                    {t.receiptUrl && (
                       <a href={t.receiptUrl} target="_blank" className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-100" title="Comprovante">
                         <Paperclip className="w-5 h-5" />
                       </a>
                    )}
                    {t.status === 'PENDING' && t.receiptUrl && (
                       <button
                         onClick={async () => {
                           if (confirm("Aprovar este pagamento?")) {
                             await approveTransactionAction(t.id);
                             toast.success("Pagamento aprovado!");
                             router.refresh();
                           }
                         }}
                         className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                         title="Aprovar"
                       >
                         <CheckCircle className="w-5 h-5" />
                       </button>
                    )}
                    {whatsappEnabled && t.type === 'INCOME' && t.status === 'PENDING' && t.patient && (
                       <button
                         onClick={() => handleSendWhatsapp(t.id)}
                         disabled={workingId === t.id}
                         title="Enviar cobrança via WhatsApp"
                         className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100 disabled:opacity-50"
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
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">
                  Página <span className="font-bold text-slate-800">{currentPage}</span> de <span className="font-bold text-slate-800">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                   <Link 
                    href={`/dashboard/financeiro?page=${Math.max(1, currentPage - 1)}`}
                    className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage <= 1 ? 'pointer-events-none opacity-50 bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                   >
                    Anterior
                   </Link>
                   <Link 
                    href={`/dashboard/financeiro?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={`px-4 py-2 border rounded-xl text-sm font-bold transition-all shadow-sm ${currentPage >= totalPages ? 'pointer-events-none opacity-50 bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                   >
                    Próxima
                   </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">{editTxId ? "Editar Lançamento" : "Novo Lançamento"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 p-2 rounded-full border border-slate-200 transition-colors shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className={`flex bg-slate-100 p-1.5 rounded-xl mb-6 ${editTxId ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Entrada
                </button>
                <button 
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Saída
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
                    placeholder="Descrição do lançamento..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor (R$)</label>
                    <input 
                      type="text"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Data</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
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
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                        >
                          <option value="">Nenhum...</option>
                          {services.map(s => (
                             <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Vincular Paciente</label>
                        <select 
                          value={patientId} 
                          onChange={e => setPatientId(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
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
                  className={`w-full text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 mt-4 active:scale-95 shadow-lg ${type === 'INCOME' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                >
                  {loading ? "Salvando..." : (editTxId ? "Confirmar Edição" : "Confirmar Lançamento")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isChargeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-teal-50/50">
              <h2 className="text-xl font-bold text-teal-900">Nova Cobrança</h2>
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Valor (R$)</label>
                    <input 
                      type="text"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Vencimento</label>
                    <input 
                      type="date" 
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Método</label>
                    <select 
                      value={paymentMethod} 
                      onChange={e => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                    >
                      <option value="PIX">Pix</option>
                      <option value="BOLETO">Boleto</option>
                      <option value="CARD">Cartão</option>
                    </select>
                  </div>
                  {paymentMethod === 'PIX' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Chave Pix</label>
                      <input 
                        type="text" 
                        value={pixKey}
                        onChange={e => setPixKey(e.target.value)}
                        placeholder="Chave para o paciente..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                      />
                    </div>
                  )}
                  {paymentMethod === 'CARD' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Link de Pagamento</label>
                      <input 
                        type="text" 
                        value={paymentLink}
                        onChange={e => setPaymentLink(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                      />
                    </div>
                  )}
                  {paymentMethod === 'BOLETO' && (
                    <div className="animate-in fade-in zoom-in-95 duration-200 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Anexar Boleto (PDF/Imagem)</label>
                        <input 
                          type="file" 
                          onChange={handleFileChange}
                          accept="application/pdf,image/*"
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Link do Boleto (Opcional)</label>
                        <input 
                          type="text" 
                          value={paymentLink}
                          onChange={e => setPaymentLink(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
                >
                  {loading ? "Gerando..." : "Gerar Cobrança"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-900">Exportar Relatório</h2>
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Data Final</label>
                    <input 
                      type="date" 
                      value={reportEnd}
                      onChange={e => setReportEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (reportStart) params.append("startDate", reportStart);
                    if (reportEnd) params.append("endDate", reportEnd);
                    window.open(`/api/finance/export?${params.toString()}`, "_blank");
                    setIsReportModalOpen(false);
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 mt-4"
                >
                  Baixar CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
