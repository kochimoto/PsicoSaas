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
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-xl text-slate-900">PsicoGestão</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold">P</div>
            <span className="font-bold text-lg text-slate-900">Painel</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 bg-slate-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}



