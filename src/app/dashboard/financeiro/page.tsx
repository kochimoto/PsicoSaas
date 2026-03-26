import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceClient from "./FinanceClient";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default async function FinanceiroPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  const tenant = await prisma.tenant.findUnique({
    where: { ownerId: session.user.id }
  });

  if (!tenant) return redirect("/login");

  const { page: pageParam } = await searchParams;
  const currentPage = Number(pageParam) || 1;
  const ITEMS_PER_PAGE = 5;

  const patients = await prisma.patient.findMany({
    where: { tenantId: tenant.id },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  const [sums, transactionsPage, totalCount] = await Promise.all([
    prisma.transaction.groupBy({
      by: ['type', 'status'],
      where: { tenantId: tenant.id },
      _sum: { amount: true }
    }),
    prisma.transaction.findMany({
      where: { tenantId: tenant.id },
      include: { 
        patient: { select: { name: true } },
        service: { select: { name: true } }
      },
      orderBy: { date: 'desc' },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE
    }),
    prisma.transaction.count({
      where: { tenantId: tenant.id }
    })
  ]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const totalIncomePaid = sums.find(s => s.type === 'INCOME' && s.status === 'PAID')?._sum?.amount || 0;
  const totalIncomePending = sums.find(s => s.type === 'INCOME' && s.status === 'PENDING')?._sum?.amount || 0;
  const totalExpense = sums.filter(s => s.type === 'EXPENSE').reduce((acc, s) => acc + Math.abs(s._sum?.amount || 0), 0);
  const expectedIncome = totalIncomePaid + totalIncomePending;
  const balance = totalIncomePaid - totalExpense;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Financeiro</h1>
        <p className="text-slate-400 font-medium mt-1">Gerencie suas receitas, despesas e acompanhe seus recebimentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between group hover:bg-slate-800/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 border border-emerald-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Entrou (Recebido)</p>
            <h3 className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">
              R$ {totalIncomePaid.toFixed(2).replace('.', ',')}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between group hover:bg-slate-800/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Falta Entrar (Pendente)</p>
            <h3 className="text-3xl font-black text-white group-hover:text-amber-400 transition-colors">
              R$ {totalIncomePending.toFixed(2).replace('.', ',')}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between group hover:bg-slate-800/50 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Esperado do Mês (Total)</p>
            <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">
              R$ {expectedIncome.toFixed(2).replace('.', ',')}
            </h3>
          </div>
        </div>

        <div className="bg-brand border border-brand/20 rounded-3xl p-6 shadow-[0_0_40px_-10px_rgba(13,148,136,0.3)] flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-white/20 rounded-2xl text-white backdrop-blur-sm">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-teal-50 tracking-wide uppercase mb-1">Saldo Atual</p>
            <h3 className="text-3xl font-black text-white tracking-tight">
              R$ {balance.toFixed(2).replace('.', ',')}
            </h3>
          </div>
        </div>
      </div>

      <FinanceClient 
        initialTransactions={transactionsPage} 
        patients={patients} 
        services={services}
        whatsappEnabled={tenant.whatsappEnabled}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
