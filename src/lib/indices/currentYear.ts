/**
 * Atualização automática dos índices do ano corrente.
 *
 * INCC-M: buscado da API pública do Banco Central (SGS série 192 — variação % mensal).
 *  - https://api.bcb.gov.br/dados/serie/bcdata.sgs.192/dados?formato=json&dataInicial=...&dataFinal=...
 *  - A API suporta CORS e retorna [{ data: "DD/MM/YYYY", valor: "0.32" }, ...]
 *
 * CUB (SP/MG/Nacional): sem API pública estável — projeção do ano corrente fica indisponível
 *  via auto-update. Pode ser preenchido manualmente em `historical.ts` quando o Sinduscon
 *  publica os valores mensais.
 */

import type { IndiceKey } from './historical';

export interface ProjecaoIndice {
  ano: number;
  /** Variação YTD acumulada (composta). 0.0234 = 2,34% */
  acumulado: number;
  /** Quantidade de meses fechados considerados. */
  mesesFechados: number;
  /** Projeção anualizada: (1 + acumulado)^(12 / mesesFechados) - 1 */
  projecao: number;
}

const SGS_INCC_M = 192;

function pad(n: number) { return n.toString().padStart(2, '0'); }

/**
 * Busca a série INCC-M mensal da API SGS para o ano informado e calcula:
 *  - acumulado YTD (composto)
 *  - projeção anualizada mantendo o ritmo médio do ano
 *
 * Retorna `null` se a API falhar ou não retornar nenhum mês.
 */
export async function fetchInccProjecao(ano: number): Promise<ProjecaoIndice | null> {
  const dataInicial = `01/01/${ano}`;
  const dataFinal = `31/12/${ano}`;
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${SGS_INCC_M}/dados?formato=json&dataInicial=${dataInicial}&dataFinal=${dataFinal}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data: { data: string; valor: string }[] = await res.json();
    if (!data?.length) return null;

    // Acumular composto: (1+r1)*(1+r2)*...*(1+rn) - 1
    const acumulado = data.reduce((prod, item) => {
      const v = parseFloat(item.valor.replace(',', '.')) / 100;
      return prod * (1 + v);
    }, 1) - 1;

    const mesesFechados = data.length;
    // Projetar mantendo o ritmo médio: anualizar
    const projecao = mesesFechados > 0
      ? Math.pow(1 + acumulado, 12 / mesesFechados) - 1
      : 0;

    return { ano, acumulado, mesesFechados, projecao };
  } catch {
    return null;
  }
}

/** Dados projetados do ano corrente por índice. Apenas INCC tem fonte API. */
export interface ProjecaoAnoCorrente {
  ano: number;
  mesesFechados: number;        // do INCC (proxy do ritmo do ano)
  valores: Partial<Record<IndiceKey, { acumulado: number; projecao: number }>>;
  atualizadoEm: string;          // ISO timestamp
}

/**
 * Carrega projeções do ano corrente.
 * - Por ora, só INCC tem fonte automática.
 * - Para CUBs, retorna `undefined` no campo (UI exibe "—" e tooltip).
 */
export async function carregarProjecaoAnoCorrente(ano: number): Promise<ProjecaoAnoCorrente | null> {
  const incc = await fetchInccProjecao(ano);
  if (!incc) return null;
  return {
    ano,
    mesesFechados: incc.mesesFechados,
    valores: {
      incc: { acumulado: incc.acumulado, projecao: incc.projecao },
    },
    atualizadoEm: new Date().toISOString(),
  };
}

/** Formata "atualizadoEm" para exibição. */
export function fmtAtualizado(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
