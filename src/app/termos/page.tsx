import Link from "next/link";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <Link href="/" className="text-teal-600 font-bold mb-8 inline-block hover:underline">← Voltar para Home</Link>
        <h1 className="text-4xl font-black text-slate-900 mb-8">Termos de Uso</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
          <p>Bem-vindo ao PsicoGestão. Ao utilizar nossos serviços, você concorda com os seguintes termos:</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">1. Uso do Serviço</h2>
          <p>O PsicoGestão é uma plataforma de gestão clínica destinada a profissionais de saúde mental. Você é responsável por manter a confidencialidade de sua conta e senha.</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. Responsabilidade pelos Dados</h2>
          <p>O profissional é o único responsável pelos dados inseridos nos prontuários eletrônicos, devendo seguir as normas éticas de sua categoria profissional (CFP/CRM).</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. Assinaturas e Cancelamento</h2>
          <p>Nosso plano VIP é recorrente. O cancelamento pode ser feito a qualquer momento pelo painel administrativo, interrompendo cobranças futuras.</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. Limitação de Responsabilidade</h2>
          <p>O PsicoGestão oferece ferramentas de auxílio à gestão, mas não substitui o julgamento profissional nem garante resultados financeiros ou clínicos.</p>
          
          <p className="mt-10 text-sm text-slate-400 italic">Última atualização: Março de 2026</p>
        </div>
      </div>
    </div>
  );
}
