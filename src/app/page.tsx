import Link from "next/link";
import { CheckCircle2, Shield, Zap, Sparkles, MessageCircle, BarChart3, Clock, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">P</div>
             <span className="text-xl font-black text-slate-900 tracking-tight">PsicoGestão</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Recursos</Link>
            <Link href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">Preços</Link>
            <Link href="/login" className="text-sm font-bold text-slate-900 hover:text-teal-600 transition-colors">Entrar</Link>
            <Link href="/register" className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95">Experimentar Grátis</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-xs font-bold uppercase tracking-widest animate-pulse">
                <Sparkles className="w-4 h-4" /> Evolua seu Consultório
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Gestão completa <br />
                <span className="text-teal-600">para psicólogos.</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
                Sessões, laudos, financeiro e automação de WhatsApp em um único lugar. Organize sua agenda e reduza faltas em até 40%.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                 <Link href="/register" className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-teal-600/20 text-center active:scale-95">Começar Agora</Link>
                 <Link href="#features" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 px-10 py-5 rounded-2xl font-bold text-lg transition-all border border-slate-200 text-center active:scale-95">Ver Recursos</Link>
              </div>
              <div className="flex items-center gap-4 pt-4 text-slate-400">
                 <span className="flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 className="w-4 h-4 text-teal-500" /> Sem Cartão</span>
                 <span className="flex items-center gap-1.5 text-xs font-bold"><CheckCircle2 className="w-4 h-4 text-teal-500" /> Teste Grátis</span>
              </div>
           </div>
           <div className="relative">
              <div className="absolute -inset-4 bg-teal-200/20 blur-3xl rounded-full"></div>
              <div className="relative bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-200 rotate-1">
                 <div className="bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 aspect-video flex items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Mockup" className="opacity-80" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
           <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Tudo o que seu consultório precisa.</h2>
              <p className="text-lg text-slate-500 font-medium">Desenvolvedo por especialistas para atender a rotina real de profissionais da saúde mental.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                title="Agenda Inteligente" 
                desc="Visualize seus horários, controle recorrências e agende novas sessões em um clique."
                icon={<Clock className="w-6 h-6" />}
              />
              <FeatureCard 
                title="Automação WhatsApp" 
                desc="Lembretes automáticos 24h e 3h antes da sessão para reduzir faltas significativamente."
                icon={<MessageCircle className="w-6 h-6" />}
              />
              <FeatureCard 
                title="Prontuário Digital" 
                desc="Keep record de todas as evoluções clínicas com segurança e sigilo total dos dados."
                icon={<Shield className="w-6 h-6" />}
              />
              <FeatureCard 
                title="Gestão Financeira" 
                desc="Controle de receitas, despesas e emissão de cobranças fácil e rápida."
                icon={<BarChart3 className="w-6 h-6" />}
              />
              <FeatureCard 
                title="Laudos e Recibos" 
                desc="Gere documentos profissionais a partir de templates e envie direto ao paciente."
                icon={<Zap className="w-6 h-6" />}
              />
              <FeatureCard 
                title="Portal do Paciente" 
                desc="Um espaço para o paciente consultar horários e documentos compartilhados."
                icon={<Users className="w-6 h-6" />}
              />
           </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] border border-slate-200 shadow-xl text-center space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 bg-teal-600 text-white px-8 py-2 rounded-bl-3xl font-bold text-sm">POPULAR</div>
           <h3 className="text-3xl font-black text-slate-900">Assinatura VIP</h3>
           <div className="flex items-center justify-center items-baseline gap-1">
              <span className="text-slate-400 font-bold text-xl">R$</span>
              <span className="text-6xl font-black text-slate-900">97</span>
              <span className="text-slate-500 font-bold">/mês</span>
           </div>
           <p className="text-slate-500">Acesso ilimitado a todas as ferramentas de automação e gestão.</p>
           <ul className="text-left space-y-4 max-w-md mx-auto py-8">
              <li className="flex items-center gap-3 text-slate-700 font-semibold"><CheckCircle2 className="w-5 h-5 text-teal-600" /> Pacientes Ilimitados</li>
              <li className="flex items-center gap-3 text-slate-700 font-semibold"><CheckCircle2 className="w-5 h-5 text-teal-600" /> Robô de WhatsApp Incluso</li>
              <li className="flex items-center gap-3 text-slate-700 font-semibold"><CheckCircle2 className="w-5 h-5 text-teal-600" /> Suporte Premium</li>
              <li className="flex items-center gap-3 text-slate-700 font-semibold"><CheckCircle2 className="w-5 h-5 text-teal-600" /> Prontuários Online</li>
           </ul>
           <Link href="/register" className="block w-full bg-teal-600 hover:bg-teal-700 text-white py-5 rounded-2xl font-bold text-xl transition-all shadow-xl shadow-teal-600/20 active:scale-95">Começar Agora</Link>
           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cancele quando quiser • Sem fidelidade</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-2 grayscale brightness-50">
             <div className="w-6 h-6 bg-slate-600 rounded flex items-center justify-center text-white font-bold">P</div>
             <span className="font-bold text-slate-900">PsicoGestão © 2026</span>
           </div>
           <div className="flex gap-8 text-sm font-bold text-slate-500">
             <Link href="#" className="hover:text-teal-600 underline decoration-slate-200">Termos de Uso</Link>
             <Link href="#" className="hover:text-teal-600 underline decoration-slate-200">Privacidade</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc, icon }: { title: string, desc: string, icon: React.ReactNode }) {
  return (
    <div className="group p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:border-teal-200 hover:shadow-xl transition-all duration-300">
       <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-teal-600 mb-6 shadow-sm border border-slate-200 group-hover:scale-110 group-hover:bg-teal-600 group-hover:text-white transition-all">
          {icon}
       </div>
       <h4 className="text-xl font-bold text-slate-900 mb-3">{title}</h4>
       <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}



