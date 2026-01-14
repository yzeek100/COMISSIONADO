
import { Employee } from '../types';

declare const jspdf: any;

export const generateConsolidatedPDF = (employees: Employee[], title: string) => {
  const doc = new jspdf.jsPDF('l', 'mm', 'a4');
  const date = new Date().toLocaleDateString('pt-BR');

  // Title
  doc.setFontSize(22);
  doc.setTextColor(30, 41, 59);
  doc.text("DOSSIÊ DE COMISSIONADOS - ALE-RR", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Gerado pelo Fiscal de Amigo™ em ${date}`, 14, 28);
  doc.text(`Total de Investigados: ${employees.length}`, 14, 34);

  const tableData = employees.map(emp => [
    emp.nome,
    emp.cargo,
    `R$ ${emp.salarioBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${emp.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    `R$ ${emp.salarioLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
  ]);

  (doc as any).autoTable({
    startY: 40,
    head: [['Nome Completo', 'Cargo Identificado', 'R$ Bruto', 'R$ Descontos', 'R$ Na Conta']],
    body: tableData,
    headStyles: { 
      fillColor: [37, 99, 235],
      fontSize: 9,
      fontStyle: 'bold'
    },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right', fontStyle: 'bold' }
    },
    theme: 'grid',
    margin: { top: 40 }
  });

  doc.save('dossie_amigo_comissionado.pdf');
};
