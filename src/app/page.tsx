import Link from "next/link";
// Trigger deploy
import { ArrowRight, Calendar, Users, FileText, Wallet, CheckCircle2, Brain, Heart, ShieldCheck, MessageCircle, Activity, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-teal-200 overflow-x-hidden">
      {/* Navbar with glassmorphism */}
      <nav className="fixed w-full z-50 top-0 transition-all border-b border-teal-100/50 bg-white/70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform">
              P
            </div>
            <span className="font-bold text-2xl tracking-tight text-slate-800">PsicoGestão</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#recursos" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">
              Recursos
            </Link>
            <Link href="#precos" className="hidden md:block text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">
              Planos
            </Link>
            <Link href="/portal" className="hidden sm:block text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors border-l border-slate-200 pl-6 h-6 flex items-center">
              Portal do Paciente
            </Link>
            <Link href="/login" className="text-sm font-bold text-teal-700 hover:text-teal-800 transition-colors">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="text-sm font-bold bg-teal-600 text-white px-6 py-2.5 rounded-full hover:bg-teal-700 hover:shadow-lg hover:shadow-teal-600/20 transition-all active:scale-95"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Decorative blur blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-left text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 font-semibold tracking-tight text-sm mb-8 border border-teal-100 shadow-sm">
                <Heart className="w-4 h-4 text-teal-600" />
                <span>Feito por e para profissionais da saúde</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.15]">
                Concentre-se no <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">paciente.</span><br/>
                Deixe a gestão com a gente.
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                Um software intuitivo e seguro para profissionais de psicologia gerenciarem prontuários eletrônicos, consultas, relatórios e comunicação pelo WhatsApp. 
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/cadastro"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-[0_0_40px_-10px_rgba(20,184,166,0.5)] transition-all"
                >
                  Teste Grátis por 7 dias
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#recursos"
                  className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                >
                  Ver recursos
                </Link>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 text-sm font-medium text-slate-500">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-teal-${i}00 shadow-sm`} />
                  ))}
                </div>
                Confiam em nós mais de +2.000 psicólogos(as)
              </div>
            </div>

            {/* Hero Mockup Graphic */}
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none transform perspective-1000 rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700">
              <div className="relative rounded-2xl bg-white/40 p-3 backdrop-blur-xl border border-white/40 shadow-2xl overflow-hidden">
                <div className="w-full aspect-[4/3] rounded-xl bg-slate-900 overflow-hidden relative border border-slate-200/50 shadow-inner flex flex-col">
                   
                   {/* Fake Browser Header */}
                   <div className="h-10 w-full bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-3 shrink-0">
                     <div className="flex gap-1.5">
                       <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                       <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                     </div>
                     <div className="flex-1 max-w-sm mx-auto h-5 bg-slate-700 rounded-md flex items-center justify-center border border-slate-600">
                       <span className="text-[10px] text-slate-400 font-medium">psicogestao.com.br/dashboard</span>
                     </div>
                   </div>

                   {/* Webp Recording */}
                   <div className="flex-1 w-full bg-white relative">
                     <img 
                       src="/psicogestao_dashboard_mockup.png" 
                       alt="Demonstração do Sistema PsicoGestão" 
                       className="absolute inset-0 w-full h-full object-cover object-left-top shadow-inner"
                     />
                   </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Logocloud */}
      <section className="py-10 border-y border-teal-100/50 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-transparent">Segurança e conformidade em primeiro lugar</p>
          <div className="flex justify-center flex-wrap gap-10 md:gap-24 opacity-60">
            <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><ShieldCheck className="w-8 h-8 text-teal-600"/> Criptografia</div>
            <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><Heart className="w-8 h-8 text-rose-500"/> Ética Médica</div>
            <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><Users className="w-8 h-8 text-blue-600"/> Adequado LGPD</div>
            <div className="flex items-center gap-2 font-black text-2xl text-slate-800"><FileText className="w-8 h-8 text-amber-500"/> Resoluções CFP</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="recursos" className="py-32 bg-[#F8FAFC] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-teal-600 font-bold tracking-wide uppercase text-sm mb-3">Recursos Poderosos</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">A clínica inteira na <br/>ponta dos seus dedos</h3>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">Chega de dividir o seu tempo entre agendas de papel, planilhas financeiras e prontuários espalhados. Unificamos tudo em um ambiente bonito, fluido e seguro.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="w-7 h-7 text-teal-600" />}
              color="bg-teal-50"
              title="Prontuário Eletrônico"
              description="Anotações estruturadas, evolução clínica de pacientes e histórico completo armazenado com criptografia de ponta a ponta."
            />
            <FeatureCard 
              icon={<Calendar className="w-7 h-7 text-sky-600" />}
              color="bg-sky-50"
              title="Agendamento Inteligente"
              description="Sua agenda conectada com o WhatsApp. Lembretes automáticos reduzem em até 40% as abstenções dos pacientes."
            />
            <FeatureCard 
              icon={<Wallet className="w-7 h-7 text-emerald-600" />}
              color="bg-emerald-50"
              title="Controle Financeiro"
              description="Acompanhe pagamentos pendentes, gere recibos num clique e tenha total previsibilidade do seu faturamento."
            />
            <FeatureCard 
              icon={<MessageCircle className="w-7 h-7 text-blue-600" />}
              color="bg-blue-50"
              title="Integração WhatsApp"
              description="Confirmações de consultas, mensagens de parabéns e lembretes de sessão enviados de forma 100% automatizada."
            />
            <FeatureCard 
              icon={<FileText className="w-7 h-7 text-indigo-600" />}
              color="bg-indigo-50"
              title="Laudos e Declarações"
              description="Gere documentos, atestados e declarações baseados em modelos pré-aprovados e em total conformidade com o CFP."
            />
            <FeatureCard 
              icon={<Activity className="w-7 h-7 text-rose-600" />}
              color="bg-rose-50"
              title="Métricas do Consultório"
              description="Relatórios visuais e claros sobre captação de novos pacientes, taxas de retenção e a saúde geral da sua clínica."
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-28 bg-white border-y border-teal-100/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-teal-600 font-bold tracking-wide uppercase text-sm mb-3">Comunidade</h2>
          <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-16">O que dizem as colegas de profissão</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="A organização financeira e a emissão de recibos mudaram a minha rotina. Agora termino as sessões e com dois cliques o prontuário e o recibo estão prontos!"
              author="Dra. Mariana Costa"
              role="Psicóloga Clínica (CRP-SP)"
            />
            <TestimonialCard 
              quote="Eu perdia muito tempo confirmando agendas e cobrando faltas. A integração com o WhatsApp acabou com as surpresas e os atrasos da clínica."
              author="Dr. Roberto Silva"
              role="Psiquiatra"
            />
            <TestimonialCard 
              quote="O design do sistema é incrivelmente limpo e relaxante de usar. Tudo fica na mesma tela. Não preciso abrir milhares de planilhas como no meu sistema antigo."
              author="Dra. Beatriz Almeida"
              role="Psicóloga Infantil"
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precos" className="py-32 bg-[#F8FAFC] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/50 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sky-100/40 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '3s' }}></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-teal-600 font-bold tracking-wide uppercase text-sm mb-3">Investimento</h2>
            <h3 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Planos amigáveis para seu bolso</h3>
            <p className="text-slate-600 text-lg font-medium">Comece de graça e faça o upgrade apenas quando seu consultório estiver forte.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            <PricingCard 
              name="Iniciante"
              price="Grátis"
              period=""
              description="Ideal para quem está dando os primeiros passos na profissão."
              features={[
                "Até 5 pacientes ativos",
                "Agenda com personalização",
                "Prontuário eletrônico básico",
                "Suporte por e-mail"
              ]}
              buttonText="Criar Conta Grátis"
              buttonLink="/cadastro?plano=FREE"
            />
            
            <PricingCard 
              name="Consultório VIP"
              price="R$ 97"
              period="/mês"
              description="A solução favorita para automatizar e otimizar todo o consultório."
              features={[
                "Pacientes e Agendas ilimitados",
                "Prontuário especializado",
                "Portal exclusivo para pacientes",
                "Controle financeiro potente",
                "Automações de WhatsApp",
                "Geração automática de Recibos"
              ]}
              buttonText="Começar VIP"
              buttonLink="/cadastro?plano=VIP_MENSAL"
              isPopular
            />

            <PricingCard 
              name="Anual Pro"
              price="R$ 79"
              period="/mês"
              description="O melhor custo-benefício. Pagamento único equivalente de R$ 948."
              features={[
                "Tudo do Consultório VIP",
                "Economia equivalente a 2 meses",
                "Suporte prioritário (WhatsApp)",
                "Mentoria express de Setup",
                "Importação dados antigos"
              ]}
              buttonText="Conhecer o Anual"
              buttonLink="/cadastro?plano=VIP_ANUAL"
            />
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-24 bg-white border-t border-teal-100/50 relative overflow-hidden flex flex-col items-center">
        <div className="absolute inset-0 bg-gradient-to-t from-teal-50/50 to-white/0"></div>
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Renove a sua rotina clínica hoje mesmo.</h2>
          <p className="text-xl text-slate-600 mb-10 font-medium">Junte-se a milhares de psicólogos que modernizaram seus consultórios com o PsicoGestão e ganharam tempo para viver.</p>
          <Link
            href="/cadastro"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-full text-lg font-bold hover:bg-teal-700 hover:shadow-[0_0_40px_-5px_rgba(20,184,166,0.3)] transition-all active:scale-95"
          >
            Começar Gratuitamente
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8 border-t-4 border-teal-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-1 border-r border-slate-800 pr-4">
              <Link href="/" className="flex items-center gap-2 mb-6 group">
                <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-110 transition-transform">
                  P
                </div>
                <span className="font-extrabold text-2xl tracking-tight">PsicoGestão</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                A plataforma mais completa e humanizada para gestão de clínicas psicológicas e psiquiátricas do Brasil.
              </p>
            </div>
            <div className="md:ml-4">
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Produto</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><Link href="#recursos" className="hover:text-teal-400 transition-colors">Prontuário e Assinaturas</Link></li>
                <li><Link href="#recursos" className="hover:text-teal-400 transition-colors">Agenda Dinâmica</Link></li>
                <li><Link href="#recursos" className="hover:text-teal-400 transition-colors">Financeiro & Recibos</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Empresa</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Quem Somos</Link></li>
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Central de Ajuda (FAQ)</Link></li>
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Entre em Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Políticas</h4>
              <ul className="space-y-4 text-sm font-medium text-slate-400">
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Privacidade (LGPD)</Link></li>
                <li><Link href="#" className="hover:text-teal-400 transition-colors">Conformidade CFP</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm font-medium text-center md:text-left">
              © {new Date().getFullYear()} PsicoGestão. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2 text-slate-500 italic">
              <span className="text-xs font-bold uppercase tracking-wider">Feito por Lucas Benevides</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, color, title, description }: { icon: React.ReactNode, color: string, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-teal-100 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-[1.2rem] ${color} border border-white flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function TestimonialCard({ quote, author, role }: { quote: string, author: string, role: string }) {
  return (
    <div className="p-8 pb-10 rounded-3xl bg-white border border-teal-100/50 shadow-sm text-left relative hover:-translate-y-2 transition-transform duration-300">
      <Star className="w-12 h-12 text-teal-50 absolute top-6 right-6" />
      <div className="flex gap-1 mb-6">
        {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />)}
      </div>
      <p className="text-slate-700 font-medium italic mb-8 relative z-10 text-[17px] leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-teal-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-teal-700 uppercase">
          {author.charAt(4)}
        </div>
        <div>
          <h4 className="font-bold text-slate-900">{author}</h4>
          <p className="text-sm font-semibold text-teal-600">{role}</p>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ 
  name, price, period, description, features, buttonText, buttonLink, isPopular 
}: { 
  name: string, price: string, period: string, description: string, features: string[], buttonText: string, buttonLink: string, isPopular?: boolean 
}) {
  return (
    <div className={`relative flex flex-col p-10 rounded-[2.5rem] transition-all duration-500 ${
      isPopular 
        ? 'bg-slate-900 text-white shadow-2xl md:-translate-y-6 md:scale-110 z-10 border border-slate-800' 
        : 'bg-white text-slate-900 border border-slate-200 hover:shadow-xl hover:border-teal-200 z-0'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-0 right-0 max-w-fit mx-auto px-6 py-1.5 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 text-slate-900 text-xs font-black uppercase tracking-widest shadow-lg shadow-teal-500/30">
          O Favorito
        </div>
      )}
      
      <div className="mb-8 mt-2">
        <h3 className={`text-2xl font-black tracking-tight mb-3 ${isPopular ? 'text-white' : 'text-slate-900'}`}>{name}</h3>
        <p className={`text-[15px] mb-8 leading-relaxed font-medium ${isPopular ? 'text-slate-300' : 'text-slate-500'}`}>{description}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black tracking-tighter">{price}</span>
          <span className={`text-sm font-bold ${isPopular ? 'text-slate-400' : 'text-slate-400'}`}>{period}</span>
        </div>
      </div>

      <div className="flex-1 space-y-5 mb-10 border-t border-slate-200/20 pt-8">
        {features.map((feature, i) => (
          <div key={i} className="flex items-start gap-4">
            <CheckCircle2 className={`w-6 h-6 shrink-0 ${isPopular ? 'text-teal-400' : 'text-teal-600'}`} />
            <span className={`text-[15px] font-semibold ${isPopular ? 'text-slate-200' : 'text-slate-700'}`}>{feature}</span>
          </div>
        ))}
      </div>

      <Link 
        href={buttonLink}
        className={`w-full py-4 px-6 rounded-2xl text-center font-bold tracking-wide transition-all ${
          isPopular
            ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:opacity-90 shadow-[0_0_20px_-5px_rgba(20,184,166,0.5)] hover:shadow-[0_0_30px_-5px_rgba(20,184,166,0.7)] active:scale-95'
            : 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:scale-95'
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
