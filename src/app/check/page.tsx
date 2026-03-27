"use client";
import NewPatientForm from "@/app/dashboard/pacientes/novo/NewPatientForm";

export default function CheckPage() {
  return (
    <div className="p-10 bg-slate-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Verificação de Campos de Paciente</h1>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <NewPatientForm />
      </div>
    </div>
  );
}
