"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/actions/auth";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

type ForgotData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotData>({
    resolver: zodResolver(forgotSchema),
  });

  async function onSubmit(data: ForgotData) {
    setErrorMsg("");
    setIsPending(true);
    
    const result = await forgotPasswordAction(data.email);
    
    if (result.error) {
      setErrorMsg(result.error);
      setIsPending(false);
    } else {
      setIsSuccess(true);
      setIsPending(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md shadow-2xl rounded-3xl overflow-hidden bg-white p-10 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MailCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifique seu e-mail</h2>
          <p className="text-slate-600 mb-8 text-sm">
            Se existir uma conta com este e-mail, enviamos as instruções para redefinir sua senha.
          </p>
          <Link href="/login" className="text-blue-600 font-semibold flex items-center justify-center gap-2 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
            G
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">Gestão Terapêutica</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Recuperar senha
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 mb-6">
          Insira seu e-mail para receber o link de recuperação
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md shadow-2xl rounded-3xl overflow-hidden bg-white">
        <div className="px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">E-mail</label>
              <div className="mt-1">
                <input
                  type="email"
                  {...register("email")}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="seu-email@exemplo.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-all font-bold"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPending ? "Enviando..." : "Enviar link de recuperação"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm">
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar para o Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
