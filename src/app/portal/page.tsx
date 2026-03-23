import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, FileText, Download, Wallet } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { ConfirmSessionButton, ConfirmDocumentButton, UploadReceiptButton } from "./ConfirmButtons";

export default async function PortalPage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const patient = await prisma.patient.findUnique({
    where: { userId: session.user.id },
    include: {
      tenant: true,
      appointments: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        take: 3
      },
      documents: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      transactions: {
        where: { status: 'PENDING', patientId: { not: null } },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!patient) {
    if (session.user.role === 'PSICOLOGO') return redirect("/dashboard");
    if (session.user.role === 'SUPER_ADMIN') return redirect("/admin");

    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto mt-20">
        <h2 className="text-2xl font-black text-rose-600 mb-3 tracking-tight">Erro no Acesso</h2>
        <p className="text-slate-600 font-medium">A sua conta não parece estar vinculada a nenhum prontuário ativo do seu profissional de saúde. Entre em contato com a clínica para que façam a ligação da sua conta.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="mb-4">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-2">Olá, {patient.name.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 text-lg font-medium">Bem-vindo(a) ao seu portal confidencial. Acompanhamento pela <strong className="text-slate-700">{patient.tenant.clinicName || 'clínica'}</strong>.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Agendas */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-tight">
              <Calendar className="w-7 h-7 text-sky-500" /> Suas Próximas Sessões
            </h2>
          </div>
          
          {patient.appointments.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
              <p className="text-slate-500 font-bold mb-1">Nenhuma sessão futura agendada.</p>
              <p className="text-sm text-slate-400 font-medium">Entre em contato via WhatsApp com o consultório para marcar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {patient.appointments.map(app => (
                <div key={app.id} className="flex items-center gap-5 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
                  <div className="bg-gradient-to-b from-sky-50 to-blue-50/30 text-sky-700 w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-sky-100/50 shadow-inner">
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
                    <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4">
                      <span className="font-black text-rose-600 text-xl tracking-tight">R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}</span>
                      {t.paymentLink ? (
                        <Link href={t.paymentLink} target="_blank" className="bg-gradient-to-r from-rose-500 to-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-rose-500/30 hover:opacity-90 transition active:scale-95">
                          Pagar
                        </Link>
                      ) : (
                        <span className="text-xs font-bold text-rose-400 bg-rose-50 px-2 py-1 rounded">Sem Link</span>
                      )}
                      <UploadReceiptButton id={t.id} hasReceipt={!!t.receiptUrl} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documentos */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 sm:p-10">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-8 tracking-tight">
              <FileText className="w-7 h-7 text-teal-600" /> Seus Recibos e Laudos
            </h2>
            
            {patient.documents.length === 0 ? (
              <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <p className="text-slate-500 font-bold mb-1">Nenhum documento.</p>
                <p className="text-sm text-slate-400 font-medium">Laudos e Recibos ficarão disponíveis de forma segura aqui.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patient.documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all duration-300 group shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[1rem] bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100/50 shadow-inner">
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
                    <Link href={doc.fileUrl} target="_blank" className="p-3 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors shrink-0" title="Baixar Arquivo">
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
