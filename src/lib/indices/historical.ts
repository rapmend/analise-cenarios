/**
 * Variação anual acumulada (% no ano) dos principais índices da construção civil.
 *
 * Fontes oficiais:
 *  - INCC-M: FGV (Fundação Getulio Vargas)
 *  - CUB-SP: Sinduscon-SP (R8-N — residencial normal padrão)
 *  - CUB-MG: Sinduscon-MG (R8-N)
 *  - CUB Nacional: CBIC (média ponderada dos sindicatos estaduais)
 *
 * Valores são aproximações baseadas nas publicações oficiais e podem ser
 * atualizados ao longo do tempo. Para uso em apresentação ao cliente,
 * recomenda-se verificar os valores com a fonte primária.
 */

export interface IndiceAno {
  ano: number;
  incc: number;       // INCC-M variação anual (decimal: 0.07 = 7%)
  cubSP: number;      // CUB-SP variação anual
  cubMG: number;      // CUB-MG variação anual
  cubNacional: number;// CUB Nacional variação anual
}

export const INDICES_HISTORICOS: IndiceAno[] = [
  { ano: 2001, incc: 0.0881, cubSP: 0.0750, cubMG: 0.0790, cubNacional: 0.0770 },
  { ano: 2002, incc: 0.1286, cubSP: 0.1380, cubMG: 0.1420, cubNacional: 0.1400 },
  { ano: 2003, incc: 0.1378, cubSP: 0.1240, cubMG: 0.1290, cubNacional: 0.1265 },
  { ano: 2004, incc: 0.1345, cubSP: 0.1210, cubMG: 0.1250, cubNacional: 0.1230 },
  { ano: 2005, incc: 0.0684, cubSP: 0.0710, cubMG: 0.0740, cubNacional: 0.0725 },
  { ano: 2006, incc: 0.0505, cubSP: 0.0520, cubMG: 0.0560, cubNacional: 0.0540 },
  { ano: 2007, incc: 0.0615, cubSP: 0.0630, cubMG: 0.0680, cubNacional: 0.0655 },
  { ano: 2008, incc: 0.1187, cubSP: 0.1150, cubMG: 0.1220, cubNacional: 0.1185 },
  { ano: 2009, incc: 0.0325, cubSP: 0.0350, cubMG: 0.0390, cubNacional: 0.0370 },
  { ano: 2010, incc: 0.0777, cubSP: 0.0720, cubMG: 0.0780, cubNacional: 0.0750 },
  { ano: 2011, incc: 0.0749, cubSP: 0.0779, cubMG: 0.0820, cubNacional: 0.0795 },
  { ano: 2012, incc: 0.0713, cubSP: 0.0718, cubMG: 0.0750, cubNacional: 0.0730 },
  { ano: 2013, incc: 0.0809, cubSP: 0.0730, cubMG: 0.0790, cubNacional: 0.0775 },
  { ano: 2014, incc: 0.0683, cubSP: 0.0705, cubMG: 0.0680, cubNacional: 0.0695 },
  { ano: 2015, incc: 0.0750, cubSP: 0.0616, cubMG: 0.0640, cubNacional: 0.0635 },
  { ano: 2016, incc: 0.0634, cubSP: 0.0491, cubMG: 0.0520, cubNacional: 0.0510 },
  { ano: 2017, incc: 0.0403, cubSP: 0.0306, cubMG: 0.0345, cubNacional: 0.0330 },
  { ano: 2018, incc: 0.0397, cubSP: 0.0344, cubMG: 0.0380, cubNacional: 0.0365 },
  { ano: 2019, incc: 0.0403, cubSP: 0.0383, cubMG: 0.0410, cubNacional: 0.0395 },
  { ano: 2020, incc: 0.0881, cubSP: 0.0786, cubMG: 0.0830, cubNacional: 0.0810 },
  { ano: 2021, incc: 0.1383, cubSP: 0.1116, cubMG: 0.1250, cubNacional: 0.1190 },
  { ano: 2022, incc: 0.0946, cubSP: 0.0910, cubMG: 0.0960, cubNacional: 0.0935 },
  { ano: 2023, incc: 0.0431, cubSP: 0.0362, cubMG: 0.0395, cubNacional: 0.0380 },
  { ano: 2024, incc: 0.0599, cubSP: 0.0550, cubMG: 0.0580, cubNacional: 0.0565 },
  { ano: 2025, incc: 0.0420, cubSP: 0.0395, cubMG: 0.0410, cubNacional: 0.0400 },
];

export type IndiceKey = 'incc' | 'cubSP' | 'cubMG' | 'cubNacional';

export interface ResumoIndice {
  media: number;   // média geométrica anual no período
  min: number;     // menor variação anual
  max: number;     // maior variação anual
  anoMin: number;
  anoMax: number;
}

/** Calcula média geométrica anual, mínimo e máximo do período. */
export function resumoIndice(dados: IndiceAno[], key: IndiceKey): ResumoIndice {
  const valores = dados.map((d) => d[key]);
  // média geométrica: ((1+r1)(1+r2)...(1+rn))^(1/n) - 1
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
