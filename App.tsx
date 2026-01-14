
import React, { useState, useMemo, useEffect } from 'react';
import { Employee } from './types';
import { parsePayrollOCR } from './utils/parser';
import { generateConsolidatedPDF } from './services/pdfGenerator';
import { extractTextFromPDF } from './utils/pdfExtractor';
import { RAW_PAYROLL_DATA } from './services/data';

const App: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isManualInput, setIsManualInput] = useState(false);
  const [pastedText, setPastedText] = useState('');

  // Carregar dados iniciais
  useEffect(() => {
    const initialData = parsePayrollOCR(RAW_PAYROLL_DATA);
    setEmployees(initialData);
  }, []);

  const processText = (text: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parsePayrollOCR(text);
      if (parsed.length > 0) {
        setEmployees(parsed);
        setIsManualInput(false);
        setPastedText('');
      } else {
        alert("Ops! O detector não encontrou dados válidos.");
      }
      setIsProcessing(false);
    }, 400);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const text = await extractTextFromPDF(file, (p) => setProgress(p));
      const parsed = parsePayrollOCR(text);
      setEmployees(parsed);
    } catch (error) {
      alert("Erro ao ler o documento secreto.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Lógica de exibição (todos ou filtrados)
  const displayEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    const search = searchTerm.toUpperCase();
    return employees.filter(emp => 
      emp.nome.includes(search) || 
      emp.cargo.toUpperCase().includes(search)
    );
  }, [employees, searchTerm]);

  // Números do Dossiê
  const stats = useMemo(() => {
    return displayEmployees.reduce((acc, curr) => ({
      bruto: acc.bruto + curr.salarioBruto,
      desconto: acc.desconto + curr.desconto,
      liquido: acc.liquido + curr.salarioLiquido
    }), { bruto: 0, desconto: 0, liquido: 0 });
  }, [displayEmployees]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100">
      {/* Header Fofoca Chic */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="text-2xl group-hover:rotate-12 transition-transform">🕵️‍♂️</span>
            <h1 className="text-lg font-black tracking-tighter text-slate-800">
                FISCAL<span className="text-blue-600">DE</span>AMIGO<span className="text-[10px] align-top ml-0.5 text-slate-400">TM</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsManualInput(!isManualInput)} 
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors border border-slate-200 px-3 py-1.5 rounded-full"
          >
            {isManualInput ? 'Fechar Painel' : 'Alimentar Base'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Será que seu amigo é <br/>
                <span className="text-blue-600 italic">comissionado na ALE-RR?</span>
            </h2>
            <p className="text-slate-500 font-medium">Investigue a folha de pagamento com a precisão de um detetive e o veneno de uma vizinha.</p>
        </div>

        {/* Barra de Busca "Sherlock" */}
        <div className="max-w-2xl mx-auto mb-16 relative group">
            <div className="absolute -inset-1 bg-blue-500 rounded-full blur opacity-10 group-focus-within:opacity-20 transition duration-500"></div>
            <input 
              type="text" 
              placeholder="Digite o nome da peça (ou cargo)..." 
              className="relative w-full pl-8 pr-16 py-6 rounded-full bg-white border-2 border-slate-100 text-xl shadow-xl shadow-blue-900/5 focus:border-blue-500 focus:ring-0 outline-none transition-all placeholder:text-slate-200 font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">
                {searchTerm.length > 0 ? '✨' : '🔍'}
            </div>
        </div>

        {/* Input Manual Oculto */}
        {isManualInput && (
            <div className="mb-12 p-8 bg-white rounded-[2rem] border border-slate-200 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
                <textarea 
                    className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none mb-6"
                    placeholder="Cole dados da transparência aqui..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                />
                <div className="flex gap-3">
                    <button onClick={() => processText(pastedText)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Sincronizar</button>
                    <label className="bg-blue-50 text-blue-600 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all cursor-pointer">
                        Upload PDF Secreto
                        <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} />
                    </label>
                </div>
            </div>
        )}

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">Vasculhando arquivos do governo... {progress}%</p>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Cards de Resumo (Os Números) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Almas Identificadas</p>
                    <p className="text-3xl font-black text-slate-800 tracking-tighter">{displayEmployees.length}</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Custo Bruto</p>
                    <p className="text-3xl font-black text-slate-400 line-through tracking-tighter">R$ {(stats.bruto / 1000).toFixed(0)}k</p>
                </div>
                <div className="bg-blue-600 p-8 rounded-[2rem] shadow-xl shadow-blue-500/20 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1 relative z-10">Montante da Alegria 💸</p>
                    <p className="text-3xl font-black tracking-tighter relative z-10 italic">R$ {(stats.liquido / 1000).toFixed(1)}k</p>
                </div>
            </div>

            {/* A LISTA DE NOMES (O Dossiê Tabular) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-blue-900/5 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Lista de Investigados</h3>
                    <button 
                        onClick={() => generateConsolidatedPDF(displayEmployees, "Dossiê de Comissionados")}
                        className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                    >
                        📥 Baixar Provas (PDF)
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-100">
                                <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nome do "Trabalhador"</th>
                                <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Cargo</th>
                                <th className="py-5 px-8 text-[9px] font-black text-blue-600 uppercase tracking-widest text-right">Líquido (No Pix)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {displayEmployees.length > 0 ? (
                                displayEmployees.map((emp, idx) => (
                                    <tr key={`${emp.nome}-${idx}`} className="group hover:bg-blue-50/20 transition-colors">
                                        <td className="py-6 px-8">
                                            <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{emp.nome}</p>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md inline-block">{emp.cargo}</p>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <p className="text-lg font-black text-slate-900 tracking-tighter italic">
                                                R$ {emp.salarioLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-24 text-center">
                                        <span className="text-5xl mb-4 block grayscale">🤐</span>
                                        <p className="text-slate-300 font-black uppercase text-[10px] tracking-widest">Ninguém encontrado. Ou ele é honesto, ou você errou o nome.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servidor de Dados: ALE-RR 2025</p>
        </div>
        <p className="text-[9px] text-slate-300 font-medium px-6 max-w-md mx-auto italic">
            App independente de fiscalização cidadã. Nomes e valores baseados no Portal da Transparência.
        </p>
      </footer>
    </div>
  );
};

export default App;
