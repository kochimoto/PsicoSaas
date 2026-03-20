import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceClient from "./FinanceClient";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default async function FinanceiroPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const patients = await prisma.patient.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const transactions = await prisma.transaction.findMany({
    where: { tenantId: tenant.id },
    include: { patient: { select: { name: true } } },
    orderBy: { date: 'desc' }
  });

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financeiro</h1>
          <p className="text-slate-500 mt-1">Acompanhe suas receitas e despesas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Entradas</p>
            <p className="text-2xl font-black text-slate-900">R$ {totalIncome.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Saídas</p>
            <p className="text-2xl font-black text-slate-900">R$ {totalExpense.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl flex items-center gap-4 text-white hover:-translate-y-1 transition-transform border border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/5">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Saldo em Caixa</p>
            <p className="text-2xl font-black">R$ {balance.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      </div>

      <FinanceClient initialTransactions={transactions} patients={patients} />
    </div>
  );
}
