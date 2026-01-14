
import { Employee } from '../types';

export const parsePayrollOCR = (text: string): Employee[] => {
  const employeesMap = new Map<string, Employee>();
  
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.includes('---PAGE_BREAK---'));

  if (lines.length === 0) return [];

  // Utilitário para limpar valores financeiros complexos (ex: "8.000,00", "1.234,56")
  const cleanValue = (val: string): number => {
    if (!val) return 0;
    // Captura apenas o padrão de números com separadores decimais/milhar brasileiros
    const matches = val.match(/(\d{1,3}(\.\d{3})*,\d{2})|(\d+,\d{2})|(\d+(\.\d+)?)/g);
    if (!matches) return 0;
    
    // Pega o último valor numérico da string (geralmente o valor total da coluna)
    const rawValue = matches[matches.length - 1];
    
    // Se contém vírgula, assume formato BR (1.000,00 -> 1000.00)
    if (rawValue.includes(',')) {
      return parseFloat(rawValue.replace(/\./g, '').replace(',', '.'));
    }
    return parseFloat(rawValue);
  };

  const normalizeName = (name: string): string => {
    return name.toUpperCase().replace(/\s+/g, ' ').trim();
  };

  // Detecção Automática de Delimitador (Tab, Ponto-e-Vírgula ou Vírgula)
  const sampleLines = lines.slice(0, 5);
  const delimiters = ['\t', ';', ','];
  let bestDelimiter = ',';
  let maxFields = 0;

  delimiters.forEach(d => {
    const fields = sampleLines[0].split(d).length;
    if (fields > maxFields) {
      maxFields = fields;
      bestDelimiter = d;
    }
  });

  const firstLine = lines[0].toUpperCase();
  const isTabular = (firstLine.includes('NOME') && (firstLine.includes('SALÁRIO') || maxFields >= 2));

  if (isTabular) {
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Regex para split que respeita aspas (para CSVs padrão)
      const parts = bestDelimiter === '\t' 
        ? line.split('\t') 
        : line.match(/(".*?"|[^,;]+)(?=\s*[,;]|\s*$)/g) || line.split(bestDelimiter);
      
      if (parts && parts.length >= 2) {
        const rawNome = parts[0].replace(/"/g, '').trim();
        const nome = normalizeName(rawNome);
        
        // Ignora lixo de processamento e cabeçalhos repetidos
        if (nome === "NOME NÃO ENCONTRADO" || nome === "NOME" || nome.length < 3) continue;

        const bruto = cleanValue(parts[1]);
        const desconto = parts[2] ? cleanValue(parts[2]) : 0;

        // Agregação: Se o nome já existe, soma os valores (Consolidação de benefícios)
        const existing = employeesMap.get(nome);
        if (existing) {
          existing.salarioBruto += bruto;
          existing.desconto += desconto;
          existing.salarioLiquido = existing.salarioBruto - existing.desconto;
        } else {
          employeesMap.set(nome, {
            matricula: `ALE-${1000 + i}`,
            nome,
            cargo: "COMISSIONADO / TÉCNICO",
            vinculo: "COMISSIONADO",
            salarioBruto: bruto,
            desconto: desconto,
            salarioLiquido: bruto - desconto
          });
        }
      }
    }
  } else {
    // Motor OCR Legado para documentos digitalizados
    let currentEmp: Employee | null = null;
    let accumulatedCargo: string[] = [];

    for (const line of lines) {
      const startMatch = line.match(/^(\d{1,6})\s+([A-ZÀ-ÖØ-Þ][A-ZÀ-ÖØ-Þ\s\-.]{4,})/);
      
      if (startMatch) {
        if (currentEmp && currentEmp.salarioBruto > 0) saveOrConsolidate(currentEmp, accumulatedCargo.join(' '));
        
        currentEmp = {
          matricula: startMatch[1],
          nome: normalizeName(startMatch[2]),
          cargo: "",
          vinculo: "COMISSIONADO",
          salarioBruto: 0,
          desconto: 0,
          salarioLiquido: 0
        };
        accumulatedCargo = [];
        const remainder = line.substring(startMatch[0].length).trim();
        if (remainder.length > 2 && !remainder.match(/\d/)) accumulatedCargo.push(remainder);
        continue;
      }

      if (currentEmp) {
        if (line.includes("9000") || line.toUpperCase().includes("TOTAL DE PROVENTOS")) {
          currentEmp.salarioBruto = cleanValue(line);
          currentEmp.salarioLiquido = currentEmp.salarioBruto;
          saveOrConsolidate(currentEmp, accumulatedCargo.join(' '));
          currentEmp = null;
        } else if (!line.match(/^\d{1,6}\s+/) && line.length > 3) {
          accumulatedCargo.push(line);
        }
      }
    }
    if (currentEmp && currentEmp.salarioBruto > 0) saveOrConsolidate(currentEmp, accumulatedCargo.join(' '));
  }

  function saveOrConsolidate(emp: Employee, cargoFinal: string) {
    const nome = emp.nome;
    const existing = employeesMap.get(nome);
    if (existing) {
      existing.salarioBruto += emp.salarioBruto;
      existing.desconto += emp.desconto;
      existing.salarioLiquido = existing.salarioBruto - existing.desconto;
    } else {
      emp.cargo = cargoFinal || "NÃO IDENTIFICADO";
      employeesMap.set(nome, emp);
    }
  }

  return Array.from(employeesMap.values())
    .filter(e => e.salarioBruto > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome));
};
