import type { Cenario } from './cenario';

export interface Estudo {
  id: string;
  clienteId: string;
  nome: string;
  dataEmissao: string;
  taxaDescontoVPL: number;
  cenarios: Cenario[];
  criadoEm: string;
  atualizadoEm: string;
}
