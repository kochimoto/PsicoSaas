"use client";

import { useState } from "react";
import { UploadCloud, File, Trash2, Download, Search, FileText, MessageCircle } from "lucide-react";
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
        className="border-2 border-dashed border-slate-300 rounded-[2rem] p-10 cursor-pointer hover:border-blue-500 hover:bg-min-h-40 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center text-center group bg-white"
      >
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1">Upload de Novo Documento</h3>
        <p className="text-slate-500 font-medium">Clique aqui para enviar PDFs, Imagens, RM ou Recibos. (Máx 5MB)</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 h-full">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <p className="font-medium text-lg">Nenhum documento salvo na nuvem da clínica.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {documents.map(doc => (
              <div key={doc.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
                    <File className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{doc.name}</h4>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-0.5">
                      <span className="bg-slate-100 px-2.5 py-0.5 rounded-md text-xs font-bold text-slate-600 uppercase tracking-wider border border-slate-200">{doc.type}</span>
                      {doc.patient ? `Para: ${doc.patient.name}` : 'Uso Interno'}
                      <span className="text-slate-300">•</span>
                      {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {whatsappEnabled && doc.patient && (
                    <button 
                      onClick={() => handleSendZap(doc.id)}
                      disabled={workingId === doc.id}
                      className="p-3 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-colors font-bold disabled:opacity-50 flex items-center gap-2"
                      title="Enviar via WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" /> 
                    </button>
                  )}
                  <Link 
                    href={doc.fileUrl} 
                    target="_blank" 
                    className="p-3 text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors font-bold flex items-center gap-2 shadow-sm"
                  >
                    <Download className="w-4 h-4" /> <span className="hidden sm:inline">Baixar</span>
                  </Link>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    disabled={workingId === doc.id}
                    className="p-3 text-rose-500 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors font-bold disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Enviar Arquivo</h2>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-5">
              {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-sm font-bold border border-red-100 rounded-xl">{errorMsg}</div>}
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Título do Documento</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Laudo Avaliação TCC"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Categoria</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option value="LAUDO">Laudo Clínico</option>
                    <option value="RECIBO">Recibo de Pagto</option>
                    <option value="RECEITA">Receita</option>
                    <option value="OUTRO">Outro / Interno</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Vincular a Paciente</label>
                  <select 
                    value={formData.patientId}
                    onChange={e => setFormData({...formData, patientId: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
                  >
                     <option value="">Nenhum (Uso Interno)</option>
                     {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Arquivo Físico (PDF/Imagem)</label>
                <div className="w-full border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 relative focus-within:ring-2 focus-within:ring-blue-500 transition-all hover:bg-slate-100">
                  <input 
                    type="file" 
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  />
                  <div className="text-center pointer-events-none">
                    {selectedFile ? (
                      <div className="font-bold text-blue-700 break-all">{selectedFile.name} ({(selectedFile.size/1024/1024).toFixed(2)} MB)</div>
                    ) : (
                      <div className="font-bold text-slate-500">Clique para anexar ou solte o arquivo aqui.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20 active:scale-95 flex justify-center items-center gap-2">
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
