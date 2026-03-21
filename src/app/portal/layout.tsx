import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import LogoutButton from "@/components/LogoutButton";
import { logoutAction } from "@/app/actions/auth";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== "PACIENTE") {
    return redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-teal-200">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">P</div>
            <span className="font-extrabold text-xl text-slate-800 tracking-tight">Portal do Paciente</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                <User className="w-4 h-4 text-slate-500" />
              </div>
              <span className="text-sm font-bold text-slate-700">{session.user.name.split(" ")[0]}</span>
            </div>
            
            <LogoutButton variant="minimal" title="Sair da Conta" className="text-slate-400 hover:text-red-500 transition-colors p-2.5 rounded-full hover:bg-red-50" />
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
