import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import FinanceClient from "./FinanceClient";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";

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
    orderBy: { date: 'desc' },
    take: 50
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financeiro</h1>
        <p className="text-slate-500">Gerencie suas receitas e despesas</p>
      </div>

      <FinanceClient initialTransactions={transactions} patients={patients} />
    </div>
  );
}
