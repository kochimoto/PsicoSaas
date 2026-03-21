"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useReactHookForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "../actions/auth";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useReactHookForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginData) {
    setErrorMsg("");
    setIsPending(true);
    
    const result = await loginAction(data);
    
    setIsPending(false);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.success) {
      if (result.role === 'SUPER_ADMIN') {
        router.push("/admin");
      } else if (result.role === 'PACIENTE') {
        router.push("/portal");
      } else {
        router.push("/dashboard");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
            P
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-800">PsicoGestão</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900">
          Bem-vindo de volta
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Acesse a sua conta PsicoGestão
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md shadow-2xl rounded-3xl overflow-hidden bg-white">
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
                  placeholder="voce@exemplo.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Senha</label>
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

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-70 transition-all font-bold"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPending ? "Entrando..." : "Entrar"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm">
            <span className="text-slate-500">Não tem uma conta? </span>
            <Link href="/cadastro" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Teste grátis agora
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
