"use client";

import { useState, Suspense } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm as useReactHookForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "../actions/auth";
import { Loader2 } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

type RegisterData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get("plano") || "FREE";
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useReactHookForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterData) {
    setErrorMsg("");
    setIsPending(true);
    
    const result = await registerAction({ ...data, plan });
    
    setIsPending(false);
    
    if (result.error) {
      setErrorMsg(result.error);
    } else if (result.success) {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Crie a sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Plano selecionado: <span className="font-bold text-blue-600">{plan}</span>
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
              <label className="block text-sm font-medium text-slate-700">Nome completo</label>
              <div className="mt-1">
                <input
                  {...register("name")}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="Seu nome"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
            </div>

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
              <label className="block text-sm font-medium text-slate-700">WhatsApp</label>
              <div className="mt-1">
                <input
                  {...register("phone")}
                  className="appearance-none block w-full px-3 py-3 border border-slate-300 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
                  placeholder="(00) 00000-0000"
                />
                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
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

            <div>
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all font-bold"
              >
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isPending ? "Criando conta..." : "Criar minha conta"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-200 pt-6 text-center text-sm">
            <span className="text-slate-500">Já tem uma conta? </span>
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Fazer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
