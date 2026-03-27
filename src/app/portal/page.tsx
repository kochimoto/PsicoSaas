import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, MapPin, ChevronRight, CheckCircle2, AlertCircle, FileText, Phone, Wallet, Download } from "lucide-react";
import { headers } from "next/headers";
import { unstable_noStore as noStore } from 'next/cache';
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ConfirmSessionButton, ConfirmDocumentButton, UploadReceiptButton } from "./ConfirmButtons";

export const dynamic = 'force-dynamic';

export default async function PortalPage() {
  noStore();
  await headers(); // Force dynamic

  if (process.env.IS_BUILD === 'true') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <p className="text-slate-400">Carregando portal...</p>
      </div>
    );
  }

  const session = await getSession();
  if (!session) return redirect("/login");

  let patient = null;

  try {
    const { prisma: db } = await import("@/lib/prisma");
    patient = await db.patient.findFirst({
      where: { userId: session.user.id },
      include: {
        tenant: true,
        appointments: {
          where: { date: { gte: new Date() } },
          orderBy: { date: 'asc' },
          take: 5
        },
        transactions: {
          where: { status: 'PENDING' },
          orderBy: { date: 'desc' }
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });
  } catch (error) {
    console.error("Portal fetch error:", error);
  }

  if (!patient) {
    if (session.user.role === 'PSICOLOGO') return redirect("/dashboard");
    if (session.user.role === 'SUPER_ADMIN') return redirect("/admin");

    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-20">
        <h2 className="text-2xl font-black text-rose-600 mb-3 tracking-tight">Erro no Acesso</h2>
        <p className="text-slate-600 font-medium">A sua conta não parece estar vinculada a nenhum prontuário ativo do seu profissional de saúde.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-10">
      <div className="mb-4">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">Olá, {patient.name.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 text-lg font-medium">Bem-vindo(a) ao seu portal. Acompanhamento pela <strong className="text-slate-700">{patient.tenant.clinicName || 'clínica'}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agendas */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
              <Calendar className="w-7 h-7 text-teal-600" /> Próximas Sessões
            </h2>
          </div>
          
          {patient.appointments.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
              <p className="text-slate-500 font-bold mb-1">Nenhuma sessão futura agendada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patient.appointments.map(app => (
                <div key={app.id} className="flex items-center gap-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                  <div className="bg-teal-50 text-teal-700 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-teal-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{format(new Date(app.date), 'MMM', { locale: ptBR })}</span>
                    <span className="text-2xl font-black leading-none mt-0.5">{format(new Date(app.date), 'dd')}</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-lg capitalize">{format(new Date(app.date), "EEEE", { locale: ptBR })}</p>
                    <div className="text-sm font-semibold text-slate-500 flex items-center gap-3 mt-1">
                       <span>{format(new Date(app.date), 'HH:mm')}</span>
                       <ConfirmSessionButton id={app.id} confirmed={app.patientConfirmed} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Financeiro / Pendencias e Documentos */}
        <div className="space-y-8">
          {patient.transactions.length > 0 && (
            <div className="bg-rose-50 rounded-[2.5rem] border border-rose-100 p-6 sm:p-10">
              <h2 className="text-2xl font-bold text-rose-900 flex items-center gap-3 mb-8 tracking-tight">
                <Wallet className="w-7 h-7 text-rose-500" /> Pagamentos Pendentes
              </h2>
              <div className="space-y-4">
                {patient.transactions.map(t => (
                  <div key={t.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm">
                    <div>
                      <p className="font-bold text-slate-800 text-lg">{t.description}</p>
                      <p className="text-[13px] text-slate-500 font-semibold mt-1">Vencimento: {format(new Date(t.date), "dd/MM/yyyy")}</p>
                    </div>
                    <div className="flex flex-col gap-4">
                       <span className="font-black text-rose-600 text-xl tracking-tight">R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}</span>
                       <UploadReceiptButton id={t.id} hasReceipt={!!t.paymentProofData} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documentos */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-8 tracking-tight">
              <FileText className="w-7 h-7 text-teal-600" /> Documentos e Laudos
            </h2>
            
            {patient.documents.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <p className="text-slate-500 font-bold mb-1">Nenhum documento disponível.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patient.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 hover:border-teal-200 transition-all shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1rem] bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="font-bold text-slate-800">{doc.name}</p>
                           <ConfirmDocumentButton id={doc.id} read={doc.patientRead} />
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{doc.type}</p>
                      </div>
                    </div>
                    <Link href={doc.fileUrl} target="_blank" className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors" title="Baixar Arquivo">
                      <Download className="w-5 h-5" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
