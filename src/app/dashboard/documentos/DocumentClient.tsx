"use client";

import { useState } from "react";
import { UploadCloud, File, Trash2, Download, Search, FileText, MessageCircle, X, Plus, User as UserIconIcon } from "lucide-react";
import { uploadDocumentAction, deleteDocumentAction } from "@/app/actions/documents";
import { sendDocumentWhatsAppAction } from "@/app/actions/whatsapp";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type DocInfo = {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  createdAt: Date;
  patient: { name: string } | null;
};

export default function DocumentClient({ documents, patients, whatsappEnabled = false }: { documents: DocInfo[], patients: {id: string, name: string}[], whatsappEnabled?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workingId, setWorkingId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "LAUDO",
    patientId: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile || !formData.name) {
      toast.error("Selecione um arquivo e informe um título.");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    data.append("file", selectedFile);
    data.append("name", formData.name);
    data.append("type", formData.type);
    if(formData.patientId) data.append("patientId", formData.patientId);

    const res = await uploadDocumentAction(data);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Documento enviado!");
      setIsModalOpen(false);
      setSelectedFile(null);
      setFormData({ name: "", type: "LAUDO", patientId: "" });
      router.refresh();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if(!confirm("Certeza que deseja excluir este documento?")) return;
    setWorkingId(id);
    const res = await deleteDocumentAction(id);
    if (res.success) {
      toast.success("Documento excluído");
    } else {
      toast.error("Erro ao excluir");
    }
    setWorkingId("");
    router.refresh();
  }

  async function handleSendZap(id: string) {
    setWorkingId(id);
    const res = await sendDocumentWhatsAppAction(id);
    if(res?.success) {
      toast.success("Link enviado ao WhatsApp do paciente!");
    } else {
      toast.error(res?.error || "Erro ao enviar");
    }
    setWorkingId("");
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">Documentos e Laudos</h1>
            <p className="text-slate-500">Armazene e compartilhe arquivos com seus pacientes</p>
         </div>
         <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-md"
         >
           <Plus className="w-4 h-4" /> Novo Documento
         </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic">
            Nenhum documento encontrado. Clique em "Novo Documento" para começar.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Arquivo</th>
                  <th className="px-6 py-4">Status / Paciente</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{doc.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{doc.type}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {doc.patient ? (
                        <div className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                          <UserIconIcon className="w-3.5 h-3.5 text-slate-400" /> {doc.patient.name}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Uso Interno</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          {whatsappEnabled && doc.patient && (
                            <button 
                              onClick={() => handleSendZap(doc.id)}
                              disabled={workingId === doc.id}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-100"
                              title="Enviar por WhatsApp"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          )}
                          <a 
                            href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-100"
                            title="Baixar Arquivo"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            disabled={workingId === doc.id}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Novo Documento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Título</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Laudo Avaliação"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="LAUDO">Laudo</option>
                    <option value="RECIBO">Recibo</option>
                    <option value="RECEITA">Receita</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Paciente</label>
                  <select 
                    value={formData.patientId}
                    onChange={e => setFormData({...formData, patientId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-1 focus:ring-teal-500"
                  >
                     <option value="">Uso Interno</option>
                     {patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Arquivo (PDF/Img)</label>
                <div className="w-full border border-dashed border-slate-200 rounded-lg p-6 bg-slate-50 relative focus-within:ring-1 focus-within:ring-teal-500">
                  <input 
                    type="file" required
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    {selectedFile ? (
                      <span className="text-xs font-bold text-teal-600 break-all">{selectedFile.name}</span>
                    ) : (
                      <span className="text-xs text-slate-400">Clique para anexar arquivo</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-sm transition-all border border-slate-200">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50">
                  {loading ? "Enviando..." : "Enviar Arquivo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



