"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ArrowRight, Calendar, Users, FileText, Wallet, CheckCircle2, 
  Brain, Heart, ShieldCheck, MessageCircle, Activity, Star, 
  Lock, Zap, Check, ChevronDown, Plus
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-teal-500/30 overflow-x-hidden">
      {/* Navbar - Sophisticated & Minimal */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-xl shadow-[0_0_20px_rgba(13,148,136,0.3)] group-hover:scale-110 transition-transform">
              P
            </div>
            <span className="font-bold text-xl tracking-tight text-white">PsicoGestão</span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-8">
            <Link href="#recursos" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Recursos</Link>
            <Link href="#precos" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Preços</Link>
            <Link href="/portal" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Portal do Paciente</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-4">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="px-6 py-2.5 rounded-full bg-brand text-white text-sm font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all active:scale-95"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - 40/60 Split */}
      <section className="relative pt-32 pb-24 lg:pt-52 lg:pb-40 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="lg:grid lg:grid-cols-[42%_58%] gap-12 items-center">
            
            {/* Left Content */}
            <div className="mb-16 lg:mb-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-brand-accent text-xs font-bold tracking-wider uppercase mb-8">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Gestão inteligente para psicólogos</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.05]">
                Concentre-se no <span className="text-brand-accent">paciente.</span><br/>
                O resto é conosco.
              </h1>
              
              <p className="text-lg lg:text-xl text-slate-400 mb-10 leading-relaxed max-w-lg">
                Simplifique sua clínica com agendamento automático, prontuários seguros e controle financeiro de alto nível. Tudo em um só lugar.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link
                  href="/cadastro"
                  className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-brand text-white px-8 py-5 rounded-full text-lg font-bold hover:bg-brand-hover shadow-[0_0_30px_-5px_rgba(13,148,136,0.5)] transition-all active:scale-95"
                >
                  Teste Grátis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#recursos"
                  className="w-full sm:w-auto px-8 py-5 rounded-full text-lg font-bold text-white bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-all"
                >
                  Ver recursos
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-4 text-sm text-slate-500 font-medium">
                <div className="flex -space-x-2">
                  {[1,2,3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800" />
                  ))}
                </div>
                <span>Mais de <strong className="text-slate-300">2.000 psicólogos</strong> já economizam tempo</span>
              </div>
            </div>

            {/* Right Dashboard Preview */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand to-blue-500 rounded-[2.5rem] opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>
              <div className="relative rounded-[2rem] bg-slate-900 p-2 border border-slate-800 shadow-2xl overflow-hidden">
                <div className="rounded-[1.5rem] bg-slate-950 overflow-hidden border border-slate-800/50 aspect-[16/10] relative">
                  <img 
                    src="/psicogestao_dashboard_mockup_premium.png" 
                    alt="PsicoGestão Dashboard Preview" 
                    className="w-full h-full object-cover opacity-90 group-hover:scale-[1.02] transition-transform duration-1000"
                  />
                  {/* Glassmorphism Overlays */}
                  <div className="absolute top-6 left-6 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl hidden lg:block animate-bounce-slow">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Sessão agendada</p>
                        <p className="text-xs font-bold text-white">Paciente: João Silva</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 p-4 rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl hidden lg:block">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                        <Wallet className="w-6 h-6 text-brand" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">+ R$ 4.250,00</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Faturamento Mensal</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-16 border-y border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 hover:opacity-100 transition-opacity">
            <Badge icon={<ShieldCheck />} text="LGPD Compliance" />
            <Badge icon={<Lock />} text="End-to-End Encryption" />
            <Badge icon={<Star />} text="CFP Verified" />
            <Badge icon={<Heart />} text="Health Professional First" />
          </div>
        </div>
      </section>

      {/* Features - Bento Grid Style */}
      <section id="recursos" className="py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div className="max-w-2xl">
              <h2 className="text-brand-accent font-bold uppercase tracking-widest text-sm mb-4">Eficiência</h2>
              <h3 className="text-4xl lg:text-5xl font-bold text-white leading-tight">Cada detalhe pensado para sua clínica voar.</h3>
            </div>
            <p className="text-slate-400 text-lg max-w-sm">
              Mais automação, menos papelada. Recupere 10h semanais com nossas ferramentas exclusivas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[250px] lg:auto-rows-[300px]">
            {/* Main Feature */}
            <div className="md:col-span-6 lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 relative overflow-hidden group">
              <div className="relative z-10 h-full flex flex-col justify-end">
                <Brain className="w-12 h-12 text-brand-accent mb-6" />
                <h4 className="text-3xl font-bold text-white mb-4">Prontuário Inteligente</h4>
                <p className="text-slate-400 max-w-md font-medium">Histórico clínico digital com criptografia militar. Evolua seus pacientes com agilidade e total sigilo.</p>
              </div>
              <div className="absolute top-10 right-[-10%] w-[60%] h-[80%] bg-slate-950/80 rounded-3xl border border-slate-800 rotate-[-5deg] transform group-hover:rotate-0 transition-transform duration-500 shadow-2xl p-6 hidden md:block">
                <div className="space-y-4 opacity-40">
                  <div className="h-4 w-3/4 bg-slate-800 rounded-full"></div>
                  <div className="h-4 w-full bg-slate-800 rounded-full"></div>
                  <div className="h-20 w-full bg-slate-800 rounded-2xl"></div>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="md:col-span-6 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 group">
              <div className="flex flex-col h-full justify-between">
                <Calendar className="w-10 h-10 text-brand-accent" />
                <div>
                  <h4 className="text-2xl font-bold text-white mb-3">Agenda Fluida</h4>
                  <p className="text-slate-400">Sincronização em tempo real e lembretes via WhatsApp sem custo extra.</p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="md:col-span-3 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 group">
              <div className="flex flex-col h-full items-center justify-center text-center">
                <Wallet className="w-12 h-12 text-brand-accent mb-6" />
                <h4 className="text-2xl font-bold text-white mb-3">Financeiro Ninja</h4>
                <p className="text-slate-400">Fluxo de caixa claro e relatórios automáticos.</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="md:col-span-3 lg:col-span-8 bg-brand border border-brand/20 rounded-[2.5rem] p-10 relative overflow-hidden">
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 h-full">
                 <div className="flex-1">
                   <h4 className="text-3xl font-bold text-white mb-4">Fidelidade dos Pacientes</h4>
                   <p className="text-teal-50/70 font-medium">Portal do paciente exclusivo para consulta de documentos, recibos e agendamentos.</p>
                 </div>
                 <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                   <Users className="w-10 h-10 text-white" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Premium Testimonials */}
      <section className="py-32 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h3 className="text-4xl lg:text-6xl font-black text-white mb-6">Confiança que se sente.</h3>
            <p className="text-slate-400 text-lg">Junte-se a quem já elevou o nível da clínica.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Testimonial 
              quote="A estética do sistema transmite profissionalismo para meus pacientes. O financeiro é simplesmente impecável."
              name="Dra. Letícia Rossi"
              role="Psicóloga Clínica"
            />
            <Testimonial 
              quote="Migrei de um sistema antigo e a diferença de agilidade é absurda. Me sinto muito mais segura com meus prontuários."
              name="Dr. Thiago Mendes"
              role="Psicanalista"
              featured
            />
            <Testimonial 
              quote="O suporte é humanizado e a ferramenta é muito intuitiva. Meus pacientes amam o portal exclusivo."
              name="Dra. Ana Paula"
              role="Psicóloga TCC"
            />
          </div>
        </div>
      </section>

      {/* Pricing - Visual Dominance */}
      <section id="precos" className="py-32 bg-slate-950 relative">
        <div className="absolute top-[20%] left-[-5%] w-[30%] h-[30%] bg-brand/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-brand-accent font-bold mb-6 text-sm">TRANSPARÊNCIA</h2>
          <h3 className="text-4xl lg:text-7xl font-bold text-white mb-20 tracking-tight">O plano certo para sua <br/>evolvência profissional.</h3>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            
            {/* Free Plan */}
            <div className="p-10 rounded-[3rem] bg-slate-900/50 border border-slate-800 flex flex-col">
              <h4 className="text-2xl font-bold mb-2">Inicial</h4>
              <p className="text-slate-500 mb-8 font-medium">Para novos profissionais</p>
              <div className="text-5xl font-bold mb-10 text-white">Grátis</div>
              <ul className="flex-1 space-y-4 mb-10 text-left">
                <PricingFeature text="Até 5 pacientes ativos" />
                <PricingFeature text="Agenda simplificada" />
                <PricingFeature text="Prontuário básico" />
              </ul>
              <Link href="/cadastro" className="w-full py-5 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">
                Criar Conta Grátis
              </Link>
            </div>

            {/* VIP Plan - The High Roller */}
            <div className="p-10 rounded-[3rem] bg-slate-900 border-2 border-brand shadow-[0_0_50px_-10px_rgba(13,148,136,0.3)] relative group transform lg:scale-110 flex flex-col overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-brand text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">Popular</div>
              </div>
              <h4 className="text-3xl font-bold mb-2 text-white">Profissional VIP</h4>
              <p className="text-slate-400 mb-8 font-medium">Gestão Completa & Premium</p>
              <div className="flex items-baseline justify-center gap-2 mb-10">
                <span className="text-6xl font-black text-white">R$ 39,99</span>
                <span className="text-slate-500 font-bold">/mês</span>
              </div>
              <ul className="flex-1 space-y-4 mb-10 text-left">
                <PricingFeature text="Pacientes Ilimitados" bold />
                <PricingFeature text="WhatsApp Lembretes incluídos" bold />
                <PricingFeature text="Portal do Paciente Premium" />
                <PricingFeature text="Controle Financeiro Avançado" />
                <PricingFeature text="Recibos e Documentos ilimitados" />
              </ul>
              <Link href="/cadastro" className="w-full py-5 rounded-2xl bg-brand text-white font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all scale-105">
                Começar VIP Agora
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-32 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-10">Modernize sua rotina hoje.</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Mais que um software, seu parceiro de crescimento. Pare de gerenciar e comece a evoluir.
          </p>
          <Link href="/cadastro" className="inline-flex items-center gap-3 bg-brand text-white px-12 py-6 rounded-full text-2xl font-black hover:scale-105 hover:shadow-2xl hover:shadow-brand/40 transition-all active:scale-95">
            Teste Grátis Agora
            <ArrowRight className="w-8 h-8" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-950 border-t border-slate-900 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-white">P</div>
             <span className="text-white font-bold text-lg">PsicoGestão</span>
          </div>
          <div className="flex gap-8 text-sm font-medium">
            <Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/termos" className="hover:text-white transition-colors">Termos</Link>
            <Link href="https://wa.me/5571992307518" className="hover:text-white transition-colors">Apoio</Link>
          </div>
          <p className="text-xs">© 2026 PsicoGestão. LGPD Compliant.</p>
        </div>
      </footer>
    </div>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3 justify-center text-slate-400 font-bold text-xs tracking-wider uppercase">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function FeatureCard({ icon, title, description, large }: { icon: React.ReactNode, title: string, description: string, large?: boolean }) {
  return (
    <div className={`p-10 rounded-[2.5rem] bg-slate-900 border border-slate-800 hover:border-brand/40 transition-all duration-500 group ${large ? 'md:col-span-2' : ''}`}>
      <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-8 border border-brand/20 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="text-2xl font-bold text-white mb-4">{title}</h4>
      <p className="text-slate-400 leading-relaxed font-medium">{description}</p>
    </div>
  );
}

