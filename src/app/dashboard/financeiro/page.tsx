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
      by: ['type'],
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

  const totalIncome = sums.find(s => s.type === 'INCOME')?._sum?.amount || 0;
  const totalExpense = Math.abs(sums.find(s => s.type === 'EXPENSE')?._sum?.amount || 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ... previous code ... */}
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
