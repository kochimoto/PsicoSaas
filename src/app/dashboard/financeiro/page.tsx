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

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: 'asc' }
  });

  const transactions = await prisma.transaction.findMany({
    where: { tenantId: tenant.id },
    include: { 
      patient: { select: { name: true } },
      service: { select: { name: true } }
    },
    orderBy: { date: 'desc' }
  });

  const totalIncome = transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + Math.abs(t.amount) || 0, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* ... previous code ... */}
      <FinanceClient 
        initialTransactions={transactions} 
        patients={patients} 
        services={services}
        whatsappEnabled={tenant.whatsappEnabled}
      />
    </div>
  );
}
