import type { Cenario, Resultado } from '@/types';
import { saldoNoMes } from './saldo';

export interface PontoSerie {
  mes: number;
  valorImovel: number;
  capitalAplicado: number;
  posicaoLiquida: number;
  patrimonio: number;
}

export function serieTemporal(c: Cenario, r: Resultado): PontoSerie[] {
  const n = Math.max(1, Math.round(c.periodoMeses));
  const valorizMensal = Math.pow(1 + c.valorizAnual, 1 / 12) - 1;

  const acumPorMes = new Array<number>(n + 1).fill(0);
  if (r.tipo === 'avista') {
    for (let m = 0; m <= n; m++) acumPorMes[m] = r.valorInvestido;
  } else {
    let acc = 0;
    for (let m = 0; m <= n; m++) {
      r.parcelas.forEach((p) => { if (p.mes === m && p.mes <= n) acc += p.valor; });
      acumPorMes[m] = acc;
    }
  }

  const ctx =
    c.tipo === 'parcelado' && r.tipo === 'parcelado'
      ? {
          totalContrato: r.totalContrato,
          valorEntrada: r.valorEntrada,
          taxaIndexador: c.taxaIndexador,
          tempoObra: Math.max(1, Math.round(c.tempoObra)),
        }
      : null;

  const serie: PontoSerie[] = [];
  for (let m = 0; m <= n; m++) {
    const valorImovel = c.valorImovel * Math.pow(1 + valorizMensal, m);
    const capitalAplicado = acumPorMes[m];
    const corretagem = valorImovel * c.corretagem;
    const parcelas = r.tipo === 'parcelado' ? r.parcelas : [];
    const saldoMes = ctx ? saldoNoMes(parcelas, m, ctx) : 0;
    const valorVenda = valorImovel - corretagem - saldoMes;
    const lucroBruto = valorVenda - capitalAplicado;
    const ir = lucroBruto > 0 ? lucroBruto * c.ir : 0;
    const patrimonio = valorVenda - ir;
    const posicaoLiquida = patrimonio - capitalAplicado;
    serie.push({ mes: m, valorImovel, capitalAplicado, posicaoLiquida, patrimonio });
  }
  return serie;
}
