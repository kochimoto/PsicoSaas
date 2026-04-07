"use client";

import { useState, useEffect, use } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { resetPasswordAction } from "@/app/actions/auth";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const resetSchema = z.object({
  password: z.string().min(6, "A senha precisa ter no mínimo 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirmação é obrigatória"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type ResetData = z.infer<typeof resetSchema>;

export default function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const params = use(searchParams);
  const token = params.token;

  const { register, handleSubmit, formState: { errors } } = useForm<ResetData>({
    resolver: zodResolver(resetSchema),
  });

  async function onSubmit(data: ResetData) {
    if (!token) {
      setErrorMsg("Link inválido ou expirado.");
      return;
    }

    setErrorMsg("");
    setIsPending(true);
    
    const result = await resetPasswordAction(token, data.password);
    
    if (result.error) {
      setErrorMsg(result.error);
      setIsPending(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-10 rounded-3xl shadow-xl">
          <div className="bg-rose-50 p-4 rounded-2xl mb-6">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Link Invitálido</h1>
          <p className="text-slate-600 mb-8">
            Este link de recuperação de senha é inválido ou expirou. Por favor, solicite um novo.
          </p>
          <Link href="/esqueceu-senha" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all inline-block">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 text-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-md bg-white p-10 rounded-3xl shadow-xl">
          <div className="bg-emerald-50 p-4 rounded-2xl mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Senha Redefinida!</h1>
          <p className="text-slate-600 mb-2 font-medium">
            Sua senha foi atualizada com sucesso.
          </p>
          <p className="text-slate-500 mb-8 text-sm">
            Você será redirecionado para o login em instantes...
          </p>
          <Link href="/login" className="text-blue-600 font-bold hover:underline">
            Ir para o Login agora
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center px-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-6">
          G
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Nova senha
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 mb-6">
          Crie uma nova senha segura para sua conta
        </p>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md shadow-2xl rounded-3xl overflow-hidden bg-white mx-4 sm:mx-auto">
        <div className="px-4 py-8 sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">Nova Senha</label>
              <div className="mt-1">
                <input
                  type="password"
                  {...register("password")}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Confirmar Nova Senha</label>
              <div className="mt-1">
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-all font-bold"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPending ? "Salvando..." : "Redefinir senha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
