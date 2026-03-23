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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financeiro</h1>
        <p className="text-slate-500 font-medium mt-1">Gerencie suas receitas, despesas e acompanhe seus recebimentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Entrou (Recebido)</p>
            <h3 className="text-3xl font-black text-slate-900">
              R$ {totalIncomePaid.toFixed(2).replace('.', ',')}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <TrendingDown className="w-6 h-6" /> {/* Optional, choose another icon if needed */}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Falta Entrar (Pendente)</p>
            <h3 className="text-3xl font-black text-slate-900">
              R$ {totalIncomePending.toFixed(2).replace('.', ',')}
            </h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 tracking-wide uppercase mb-1">Esperado do Mês (Total)</p>
            <h3 className="text-3xl font-black text-slate-900">
              R$ {expectedIncome.toFixed(2).replace('.', ',')}
            </h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Wallet className="w-24 h-24 text-white" />
          </div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl text-white">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-slate-400 tracking-wide uppercase mb-1">Saldo Atual</p>
            <h3 className="text-3xl font-black text-white">
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
