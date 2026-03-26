import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Calendar, User, Phone, MapPin, ClipboardList, Plus, Wallet, FileText, ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { addClinicalRecord } from "@/app/actions/records";
import { revalidatePath } from "next/cache";

export default async function PatientDetailsPage({ params }: { params: any }) {
  const session = await getSession();
  if (!session) return redirect("/login");

  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { date: 'desc' }, take: 5, include: { service: true } },
      clinicalRecords: { orderBy: { createdAt: 'desc' } },
      documents: { orderBy: { createdAt: 'desc' } },
      transactions: { orderBy: { date: 'desc' }, take: 5 }
    }
  });

  if (!patient) return notFound();

  async function handleAddRecord(formData: FormData) {
    "use server";
    const content = formData.get("content") as string;
    if (!content) return;
    await addClinicalRecord(id, content);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Link href="/dashboard/pacientes" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-bold transition-colors">
        <ChevronLeft className="w-4 h-4" /> Voltar para lista
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Perfil e Resumo */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-teal-100 text-teal-600 font-bold text-3xl uppercase">
              {patient.name.charAt(0)}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <p className="text-slate-500 text-sm mb-6 capitalize">{patient.active ? 'Paciente Ativo' : 'Inativo'}</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href={`/dashboard/pacientes/${id}/editar`} className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all">Editar Cadastro</Link>
              <button className="bg-rose-50 hover:bg-rose-100 text-rose-600 py-2.5 rounded-xl font-bold text-xs transition-all border border-rose-100">Desativar</button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 mb-2">Informações de Contato</h3>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Phone className="w-4 h-4 text-slate-400" /> {patient.phone || 'Nenhum'}
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <User className="w-4 h-4 text-slate-400" /> {patient.cpf || 'CPF não informado'}
            </div>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" /> {patient.address || 'Endereço não informado'}
            </div>
          </div>
        </div>

        {/* Evolução e Histórico */}
        <div className="lg:col-span-2 space-y-8">
          {/* Nova Evolução */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-teal-600" /> Evolução do Paciente
            </h3>
            <form action={handleAddRecord} className="space-y-4">
              <textarea 
                name="content"
                placeholder="Descreva o progresso da sessão, comportamentos e insights..."
                className="w-full min-h-[150px] p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none"
              ></textarea>
              <button 
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95"
              >
                Salvar Evolução
              </button>
            </form>
          </div>

          {/* Histórico de Evoluções */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 px-2 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-teal-500"></span> Prontuário Cronológico
            </h3>
            {patient.clinicalRecords.length === 0 ? (
               <div className="p-8 text-center text-slate-400 italic bg-white rounded-3xl border border-dashed border-slate-200">Nenhum registro ainda.</div>
            ) : (
               patient.clinicalRecords.map(record => (
                <div key={record.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(record.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                    <span className="text-xs font-medium text-slate-400">{format(record.date, "HH:mm", { locale: ptBR })}</span>
                  </div>
                  <div className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{record.content}</div>
                </div>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
