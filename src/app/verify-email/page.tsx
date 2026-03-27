import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";

import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const h = await headers();
  if (process.env.IS_BUILD === 'true') {
     return <div className="p-10 text-center text-slate-400">Verificando...</div>;
  }

  const params = await searchParams;
  const token = params.token;

  if (!token) {
    return <ErrorState message="Token de verificação ausente." />;
  }

  const user = await prisma.user.findUnique({
    where: { verificationToken: token }
  });

  if (!user) {
    return <ErrorState message="Token inválido ou expirado." />;
  }

  // Marcar como verificado
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      emailVerified: new Date(),
      verificationToken: null // Remove para não reusar
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-inner">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">E-mail Verificado!</h1>
        <p className="text-slate-600 font-medium mb-8">Sua conta foi confirmada com sucesso. Agora você tem acesso total a todas as funcionalidades do PsicoGestão.</p>
        
        <Link href="/login" className="bg-slate-900 text-white w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
          Ir para o Login
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-200 text-center">
        <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-100">
          <XCircle className="w-10 h-10 text-rose-600" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ops!</h1>
        <p className="text-slate-600 font-medium mb-8">{message}</p>
        
        <Link href="/" className="text-indigo-600 font-bold hover:underline">
          Voltar para Início
        </Link>
      </div>
    </div>
  );
}
