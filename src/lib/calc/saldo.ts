import type { Parcela } from '@/types';

interface SaldoCtx {
  totalContrato: number;
  valorEntrada: number;
  taxaIndexador: number;
  tempoObra: number;
}

export function saldoNoMes(parcelas: Parcela[], mes: number, ctx: SaldoCtx): number {
  const { totalContrato, valorEntrada, taxaIndexador: i, tempoObra: tObra } = ctx;
  let s = totalContrato - valorEntrada;
  if (mes <= 0) return s;

  let last = 0;
  for (const p of parcelas) {
    if (p.mes > 0 && p.mes <= mes) {
      s = p.saldoApos;
      last = p.mes;
    }
  }
  if (mes > last && mes <= tObra) {
    s = s * Math.pow(1 + i, mes - last);
  }
  return Math.max(0, s);
}
