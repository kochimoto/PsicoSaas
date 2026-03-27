"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Plus, Search, Filter, ArrowUpCircle, ArrowDownCircle, 
  Wallet, Calendar as CalendarIcon, Download, Trash2, 
  CheckCircle2, Clock, MoreHorizontal, FileText, Send, User as UserIcon
} from "lucide-react";
import { 
  createTransactionAction, 
  updateTransactionAction, 
  approveTransactionAction 
} from "@/app/actions/finance";
import { sendManualPaymentReminderAction } from "@/app/actions/whatsapp";
import { toast } from "sonner";

export default function FinanceClient({ initialTransactions, patients }: { initialTransactions: any[], patients: any[] }) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Totais
  const totals = transactions.reduce((acc, t) => {
    if (t.status === 'PAID') {
      if (t.type === 'INCOME') acc.income += t.amount;
      else acc.expense += t.amount;
    } else {
       if (t.type === 'INCOME') acc.pending += t.amount;
    }
    return acc;
  }, { income: 0, expense: 0, pending: 0 });

  async function handleStatusChange(id: string, status: string) {
    if (status === 'PAID') {
      const res = await approveTransactionAction(id);
      if (res.success) {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'PAID' } : t));
        toast.success("Pagamento aprovado!");
      } else {
        toast.error(res.error || "Erro ao aprovar");
      }
    } else {
      toast("Para alterar para outros status, utilize a edição do lançamento.");
    }
  }

  async function handleSendReminder(id: string) {
     const res = await sendManualPaymentReminderAction(id);
     if (res.success) toast.success("Lembrete enviado via WhatsApp!");
     else toast.error(res.error || "Erro ao enviar lembrete");
  }

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.patient?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || t.type === filter.toUpperCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Recebido (Mês)" value={totals.income} icon={<ArrowUpCircle className="text-emerald-500" />} color="emerald" />
        <SummaryCard title="Despesas (Mês)" value={Math.abs(totals.expense)} icon={<ArrowDownCircle className="text-rose-500" />} color="rose" />
        <SummaryCard title="Pendente" value={totals.pending} icon={<Clock className="text-amber-500" />} color="amber" />
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar transação ou paciente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="all">Todos</option>
            <option value="income">Entradas</option>
            <option value="expense">Saídas</option>
          </select>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Descrição / Paciente</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {format(new Date(t.date), "dd/MM/yyyy")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{t.description}</div>
                    {t.patient && (
                       <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                         <UserIcon className="w-3 h-3" /> {t.patient.name}
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <TransactionStatus id={t.id} status={t.status} onChange={handleStatusChange} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {t.type === 'INCOME' && t.status === 'PENDING' && (
                         <button 
                          onClick={() => handleSendReminder(t.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg group"
                          title="Enviar Lembrete WhatsApp"
                         >
                           <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                         </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">Nenhuma transação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {isModalOpen && (
        <TransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          patients={patients}
          onSuccess={(newTransaction: any) => {
             setTransactions(prev => [newTransaction, ...prev]);
             setIsModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-slate-50`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-xl font-bold text-slate-900">R$ {value.toFixed(2).replace('.', ',')}</p>
      </div>
    </div>
  );
}

function TransactionStatus({ id, status, onChange }: any) {
  return (
    <select 
      value={status} 
      onChange={(e) => onChange(id, e.target.value)}
      className={`text-[10px] font-bold uppercase py-1 px-2 rounded-lg border outline-none cursor-pointer ${
        status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
        status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
        'bg-slate-100 text-slate-500 border-slate-200'
      }`}
    >
      <option value="PENDING">Pendente</option>
      <option value="PAID">Recebido/Pago</option>
    </select>
  );
}

function TransactionModal({ isOpen, onClose, patients, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "INCOME",
    date: format(new Date(), "yyyy-MM-dd"),
    patientId: ""
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await createTransactionAction({
      description: formData.description,
      amount: parseFloat(formData.amount),
      type: formData.type as 'INCOME' | 'EXPENSE',
      date: new Date(formData.date),
      patientId: formData.patientId || undefined
    });
    
    if (res.success) {
      toast.success("Lançamento criado com sucesso!");
      window.location.reload(); // Simplificação para atualizar os totais corretamente
    } else {
      toast.error(res.error || "Erro ao criar lançamento");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Novo Lançamento</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 focus:outline-none">
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tipo</label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                   <option value="INCOME">Entrada (+)</option>
                   <option value="EXPENSE">Saída (-)</option>
                </select>
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Valor (R$)</label>
                <input 
                  type="number" step="0.01" required placeholder="0,00"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
             </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Descrição</label>
            <input 
              type="text" required placeholder="Ex: Aluguel, Sessão João, etc."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal-500"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Paciente (Opcional)</label>
            <select 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal-500"
              value={formData.patientId}
              onChange={e => setFormData({...formData, patientId: e.target.value})}
            >
               <option value="">Selecione...</option>
               {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
            <input 
              type="date" required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-1 focus:ring-teal-500"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="pt-4 flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
             <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-colors shadow-lg active:scale-[0.98]">
               {loading ? "Salvando..." : "Salvar"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}



