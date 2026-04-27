import type { Cenario, Resultado, Parcela } from '@/types';
import { saldoNoMes } from './saldo';

export interface PontoSerie {
  mes: number;
  valorImovel: number;
  capitalAplicado: number;
  posicaoLiquida: number;
  patrimonio: number;
  /** Valor da aplicação no mês m: BRUTO durante a operação, LÍQUIDO (pós-IR) no mês final */
  valorAplicacao: number;
  /** Resultado da aplicação = valorAplicacao − capitalAplicado (nominal) */
  posicaoFinanceira: number;
}

/**
 * Alíquota de IR regressivo de renda fixa conforme prazo da tranche (em meses).
 * Até 6m: 22,5% · 7-12m: 20% · 13-24m: 17,5% · acima de 24m: 15%.
 * IR só incide sobre o LUCRO (ganho) da tranche.
 */
function irRF(prazoMeses: number): number {
  if (prazoMeses <= 6) return 0.225;
  if (prazoMeses <= 12) return 0.200;
  if (prazoMeses <= 24) return 0.175;
  return 0.150;
}

/**
 * @param benchmarkIR 'regressiva' = tabela regressiva de renda fixa;
 *                    number = alíquota fixa (0–1; use 0 para isento).
 *                    IR é aplicado APENAS no mês final da operação (m === n),
 *                    refletindo o resgate real — durante a operação o valor é bruto.
 */
export function serieTemporal(
  c: Cenario,
  r: Resultado,
  taxaAplicacaoAnual: number,
  benchmarkIR: 'regressiva' | number = 'regressiva',
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

    // Valor da aplicação financeira no mês m.
    // Durante a operação (m < n): BRUTO compostado.
    // No mês final (m === n): IR aplicado por tranche (regressivo ou flat) sobre o LUCRO.
    const isFinal = m === n;
    let valorAplicacao = 0;
    for (let t = 0; t <= m; t++) {
      if (pagamentoPorMes[t] > 0) {
        const prazo = m - t;
        const grosso = pagamentoPorMes[t] * Math.pow(1 + rm, prazo);
        if (isFinal) {
          const ganho = grosso - pagamentoPorMes[t];
          const aliq = benchmarkIR === 'regressiva' ? irRF(prazo) : benchmarkIR;
          const irTranche = ganho > 0 ? ganho * aliq : 0;
          valorAplicacao += grosso - irTranche;
        } else {
          valorAplicacao += grosso;
        }
      }
    }
    const posicaoFinanceira = valorAplicacao - capitalAplicado;

    serie.push({ mes: m, valorImovel, capitalAplicado, posicaoLiquida, patrimonio, valorAplicacao, posicaoFinanceira });
  }
  return serie;
}
