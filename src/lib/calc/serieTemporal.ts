import type { Cenario, Resultado, Parcela } from '@/types';
import { saldoNoMes } from './saldo';

export interface PontoSerie {
  mes: number;
  valorImovel: number;
  capitalAplicado: number;
  posicaoLiquida: number;
  patrimonio: number;
  /** Valor bruto compostado da aplicação financeira no mês m (sem IR) */
  valorAplicacao: number;
  /** Lucro bruto da aplicação financeira = valorAplicacao − capitalAplicado (nominal) */
  posicaoFinanceira: number;
}

/**
 * @param _benchmarkIR mantido na assinatura para compatibilidade futura;
 *                     hoje a serie sempre retorna VALOR BRUTO (sem IR).
 *                     A aplicação de IR (regressivo, flat ou isento) ficou
 *                     para uma próxima versão.
 */
export function serieTemporal(
  c: Cenario,
  r: Resultado,
  taxaAplicacaoAnual: number,
  _benchmarkIR: 'regressiva' | number = 'regressiva',
): PontoSerie[] {
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

    // Valor BRUTO compostado da aplicação financeira no mês m
    // (cada pagamento composto da data de desembolso até m). Sem IR — adiado p/ próxima versão.
    let valorAplicacao = 0;
    for (let t = 0; t <= m; t++) {
      if (pagamentoPorMes[t] > 0) {
        valorAplicacao += pagamentoPorMes[t] * Math.pow(1 + rm, m - t);
      }
    }
    // Lucro bruto da aplicação = valor compostado − capital nominal pago
    const posicaoFinanceira = valorAplicacao - capitalAplicado;

    serie.push({ mes: m, valorImovel, capitalAplicado, posicaoLiquida, patrimonio, valorAplicacao, posicaoFinanceira });
  }
  return serie;
}
