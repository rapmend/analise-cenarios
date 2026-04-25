import { nanoid } from 'nanoid';
import type { Cenario, CenarioAvista, CenarioParcelado } from '@/types';

export const DEFAULT_TAXA_VPL = 0.10;

const COMUM = {
  valorImovel: 550000,
  valorizAnual: 0.12,
  periodoMeses: 24,
  corretagem: 0.05,
  ir: 0.15,
};

export const CENARIOS_INICIAIS: Cenario[] = [
  {
    ...COMUM,
    id: nanoid(),
    nome: 'À Vista Moderado',
    tipo: 'avista',
    taxaDesc: 0.135,
  } satisfies CenarioAvista,
  {
    ...COMUM,
    periodoMeses: 36,
    id: nanoid(),
    nome: 'Parcelado Moderado',
    tipo: 'parcelado',
    taxaDesc: 0.08,
    indexador: 'INCC',
    taxaIndexador: 0.005,
    tempoObra: 24,
    pctEntrada: 0.20,
    pctObra: 0.40,
  } satisfies CenarioParcelado,
  {
    ...COMUM,
    id: nanoid(),
    nome: 'À Vista Otimista',
    tipo: 'avista',
    taxaDesc: 0.135,
    valorizAnual: 0.18,
  } satisfies CenarioAvista,
];

export const GLOSSARIO = {
  investido: {
    titulo: 'Capital Aplicado',
    txt: 'Soma do desembolso real efetuado para adquirir o imóvel. No à vista é o valor pago à vista (após desconto). No parcelado é a soma das parcelas efetivamente pagas até o momento da venda.',
  },
  valorFuturo: {
    titulo: 'Valor Futuro do Imóvel',
    txt: 'Estimativa de quanto o imóvel valerá ao final do período de operação, considerando a valorização anual aplicada mês a mês de forma composta.',
  },
  lucroLiquido: {
    titulo: 'Lucro Líquido',
    txt: 'Resultado final da operação após descontar do valor de venda: a corretagem, o saldo devedor (se a venda ocorrer antes das chaves), o capital aplicado e o IR sobre o ganho.',
  },
  roi: {
    titulo: 'ROI · Retorno sobre o Investimento',
    txt: 'Percentual de lucro em relação ao capital efetivamente aplicado durante todo o período. Mede quanto o capital rendeu no total, sem anualizar.',
  },
  vpl: {
    titulo: 'VPL · Valor Presente Líquido',
    txt: 'Soma de todos os fluxos de caixa (entradas e saídas) trazidos a valor presente pela taxa de desconto definida. VPL > 0 significa que o investimento gera mais valor do que a taxa exigida.',
  },
  tir: {
    titulo: 'TIR · Taxa Interna de Retorno',
    txt: 'Taxa anual que faria o VPL ser igual a zero — ou seja, o rendimento equivalente do investimento ao ano. Se a TIR for maior que a taxa de desconto, o investimento supera a expectativa mínima de retorno.',
  },
} as const;

export type GlossarioKey = keyof typeof GLOSSARIO;
