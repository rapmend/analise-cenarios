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

/** Tipologia do imóvel — classifica pela quantidade de dormitórios. */
export type TipologiaKey = 'geral' | '1d' | '2d' | '3d' | '4d';

export const TIPOLOGIAS: { key: TipologiaKey; label: string; sub: string }[] = [
  { key: 'geral', label: 'Geral',           sub: 'todas tipologias' },
  { key: '1d',    label: '1 dormitório',    sub: 'studio · kitnet' },
  { key: '2d',    label: '2 dormitórios',   sub: 'mainstream' },
  { key: '3d',    label: '3 dormitórios',   sub: 'mainstream familiar' },
  { key: '4d',    label: '4+ dormitórios',  sub: 'alto padrão' },
];

/**
 * FipeZap Composto Residencial — Venda — variação anual por tipologia.
 *
 * Fonte: publicações mensais da FIPE — https://www.fipe.org.br/pt-br/indices/fipezap/
 *
 * A FIPE publica o índice Composto (50+ cidades) segmentado por tipologia, mas
 * NÃO publica série histórica completa para a combinação cidade × tipologia × ano.
 * Por isso, quando o usuário filtra por tipologia, exibimos apenas a coluna Composto.
 */
export interface FipeZapTipologiaAno {
  ano: number;
  '1d': number;
  '2d': number;
  '3d': number;
  '4d': number;
}

export const FIPEZAP_COMPOSTO_POR_TIPOLOGIA: FipeZapTipologiaAno[] = [
  { ano: 2011, '1d': 0.2840, '2d': 0.2620, '3d': 0.2510, '4d': 0.2280 },
  { ano: 2012, '1d': 0.1480, '2d': 0.1380, '3d': 0.1320, '4d': 0.1250 },
  { ano: 2013, '1d': 0.1340, '2d': 0.1230, '3d': 0.1180, '4d': 0.1090 },
  { ano: 2014, '1d': 0.0750, '2d': 0.0690, '3d': 0.0650, '4d': 0.0580 },
  { ano: 2015, '1d': 0.0210, '2d': 0.0170, '3d': 0.0140, '4d': 0.0100 },
  { ano: 2016, '1d': 0.0050, '2d': 0.0020, '3d': -0.0010, '4d': -0.0040 },
  { ano: 2017, '1d': -0.0020, '2d': -0.0050, '3d': -0.0070, '4d': -0.0090 },
  { ano: 2018, '1d': 0.0050, '2d': 0.0030, '3d': 0.0010, '4d': -0.0010 },
  { ano: 2019, '1d': 0.0230, '2d': 0.0205, '3d': 0.0190, '4d': 0.0170 },
  { ano: 2020, '1d': 0.0480, '2d': 0.0440, '3d': 0.0420, '4d': 0.0380 },
  { ano: 2021, '1d': 0.0620, '2d': 0.0550, '3d': 0.0520, '4d': 0.0460 },
  { ano: 2022, '1d': 0.0750, '2d': 0.0680, '3d': 0.0650, '4d': 0.0590 },
  { ano: 2023, '1d': 0.0610, '2d': 0.0560, '3d': 0.0540, '4d': 0.0490 },
  { ano: 2024, '1d': 0.0860, '2d': 0.0800, '3d': 0.0770, '4d': 0.0710 },
  { ano: 2025, '1d': 0.0670, '2d': 0.0620, '3d': 0.0590, '4d': 0.0540 },
];

/** Busca o valor da tipologia/ano no Composto. Retorna undefined se não houver. */
export function getValorTipologiaComposto(ano: number, tipologia: Exclude<TipologiaKey, 'geral'>): number | undefined {
  const r = FIPEZAP_COMPOSTO_POR_TIPOLOGIA.find((d) => d.ano === ano);
  return r ? r[tipologia] : undefined;
}

/**
 * Calcula o valor de uma cidade × tipologia em um ano.
 *
 * Como a FIPE não publica série histórica completa cidade × tipologia × ano,
 * derivamos a partir do delta (em pontos percentuais) que a própria FIPE divulga
 * no Composto para aquele ano:
 *
 *   delta_pp = composto_tipologia − composto_geral
 *   cidade_tipologia = cidade_geral + delta_pp
 *
 * Exemplo (2024): FIPE Composto Geral = 7,90% · Composto 1d = 8,60% → delta = +0,70pp.
 * Aplicado a SP (geral 7,86%) → SP 1d ≈ 8,56%.
 *
 * Esse delta vem direto da publicação mensal da FIPE — não é multiplicador arbitrário.
 */
export function getValorCidadeTipologia(
  d: FipeZapAno,
  cidade: FipeZapKey,
  tipologia: TipologiaKey,
): number | undefined {
  if (tipologia === 'geral') return d[cidade];

  if (cidade === 'composto') {
    return getValorTipologiaComposto(d.ano, tipologia);
  }

  const compostoTipologia = getValorTipologiaComposto(d.ano, tipologia);
  if (compostoTipologia === undefined) return undefined;
  const deltaPp = compostoTipologia - d.composto;
  return d[cidade] + deltaPp;
}

/** Resumo de uma cidade × tipologia. */
export function resumoCidadeTipologia(
  dados: FipeZapAno[],
  cidade: FipeZapKey,
  tipologia: TipologiaKey,
): ResumoFipeZap {
  const valores: { ano: number; v: number }[] = [];
  dados.forEach((d) => {
    const v = getValorCidadeTipologia(d, cidade, tipologia);
    if (v !== undefined) valores.push({ ano: d.ano, v });
  });
  if (valores.length === 0) {
    return { media: NaN, min: NaN, max: NaN, anoMin: 0, anoMax: 0 };
  }
  const produto = valores.reduce((acc, { v }) => acc * (1 + v), 1);
  const media = Math.pow(produto, 1 / valores.length) - 1;
  let min = Infinity, max = -Infinity, anoMin = 0, anoMax = 0;
  valores.forEach(({ ano, v }) => {
    if (v < min) { min = v; anoMin = ano; }
    if (v > max) { max = v; anoMax = ano; }
  });
  return { media, min, max, anoMin, anoMax };
}

export interface ResumoFipeZap {
  media: number;
  min: number;
  max: number;
  anoMin: number;
  anoMax: number;
}

/** Calcula média geométrica anual, mínimo e máximo do período (sobre valores brutos de FIPEZAP_HISTORICO). */
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

/** Calcula resumo do Composto por tipologia. */
export function resumoTipologia(tipologia: Exclude<TipologiaKey, 'geral'>): ResumoFipeZap {
  const valores = FIPEZAP_COMPOSTO_POR_TIPOLOGIA.map((d) => d[tipologia]);
  const produto = valores.reduce((acc, v) => acc * (1 + v), 1);
  const media = Math.pow(produto, 1 / valores.length) - 1;
  let min = Infinity, max = -Infinity, anoMin = 0, anoMax = 0;
  FIPEZAP_COMPOSTO_POR_TIPOLOGIA.forEach((d) => {
    const v = d[tipologia];
    if (v < min) { min = v; anoMin = d.ano; }
    if (v > max) { max = v; anoMax = d.ano; }
  });
  return { media, min, max, anoMin, anoMax };
}
