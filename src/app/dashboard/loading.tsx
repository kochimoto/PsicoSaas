import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
      <div className="w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-6 animate-pulse border border-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 tracking-tight">Carregando painel...</h2>
      <p className="text-sm font-medium">Preparando suas informações</p>
    </div>
  );
}
