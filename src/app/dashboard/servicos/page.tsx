"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, DollarSign, Tag, X } from "lucide-react";
import { createServiceAction, updateServiceAction, deleteServiceAction, getServicesAction } from "@/app/actions/servicos";
import { toast } from "sonner";

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
    if (res.services) {
      setServicos(res.services);
    } else if (res.error) {
       toast.error(res.error);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setErrorHeader("");

    const priceNum = parseFloat(formData.price.replace(',', '.'));
    if (isNaN(priceNum)) {
      setErrorHeader("Preço inválido");
      setIsPending(false);
      return;
    }

    const data = { ...formData, price: priceNum };
    
    const res = editingId 
      ? await updateServiceAction(editingId, data)
      : await createServiceAction(data);

    if (res.success) {
      loadServices();
      setIsModalOpen(false);
      setFormData({ name: "", price: "", description: "" });
      setEditingId(null);
      toast.success(editingId ? "Serviço atualizado" : "Serviço criado");
    } else {
      setErrorHeader(res.error || "Erro ao salvar serviço");
    }
    setIsPending(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    const res = await deleteServiceAction(id);
    if (res.success) {
      loadServices();
      toast.success("Serviço excluído");
    } else {
      toast.error(res.error || "Erro ao excluir");
    }
  }

  function openEdit(servico: any) {
    setEditingId(servico.id);
    setFormData({ name: servico.name, price: servico.price.toString(), description: servico.description || "" });
    setIsModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-10 h-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tabela de Serviços</h1>
          <p className="text-slate-500 font-medium">Cadastre seus diferentes tipos de atendimento e preços.</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: "", price: "", description: "" }); setIsModalOpen(true); }}
          className="bg-teal-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-5 h-5" /> Novo Serviço
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicos.length === 0 ? (
          <div className="col-span-full p-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
             <Tag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 font-bold">Nenhum serviço cadastrado.</p>
             <p className="text-sm text-slate-400">Clique em "Novo Serviço" para começar.</p>
          </div>
        ) : (
          servicos.map(s => (
            <div key={s.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-bl-full -z-10 opacity-40"></div>
               <h3 className="text-xl font-bold text-slate-900 mb-1">{s.name}</h3>
               <p className="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">{s.description || "Sem descrição"}</p>
               
               <div className="flex items-center justify-between mt-6">
                 <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preço</span>
                   <span className="text-2xl font-black text-teal-600">R$ {s.price.toFixed(2).replace('.', ',')}</span>
                 </div>
                 
                 <div className="flex gap-2">
                   <button 
                     onClick={() => openEdit(s)}
                     className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-colors border border-transparent hover:border-teal-100"
                   >
                     <Pencil className="w-4 h-4" />
                   </button>
                   <button 
                     onClick={() => handleDelete(s.id)}
                     className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </div>
               </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{editingId ? "Editar Serviço" : "Novo Serviço"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold p-2 rounded-full hover:bg-slate-200 transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
               {errorHeader && <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-bold text-sm border border-red-100">{errorHeader}</div>}
               
               <div className="space-y-4">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Serviço</label>
                   <input 
                     required 
                     placeholder="Ex: Terapia Individual"
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-800"
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                   />
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Preço base (R$)</label>
                   <div className="relative">
                     <DollarSign className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                     <input 
                       required 
                       type="text" 
                       placeholder="0,00"
                       className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-teal-500 outline-none transition-all font-black text-slate-700"
                       value={formData.price}
                       onChange={e => setFormData({...formData, price: e.target.value})}
                     />
                   </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Descrição (Opcional)</label>
                   <textarea 
                     rows={3}
                     placeholder="Breve descrição do serviço..."
                     className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium resize-none text-slate-800"
                     value={formData.description}
                     onChange={e => setFormData({...formData, description: e.target.value})}
                   />
                 </div>
               </div>

               <div className="flex gap-4 pt-4">
                 <button 
                   type="button"
                   onClick={() => setIsModalOpen(false)}
                   className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all border border-slate-200"
                 >
                   Cancelar
                 </button>
                 <button 
                   type="submit"
                   disabled={isPending}
                   className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-black hover:bg-teal-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                 >
                   {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? "Atualizar" : "Salvar"}
                 </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
