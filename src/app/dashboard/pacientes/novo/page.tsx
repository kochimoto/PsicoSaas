import { ChevronLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import NewPatientForm from "./NewPatientForm";

export default function NewPatientPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard/pacientes" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors">
        <ChevronLeft className="w-4 h-4" /> Cancelar e voltar
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white"><UserPlus className="w-5 h-5" /></div>
             Cadastrar Novo Paciente
          </h1>
        </div>

        <NewPatientForm />
      </div>
    </div>
  );
}
