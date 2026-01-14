
export interface Employee {
  matricula: string;
  nome: string;
  cargo: string;
  vinculo: string;
  salarioBruto: number;
  desconto: number;
  salarioLiquido: number;
}

export interface PayrollStats {
  totalEmployees: number;
  totalGrossPayroll: number;
  totalDiscounts: number;
  totalNetPayroll: number;
}
