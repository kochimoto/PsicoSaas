"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Calendar, FileText, Wallet, Settings, Menu, MessageCircle, Crown, Tag, Globe, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
    <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans">
      <UpdatesPopup />
      
      {/* Mobile Menu Dropdown (Suspended) */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${sidebarOpen ? 'visible pointer-events-auto bg-slate-900/30 backdrop-blur-[2px]' : 'invisible pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div 
          className={`absolute top-20 right-4 left-4 p-4 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl shadow-2xl shadow-slate-900/10 transform transition-all duration-300 ease-out-back ${
            sidebarOpen ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95'
          }`}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
             <span className="font-bold text-slate-800 flex items-center gap-2">
                <Menu className="w-4 h-4 text-teal-600" /> Menu de Navegação
             </span>
             <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
               <X className="w-5 h-5" />
             </button>
          </div>

          <nav className="grid grid-cols-2 gap-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center p-3 text-xs font-bold rounded-2xl transition-all active:scale-95 ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
             <button 
                onClick={() => {
                  const url = "https://www.laisbritoofc.com.br/portal";
                  navigator.clipboard.writeText(url);
                  toast.success("Link do Portal copiado!");
                  setSidebarOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-xs font-bold text-slate-600 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors shadow-sm"
              >
                <Globe className="w-4 h-4 mr-3 text-teal-600" />
                Copiar Link Portal
              </button>
              <div className="bg-slate-50 rounded-2xl p-1 shadow-sm">
                <LogoutButton />
              </div>
          </div>
        </div>
      </div>

      {/* Sidebar (Tablet/Desktop) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 hidden lg:block`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-xl text-slate-900">PsicoSaas</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-4 mt-4 border-t border-slate-100">
             <button 
              onClick={() => {
                const url = "https://www.laisbritoofc.com.br/portal";
                navigator.clipboard.writeText(url);
                toast.success("Link do Portal copiado!");
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Globe className="w-5 h-5 mr-3 text-slate-400" />
              Copiar Link Portal
            </button>
            <div className="px-4 py-2">
               <LogoutButton />
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header (Sticky Glassmorphism) */}
        <header className="lg:hidden sticky top-0 left-0 right-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center px-6 justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold shadow-lg shadow-teal-600/20">P</div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">Painel</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2.5 transition-all active:scale-95 rounded-xl ${sidebarOpen ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' : 'text-slate-600 bg-slate-100'}`}
          >
            {sidebarOpen ? <X className="w-5 h-5 font-bold" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}



