import type { Cenario, Resultado, Parcela } from '@/types';
import { saldoNoMes } from './saldo';

export interface PontoSerie {
  mes: number;
  valorImovel: number;
  capitalAplicado: number;
  posicaoLiquida: number;
  patrimonio: number;
  posicaoFinanceira: number;
}

export function serieTemporal(c: Cenario, r: Resultado, taxaAplicacaoAnual: number): PontoSerie[] {
  const n = Math.max(1, Math.round(c.periodoMeses));
  const valorizMensal = Math.pow(1 + c.valorizAnual, 1 / 12) - 1;
  const rm = Math.pow(1 + taxaAplicacaoAnual, 1 / 12) - 1;

  // Acumulado pago por mês
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

  // Pagamentos por mês (para calcular posição financeira composta)
  const pagamentoPorMes = new Array<number>(n + 1).fill(0);
  if (r.tipo === 'avista') {
    pagamentoPorMes[0] = r.valorInvestido;
  } else {
    r.parcelas.forEach((p: Parcela) => {
      if (p.mes <= n) pagamentoPorMes[p.mes] = (pagamentoPorMes[p.mes] ?? 0) + p.valor;
    });
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

    // Posição financeira: cada pagamento feito até o mês m composto à taxa de aplicação
    let posicaoFinanceira = 0;
    for (let t = 0; t <= m; t++) {
      if (pagamentoPorMes[t] > 0) {
        posicaoFinanceira += pagamentoPorMes[t] * Math.pow(1 + rm, m - t);
      }
    }
    // Posição líquida financeira = valor acumulado da aplicação - capital aplicado
    posicaoFinanceira = posicaoFinanceira - capitalAplicado;

    serie.push({ mes: m, valorImovel, capitalAplicado, posicaoLiquida, patrimonio, posicaoFinanceira });
  }
  return serie;
}