function Testimonial({ quote, name, role, featured }: { quote: string, name: string, role: string, featured?: boolean }) {
  return (
    <div className={`p-10 rounded-[2.5rem] border transition-all duration-500 ${featured ? 'bg-brand border-brand/20 text-white shadow-2xl' : 'bg-slate-900 border-slate-800 text-slate-200 hover:border-brand/30'}`}>
      <div className="flex gap-1 mb-8">
        {[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 fill-current ${featured ? 'text-white' : 'text-brand'}`} />)}
      </div>
      <p className={`text-xl font-bold leading-relaxed mb-10 ${featured ? 'text-white' : 'text-white'}`}>"{quote}"</p>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${featured ? 'bg-white text-brand' : 'bg-slate-800 text-white'}`}>
          {name.charAt(4)}
        </div>
        <div>
          <p className="font-bold">{name}</p>
          <p className={`text-sm opacity-60`}>{role}</p>
        </div>
      </div>
    </div>
  );
}

function PricingFeature({ text, bold }: { text: string, bold?: boolean }) {
  return (
    <li className="flex items-center gap-3 shrink-0">
      <CheckCircle2 className={`w-5 h-5 shrink-0 ${bold ? 'text-brand' : 'text-slate-600'}`} />
      <span className={`text-sm ${bold ? 'font-black text-white' : 'font-medium text-slate-400'}`}>{text}</span>
    </li>
  );
}
