import type { Cenario } from './cenario';

export type BenchmarkTipo = 'rendaFixa' | 'outro';

export interface BenchmarkConfig {
  /** Nome exibido nos gráficos e labels (ex: "CDB", "CDI", "Tesouro IPCA+") */
  nome: string;
  /** rendaFixa = IR regressivo (22,5% → 15%); outro = alíquota fixa informada pelo usuário */
  tipo: BenchmarkTipo;
  /** Alíquota flat (0–1) usada quando tipo='outro'. Ignorada para rendaFixa. */
  aliquotaIR: number;
}

export const BENCHMARK_DEFAULT: BenchmarkConfig = {
  nome: 'Aplicacao Financeira',
  tipo: 'rendaFixa',
  aliquotaIR: 0.15,
};

export interface Estudo {
  id: string;
  clienteId: string;
  nome: string;
  dataEmissao: string;
  taxaDescontoVPL: number;
  benchmark: BenchmarkConfig;
  cenarios: Cenario[];
  criadoEm: string;
  atualizadoEm: string;
}
