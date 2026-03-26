"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, DollarSign, Tag, X } from "lucide-react";
import { createServiceAction, updateServiceAction, deleteServiceAction, getServicesAction } from "@/app/actions/servicos";

export default function ServicosPage() {
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", price: "", description: "" });
  const [isPending, setIsPending] = useState(false);
  const [errorHeader, setErrorHeader] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    const res = await getServicesAction();
    if (res.services) setServicos(res.services);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setErrorHeader("");

    const data = { ...formData, price: parseFloat(formData.price) };
    
    const res = editingId 
      ? await updateServiceAction(editingId, data)
      : await createServiceAction(data);

    if (res.success) {
      loadServices();
      setIsModalOpen(false);
      setFormData({ name: "", price: "", description: "" });
      setEditingId(null);
    } else {
      setErrorHeader(res.error || "Erro ao salvar serviço");
    }
    setIsPending(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    const res = await deleteServiceAction(id);
    if (res.success) loadServices();
  }

  function openEdit(servico: any) {
    setEditingId(servico.id);
    setFormData({ name: servico.name, price: servico.price.toString(), description: servico.description || "" });
    setIsModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Tabela de Serviços</h1>
          <p className="text-slate-400 mt-2 font-medium italic">Cadastre seus diferentes tipos de atendimento e preços.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: "", price: "", description: "" }); setIsModalOpen(true); }}
          className="bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_4px_20px_rgba(13,148,136,0.3)] active:scale-95"
        >
          <Plus className="w-5 h-5" /> Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicos.length === 0 ? (
          <div className="col-span-full p-24 text-center bg-slate-900 rounded-[3rem] border-2 border-dashed border-slate-800 shadow-inner backdrop-blur-sm">
             <div className="w-24 h-24 bg-slate-950 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-800 shadow-2xl">
                <Tag className="w-12 h-12 text-slate-700" />
             </div>
             <p className="text-white text-xl font-black tracking-tight mb-2">Nenhum serviço cadastrado</p>
             <p className="text-slate-500 font-medium italic mb-10">Use o botão acima para cadastrar seu primeiro serviço.</p>
          </div>
        ) : (
          servicos.map(s => (
            <div key={s.id} className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl hover:border-brand/30 transition-all group relative overflow-hidden backdrop-blur-sm">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-bl-[4rem] -z-10 blur-xl group-hover:bg-brand/10 transition-colors"></div>
               <div className="flex flex-col h-full justify-between gap-6 relative">
                 <div>
                   <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:text-brand-accent transition-colors">{s.name}</h3>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 italic">{s.description || "Sem descrição disponível"}</p>
                 </div>
                 
                 <div className="flex items-end justify-between">
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 ml-1">Valor do Repasse</span>
                     <span className="text-3xl font-black text-brand-accent drop-shadow-[0_0_10px_rgba(94,234,212,0.1)]">R$ {s.price.toFixed(2).replace('.', ',')}</span>
                   </div>
                   
                   <div className="flex gap-3">
                     <button 
                       onClick={() => openEdit(s)}
                       className="p-3 bg-slate-950 text-slate-400 rounded-2xl hover:bg-slate-800 hover:text-white transition-all border border-slate-800 active:scale-90"
                       title="Editar"
                     >
                       <Pencil className="w-4 h-4" />
                     </button>
                     <button 
                       onClick={() => handleDelete(s.id)}
                       className="p-3 bg-slate-950 text-slate-600 rounded-2xl hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-slate-800 active:scale-90"
                       title="Excluir"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md relative">
              <div className="absolute top-0 left-0 w-24 h-1 bg-brand"></div>
              <h2 className="text-3xl font-black text-white tracking-tighter">{editingId ? "Editar Serviço" : "Novo Serviço"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-3 bg-slate-950 border border-slate-800 rounded-2xl transition-all active:scale-95">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
               {errorHeader && <div className="p-4 bg-rose-500/10 text-rose-400 rounded-2xl font-bold text-sm border border-rose-500/20 animate-pulse">{errorHeader}</div>}
               
               <div className="space-y-6">
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Nome do Serviço</label>
                   <input 
                     required 
                     placeholder="Ex: Terapia Individual"
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 focus:ring-2 focus:ring-brand outline-none transition-all font-bold text-white shadow-inner placeholder:text-slate-700"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Preço base (R$)</label>
                   <div className="relative">
                     <DollarSign className="absolute left-5 top-5.5 w-5 h-5 text-brand-accent mt-0.5" />
                     <input 
                       required 
                       type="number" 
                       step="0.01"
                       placeholder="0,00"
                       className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 pl-14 focus:ring-2 focus:ring-brand outline-none transition-all font-black text-2xl text-white shadow-inner placeholder:text-slate-700"
                       value={formData.price}
                       onChange={e => setFormData({...formData, price: e.target.value})}
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Descrição (Opcional)</label>
                   <textarea 
                     rows={3}
                     placeholder="Breve descrição do serviço..."
                     className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 focus:ring-2 focus:ring-brand outline-none transition-all font-medium text-white shadow-inner placeholder:text-slate-700 resize-none"
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                 </div>
               </div>

               <div className="flex gap-4 pt-6">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 bg-slate-950 text-slate-400 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all border border-slate-800 active:scale-95"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit"
                   disabled={isPending}
                   className="flex-1 bg-brand hover:bg-brand-hover text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-brand/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                   {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : editingId ? "Atualizar" : "Salvar"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
