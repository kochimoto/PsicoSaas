"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Calendar, FileText, Wallet, Settings, LogOut, Menu, MessageCircle, Crown, Tag, Globe, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Providers from "@/components/Providers";
import LogoutButton from "@/components/LogoutButton";
import UpdatesPopup from "@/components/dashboard/UpdatesPopup";

const navigation = [
  { name: 'Início', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/dashboard/pacientes', icon: Users },
  { name: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
  { name: 'Serviços', href: '/dashboard/servicos', icon: Tag },
  { name: 'Financeiro', href: '/dashboard/financeiro', icon: Wallet },
  { name: 'Documentos', href: '/dashboard/documentos', icon: FileText },
  { name: 'WhatsApp', href: '/dashboard/whatsapp', icon: MessageCircle },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
  { name: 'Assinatura VIP', href: '/dashboard/assinatura', icon: Crown },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden selection:bg-brand/30">
        <UpdatesPopup />
        
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-md lg:hidden transition-all duration-300 animate-in fade-in"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-[70] w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-72 flex flex-col ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-slate-950' : '-translate-x-full'}`}>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
                P
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">PsicoGestão</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-slate-800/50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-1.5 scrollbar-hide">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-2xl font-bold text-[15px] transition-all group ${
                    isActive 
                      ? 'bg-brand text-white shadow-lg shadow-brand/20' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 border-t border-slate-800/50 flex flex-col gap-3">
            <button 
              onClick={() => {
                const url = "https://www.laisbritoofc.com.br/portal";
                navigator.clipboard.writeText(url);
                toast.success("Link do Portal copiado!");
              }}
              className="flex items-center justify-center w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all text-sm shadow-lg shadow-slate-900/50 border border-slate-700"
            >
              <Globe className="w-4 h-4 mr-2 text-brand-accent" /> Copiar Link Portal
            </button>
            <LogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* Mobile Header */}
          <header className="lg:hidden h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50 flex items-center px-6 justify-between shrink-0 z-40">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white font-black text-xl shadow-lg shadow-brand/20">P</div>
              <span className="font-extrabold text-lg text-white tracking-tight">Painel</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-3 rounded-2xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-0 sm:p-2 lg:p-4">
            <div className="w-full min-h-full">
               <Providers>{children}</Providers>
            </div>
          </main>
        </div>
      </div>
  );
}

