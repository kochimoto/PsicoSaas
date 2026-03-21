import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { logoutAction } from "@/app/actions/auth";
import AdminClient from "./AdminClient";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") return redirect("/login");

  const tenants = await prisma.tenant.findMany({
    include: { owner: true, _count: { select: { patients: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  const usersCount = await prisma.user.count();

  // Basic MRR calculation based on active plans
  const mrr = tenants.reduce((acc, t) => {
    if (t.plan === 'VIP_MENSAL') return acc + 97;
    if (t.plan === 'VIP_ANUAL') return acc + 997 / 12; // Anual distributed
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 h-20 text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">S</div>
            <span className="font-bold text-xl tracking-tight">Painel Super Admin</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-300 hidden sm:block">Logado como: {session.user.name}</span>
            <LogoutButton variant="minimal" title="Sair da Conta" className="text-slate-400 hover:text-white transition-colors p-2.5 rounded-full hover:bg-white/10" />
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 space-y-10">
        <AdminClient tenants={tenants} usersCount={usersCount} mrr={mrr} />
      </main>
    </div>
  );
}
