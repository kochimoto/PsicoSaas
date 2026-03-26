import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans transition-colors duration-300">
      <nav className="bg-surface/80 backdrop-blur-md border-b border-border-dim sticky top-0 z-50 h-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-black text-xl shadow-lg">S</div>
            <span className="font-bold text-xl tracking-tight text-foreground">Painel Super Admin</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="text-sm font-medium text-text-muted hidden sm:block">Logado como: {session.user.name}</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton variant="minimal" title="Sair da Conta" className="text-text-muted hover:text-foreground transition-colors p-2.5 rounded-full hover:bg-surface-dim" />
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 space-y-10">
        <AdminClient tenants={tenants} usersCount={usersCount} mrr={mrr} />
      </main>
    </div>
  );
}

