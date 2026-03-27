import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceClient from "./FinanceClient";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function FinanceiroPage({ searchParams }: { searchParams: any }) {
  noStore();
  await headers();

  const session = await getSession();
  if (!session) return redirect("/login");

  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const ITEMS_PER_PAGE = 10;

  let transactions: any[] = [];
  let totalTransactions = 0;
  let summary = { income: 0, expense: 0, pending: 0 };
  let patients: any[] = [];
  let services: any[] = [];
  let tenant: any = null;

  if (process.env.IS_BUILD !== 'true') {
     try {
        const { prisma } = await import("@/lib/prisma");
        tenant = await prisma.tenant.findUnique({
          where: { ownerId: session.user.id }
        });

        if (tenant) {
          [transactions, totalTransactions, patients, services] = await Promise.all([
            prisma.transaction.findMany({
              where: { tenantId: tenant.id },
              orderBy: { date: 'desc' },
              skip: (currentPage - 1) * ITEMS_PER_PAGE,
              take: ITEMS_PER_PAGE,
              include: { 
                patient: { select: { name: true } },
                service: { select: { name: true } }
              }
            }),
            prisma.transaction.count({ where: { tenantId: tenant.id } }),
            prisma.patient.findMany({
              where: { tenantId: tenant.id },
              select: { id: true, name: true },
              orderBy: { name: 'asc' }
            }),
            prisma.service.findMany({
              where: { tenantId: tenant.id },
              select: { id: true, name: true, price: true },
              orderBy: { name: 'asc' }
            })
          ]);

          // Aggregates
          const allAmounts = await prisma.transaction.groupBy({
            by: ['type', 'status'],
            where: { tenantId: tenant.id },
            _sum: { amount: true }
          });

          allAmounts.forEach(group => {
            const amt = group._sum.amount || 0;
            if (group.type === 'INCOME') {
              if (group.status === 'PAID') summary.income += amt;
              else summary.pending += amt;
            } else {
              summary.expense += amt;
            }
          });
        }
     } catch (err) {
        console.error("Finance fetch error:", err);
     }
  }

  if (process.env.IS_BUILD !== 'true' && !tenant) return redirect("/login");

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financeiro</h1>
        <p className="text-slate-500 mt-1">Controle suas receitas, despesas e fluxos de caixa.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Recebido</p>
          <p className="text-3xl font-black text-emerald-600 tracking-tight">R$ {summary.income.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total Despesas</p>
          <p className="text-3xl font-black text-rose-600 tracking-tight">R$ {summary.expense.toFixed(2).replace('.', ',')}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">A Receber (Pendentes)</p>
          <p className="text-3xl font-black text-amber-500 tracking-tight">R$ {summary.pending.toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <FinanceClient 
        initialTransactions={transactions} 
        patients={patients} 
        services={services}
        whatsappEnabled={tenant?.whatsappEnabled || false}
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
