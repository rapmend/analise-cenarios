export type Indexador = 'INCC' | 'IGP-M' | 'IPCA' | 'CUB' | 'Personalizado';

interface CenarioBase {
  id: string;
  nome: string;
  tipo: 'avista' | 'parcelado';
  valorImovel: number;
  valorizAnual: number;
  periodoMeses: number;
  corretagem: number;
  ir: number;
  taxaDesc: number;
}

export interface CenarioAvista extends CenarioBase {
  tipo: 'avista';
}

export interface CenarioParcelado extends CenarioBase {
  tipo: 'parcelado';
  indexador: Indexador;
  taxaIndexador: number;
  tempoObra: number;
  pctEntrada: number;
  pctObra: number;
}

export type Cenario = CenarioAvista | CenarioParcelado;

export interface Parcela {
  mes: number;
  valor: number;
  tipo: 'entrada' | 'obra' | 'chaves';
  saldoApos: number;
  acumulado: number;
}

interface ResultadoBase {
  tipo: 'avista' | 'parcelado';
  valorInvestido: number;
  valorFuturo: number;
  valorApurado: number;
  irValor: number;
  lucroBruto: number;
  lucroLiquido: number;
  lucroLiquidoPct: number;
  roi: number;
  vpl: number;
  tir: number;
}

export interface ResultadoAvista extends ResultadoBase {
  tipo: 'avista';
  parcelas: [];
}

export interface ResultadoParcelado extends ResultadoBase {
  tipo: 'parcelado';
  parcelas: Parcela[];
  saldoFinal: number;
  pctChavesView: number;
  valorEntrada: number;
  valorChaves: number;
  parcelaObraInicial: number;
  parcelaObraFinal: number;
  totalContrato: number;
}

export type Resultado = ResultadoAvista | ResultadoParcelado;
