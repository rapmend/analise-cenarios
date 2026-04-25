import type { Cenario, Resultado, Parcela } from '@/types';
import { saldoNoMes } from './saldo';
import { calcVPL, calcTIR } from './financial';

function montarFluxoCaixa(
  c: Cenario,
  valorApurado: number,
  valorInvestido: number,
  irValor: number,
  saldoDevedor: number,
  parcelas: Parcela[],
): number[] {
  const n = Math.max(1, Math.round(c.periodoMeses));
  const cf = new Array<number>(n + 1).fill(0);

  if (c.tipo === 'avista') {
    cf[0] = -valorInvestido;
    cf[n] += valorApurado - irValor;
  } else {
    parcelas.forEach((p) => { if (p.mes <= n) cf[p.mes] -= p.valor; });
    cf[n] += (valorApurado - saldoDevedor) - irValor;
  }

  return cf;
}

export function calcular(c: Cenario, taxaDescontoVPL: number): Resultado {
  const valorizMensal = Math.pow(1 + c.valorizAnual, 1 / 12) - 1;
  const valorFuturo = c.valorImovel * Math.pow(1 + valorizMensal, c.periodoMeses);
  const corretagemValor = valorFuturo * c.corretagem;
  const valorApurado = valorFuturo - corretagemValor;

  if (c.tipo === 'avista') {
    const descontoValor = c.valorImovel * c.taxaDesc;
    const valorInvestido = c.valorImovel - descontoValor;
    const lucroBruto = valorApurado - valorInvestido;
    const irValor = lucroBruto > 0 ? lucroBruto * c.ir : 0;
    const lucroLiquido = lucroBruto - irValor;
    const lucroLiquidoPct = valorInvestido !== 0 ? lucroLiquido / valorInvestido : 0;

    const cf = montarFluxoCaixa(c, valorApurado, valorInvestido, irValor, 0, []);
    return {
      tipo: 'avista',
      valorInvestido,
      valorFuturo,
      valorApurado,
      irValor,
      lucroBruto,
      lucroLiquido,
      lucroLiquidoPct,
      roi: lucroLiquidoPct,
      vpl: calcVPL(cf, taxaDescontoVPL),
      tir: calcTIR(cf),
      parcelas: [],
    };
  }

  // Parcelado
  const n = Math.max(1, Math.round(c.periodoMeses));
  const tObra = Math.max(1, Math.round(c.tempoObra));
  const i = c.taxaIndexador;
  const pEnt = Math.max(0, Math.min(1, c.pctEntrada));
  const pObr = Math.max(0, Math.min(1 - pEnt, c.pctObra));
  const pChv = Math.max(0, 1 - pEnt - pObr);

  const descontoValor = c.valorImovel * c.taxaDesc;
  const totalContrato = c.valorImovel - descontoValor;
  const valorEntrada = totalContrato * pEnt;
  const valorObraTotalPV = totalContrato * pObr;
  const parcelaObraBase = tObra > 0 ? valorObraTotalPV / tObra : 0;

  const parcelas: Parcela[] = [];
  let totalPago = 0;
  let saldo = totalContrato - valorEntrada;

  totalPago += valorEntrada;
  parcelas.push({ mes: 0, valor: valorEntrada, tipo: 'entrada', acumulado: totalPago, saldoApos: saldo });

  let parcObraInicial = 0;
  let parcObraFinal = 0;
  let valorChavesRaw = 0;

  for (let m = 1; m <= tObra; m++) {
    saldo = saldo * (1 + i);
    const valor = parcelaObraBase * Math.pow(1 + i, m - 1);
    saldo -= valor;
    totalPago += valor;
    if (m === 1) parcObraInicial = valor;
    if (m === tObra) parcObraFinal = valor;
    parcelas.push({ mes: m, valor, tipo: 'obra', acumulado: totalPago, saldoApos: saldo });
  }

  valorChavesRaw = saldo;
  if (valorChavesRaw > 0.005) {
    saldo = 0;
    totalPago += valorChavesRaw;
    parcelas.push({ mes: tObra, valor: valorChavesRaw, tipo: 'chaves', acumulado: totalPago, saldoApos: 0 });
  }

  const ctx = { totalContrato, valorEntrada, taxaIndexador: i, tempoObra: tObra };
  let valorPago = 0;
  parcelas.forEach((p) => { if (p.mes <= n) valorPago += p.valor; });
  const saldoDevedor = saldoNoMes(parcelas, n, ctx);

  const valorVendaLiquido = valorApurado - saldoDevedor;
  const lucroBruto = valorVendaLiquido - valorPago;
  const irValor = lucroBruto > 0 ? lucroBruto * c.ir : 0;
  const lucroLiquido = lucroBruto - irValor;
  const lucroLiquidoPct = valorPago !== 0 ? lucroLiquido / valorPago : 0;

  const cf = montarFluxoCaixa(c, valorApurado, valorPago, irValor, saldoDevedor, parcelas);
  return {
    tipo: 'parcelado',
    valorInvestido: valorPago,
    valorFuturo,
    valorApurado,
    irValor,
    lucroBruto,
    lucroLiquido,
    lucroLiquidoPct,
    roi: lucroLiquidoPct,
    vpl: calcVPL(cf, taxaDescontoVPL),
    tir: calcTIR(cf),
    parcelas,
    saldoFinal: saldoDevedor,
    pctChavesView: pChv,
    valorEntrada,
    valorChaves: valorChavesRaw > 0.005 ? valorChavesRaw : 0,
    parcelaObraInicial: parcObraInicial,
    parcelaObraFinal: parcObraFinal,
    totalContrato,
  };
}
