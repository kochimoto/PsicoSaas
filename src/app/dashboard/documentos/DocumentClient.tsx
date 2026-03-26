"use client";

import { useState } from "react";
import { UploadCloud, File, Trash2, Download, Search, FileText, MessageCircle, X } from "lucide-react";
import { uploadDocumentAction, deleteDocumentAction } from "@/app/actions/documents";
import { sendDocumentWhatsAppAction } from "@/app/actions/whatsapp";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [errorMsg, setErrorMsg] = useState("");
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
      setErrorMsg("Selecione um arquivo e informe um título.");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");

    const data = new FormData();
    data.append("file", selectedFile);
    data.append("name", formData.name);
    data.append("type", formData.type);
    if(formData.patientId) data.append("patientId", formData.patientId);

    const res = await uploadDocumentAction(data);
    if (res?.error) {
      setErrorMsg(res.error);
    } else {
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
    await deleteDocumentAction(id);
    setWorkingId("");
    router.refresh();
  }

  async function handleSendZap(id: string) {
    if(!confirm("Enviar link deste documento por WhatsApp ao paciente?")) return;
    setWorkingId(id);
    const res = await sendDocumentWhatsAppAction(id);
    if(res?.error) {
      setErrorMsg(res.error);
    } else {
      alert("Enviado com sucesso!");
    }
    setWorkingId("");
  }

  return (
    <div className="space-y-6">
      
      {/* Upload Dropzone Header */}
      <div 
        onClick={() => setIsModalOpen(true)}
        className="border-2 border-dashed border-slate-800 rounded-[2.5rem] p-10 cursor-pointer hover:border-brand hover:bg-brand/5 transition-all flex flex-col items-center justify-center text-center group bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-800">
          <UploadCloud className="w-8 h-8 text-brand-accent" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1">Upload de Novo Documento</h3>
        <p className="text-slate-400 font-medium">Clique aqui para enviar PDFs, Imagens ou Documentos. (Máx 5MB)</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[300px]">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 h-[300px]">
            <div className="w-20 h-20 bg-slate-950 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <FileText className="w-10 h-10 text-slate-700" />
            </div>
            <p className="font-bold text-lg text-slate-400">Nenhum documento salvo na nuvem da clínica.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {documents.map(doc => (
              <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-indigo-400 border border-slate-800 shrink-0 shadow-inner">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-lg">{doc.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs font-bold uppercase tracking-wider">
                      <span className="bg-indigo-500/10 px-2.5 py-0.5 rounded-md text-indigo-400 border border-indigo-500/20">{doc.type}</span>
                      <span className={`px-2.5 py-0.5 rounded-md border ${doc.patient ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-slate-500 bg-slate-500/10 border-slate-800'}`}>
                        {doc.patient ? `Para: ${doc.patient.name}` : 'Uso Interno'}
                      </span>
                      <span className="text-slate-600 font-medium lowercase italic mx-1">•</span>
                      <span className="text-slate-500 font-medium">{new Date(doc.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {whatsappEnabled && doc.patient && (
                    <button 
                      onClick={() => handleSendZap(doc.id)}
                      disabled={workingId === doc.id}
                      className="p-3 text-emerald-500 bg-slate-950 border border-slate-800 rounded-xl hover:bg-emerald-500/10 transition-all font-bold disabled:opacity-50"
                      title="Enviar via WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" /> 
                    </button>
                  )}
                  <Link 
                    href={doc.fileUrl} 
                    target="_blank" 
                    className="p-3 text-brand-accent bg-slate-950 border border-slate-800 rounded-xl hover:bg-brand/10 transition-all font-bold flex items-center gap-2 shadow-lg"
                  >
                    <Download className="w-5 h-5" /> <span className="hidden sm:inline">Baixar</span>
                  </Link>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    disabled={workingId === doc.id}
                    className="p-3 text-rose-500 bg-slate-950 border border-slate-800 rounded-xl hover:bg-rose-500/10 transition-all font-bold disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50">
              <h2 className="text-2xl font-black text-white tracking-tight">Enviar Arquivo</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white bg-slate-950 p-2.5 rounded-full border border-slate-800 transition-all hover:scale-110">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-8 space-y-6">
              {errorMsg && <div className="p-4 bg-rose-500/10 text-rose-400 text-sm font-bold border border-rose-500/20 rounded-2xl animate-pulse">{errorMsg}</div>}
              
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Título do Documento</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Laudo Avaliação TCC"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand outline-none font-bold text-white placeholder:text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Categoria</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand outline-none font-bold text-white [color-scheme:dark]"
                  >
                    <option value="LAUDO">Laudo Clínico</option>
                    <option value="RECIBO">Recibo de Pagto</option>
                    <option value="RECEITA">Receita</option>
                    <option value="OUTRO">Outro / Interno</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Paciente</label>
                  <select 
                    value={formData.patientId}
                    onChange={e => setFormData({...formData, patientId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-brand outline-none font-bold text-white [color-scheme:dark]"
                  >
                     <option value="">Nenhum (Uso Interno)</option>
                     {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Arquivo Físico (PDF/Imagem)</label>
                <div className="w-full border-2 border-dashed border-slate-800 rounded-2xl p-8 bg-slate-950 relative focus-within:ring-2 focus-within:ring-brand transition-all hover:bg-slate-900 group">
                  <input 
                    type="file" 
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <div className="text-center pointer-events-none">
                    {selectedFile ? (
                      <div className="font-black text-brand-accent break-all flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5" /> {selectedFile.name} ({(selectedFile.size/1024/1024).toFixed(2)} MB)
                      </div>
                    ) : (
                      <div className="font-bold text-slate-600 group-hover:text-slate-400 transition-colors">
                        Clique para anexar ou solte o arquivo aqui.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black uppercase tracking-widest py-5 rounded-2xl transition-all active:scale-95 border border-slate-700">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all disabled:opacity-50 shadow-2xl shadow-brand/20 active:scale-95 flex justify-center items-center gap-2">
                  {loading ? "Enviando..." : <><UploadCloud className="w-5 h-5"/> Enviar Arquivo</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
