/**
 * Índice FipeZap Residencial — Venda
 *
 * Fonte: FIPE / Grupo OLX (https://www.fipe.org.br/pt-br/indices/fipezap/)
 *
 * Variação anual acumulada (% no ano) do índice de preços de venda de imóveis
 * residenciais. O Composto é a média ponderada de 50+ cidades acompanhadas pelo
 * índice; as colunas individuais mostram capitais selecionadas.
 *
 * Valores são aproximações baseadas nas publicações mensais da FIPE. Não há
 * API pública estável para atualização automática — quando o sindicato publica
 * novos dados, atualize este arquivo manualmente.
 */

export interface FipeZapAno {
  ano: number;
  composto: number;  // FipeZap Composto (50+ cidades)
  sp: number;        // São Paulo
  rj: number;        // Rio de Janeiro
  bh: number;        // Belo Horizonte
  bsb: number;       // Brasília
  cwb: number;       // Curitiba
}

export const FIPEZAP_HISTORICO: FipeZapAno[] = [
  { ano: 2011, composto: 0.2602, sp: 0.2236, rj: 0.2618, bh: 0.2080, bsb: 0.1620, cwb: 0.1310 },
  { ano: 2012, composto: 0.1372, sp: 0.1412, rj: 0.1503, bh: 0.1180, bsb: 0.0640, cwb: 0.1290 },
  { ano: 2013, composto: 0.1225, sp: 0.1240, rj: 0.0747, bh: 0.1620, bsb: 0.0420, cwb: 0.1180 },
  { ano: 2014, composto: 0.0680, sp: 0.0501, rj: 0.0317, bh: 0.0890, bsb: 0.0210, cwb: 0.0930 },
  { ano: 2015, composto: 0.0163, sp: 0.0341, rj: 0.0045, bh: 0.0230, bsb: -0.0120, cwb: 0.0410 },
  { ano: 2016, composto: 0.0010, sp: 0.0080, rj: -0.0320, bh: 0.0050, bsb: -0.0240, cwb: 0.0260 },
  { ano: 2017, composto: -0.0053, sp: -0.0010, rj: -0.0398, bh: -0.0080, bsb: -0.0310, cwb: 0.0080 },
  { ano: 2018, composto: 0.0024, sp: 0.0185, rj: -0.0123, bh: 0.0030, bsb: -0.0140, cwb: 0.0190 },
  { ano: 2019, composto: 0.0202, sp: 0.0312, rj: 0.0067, bh: 0.0210, bsb: 0.0090, cwb: 0.0250 },
  { ano: 2020, composto: 0.0432, sp: 0.0451, rj: 0.0245, bh: 0.0490, bsb: 0.0310, cwb: 0.0520 },
  { ano: 2021, composto: 0.0539, sp: 0.0520, rj: 0.0305, bh: 0.0710, bsb: 0.0890, cwb: 0.1180 },
  { ano: 2022, composto: 0.0671, sp: 0.0782, rj: 0.0654, bh: 0.0805, bsb: 0.0950, cwb: 0.1340 },
  { ano: 2023, composto: 0.0552, sp: 0.0651, rj: 0.0702, bh: 0.0610, bsb: 0.0410, cwb: 0.0820 },
  { ano: 2024, composto: 0.0790, sp: 0.0786, rj: 0.0850, bh: 0.0720, bsb: 0.0510, cwb: 0.0680 },
  { ano: 2025, composto: 0.0610, sp: 0.0598, rj: 0.0650, bh: 0.0590, bsb: 0.0420, cwb: 0.0550 },
];

export type FipeZapKey = 'composto' | 'sp' | 'rj' | 'bh' | 'bsb' | 'cwb';

export interface ResumoFipeZap {
  media: number;
  min: number;
  max: number;
  anoMin: number;
  anoMax: number;
}

/** Calcula média geométrica anual, mínimo e máximo do período. */
export function resumoFipeZap(dados: FipeZapAno[], key: FipeZapKey): ResumoFipeZap {
  const valores = dados.map((d) => d[key]);
  const produto = valores.reduce((acc, v) => acc * (1 + v), 1);
  const media = Math.pow(produto, 1 / valores.length) - 1;
  let min = Infinity, max = -Infinity, anoMin = 0, anoMax = 0;
  dados.forEach((d) => {
    const v = d[key];
    if (v < min) { min = v; anoMin = d.ano; }
    if (v > max) { max = v; anoMax = d.ano; }
  });
  return { media, min, max, anoMin, anoMax };
}
