import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import AdminClient from "./AdminClient";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPER_ADMIN") return redirect("/login");

  const tenants = await prisma.tenant.findMany({
    include: { owner: true, _count: { select: { patients: true } } },
    orderBy: { createdAt: 'desc' }
  });
  
  const usersCount = await prisma.user.count();

  const mrr = tenants.reduce((acc, t) => {
    if (t.plan === 'VIP_MENSAL') return acc + 97;
    if (t.plan === 'VIP_ANUAL') return acc + 997 / 12;
    return acc;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-lg">S</div>
            <span className="font-bold text-lg text-slate-900">Painel Super Admin</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-slate-500 hidden sm:block">Logado como: {session.user.name}</span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <AdminClient initialTenants={tenants} />
      </main>
    </div>
  );
}
