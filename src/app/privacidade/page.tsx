import Link from "next/link";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-20 px-6">
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <Link href="/" className="text-teal-600 font-bold mb-8 inline-block hover:underline">← Voltar para Home</Link>
        <h1 className="text-4xl font-black text-slate-900 mb-8">Política de Privacidade (LGPD)</h1>
        <div className="prose prose-slate max-w-none space-y-6 text-slate-600 font-medium leading-relaxed">
          <p>A sua privacidade é nossa prioridade máxima. Esta política descreve como tratamos dados em conformidade com a LGPD:</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">1. Coleta de Dados</h2>
          <p>Coletamos dados necessários para a prestação do serviço, como nome, registro profissional, e-mail e dados de contato. Dados de pacientes inseridos são tratados como dados sensíveis e protegidos por criptografia.</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">2. Segurança</h2>
          <p>Utilizamos infraestrutura de nuvem segura (Google/AWS) e criptografia de ponta a ponta para os prontuários, garantindo que apenas o profissional autorizado tenha acesso às informações clínicas.</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">3. Compartilhamento</h2>
          <p>Não vendemos nem compartilhamos seus dados ou dados de seus pacientes com terceiros para fins publicitários. O compartilhamento ocorre apenas quando necessário para funções do sistema (ex: processamento de pagamentos via Stripe).</p>
          
          <h2 className="text-2xl font-bold text-slate-800 mt-8">4. Seus Direitos</h2>
          <p>Você tem direito a acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento, conforme previsto na Lei Geral de Proteção de Dados.</p>
          
          <p className="mt-10 text-sm text-slate-400 italic">Última atualização: Março de 2026</p>
        </div>
      </div>
    </div>
  );
}
