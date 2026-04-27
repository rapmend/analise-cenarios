import { useMemo, useState } from 'react';
import type { Cenario, Resultado } from '@/types';
import { calcular, fmt } from '@/lib/calc';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

interface Props {
  cenarios: Cenario[];
  taxaVPL: number;
}

const ROWS = [
  { label: 'Valor do Imovel',     key: 'valorImovel',     fmt: 'moeda0', source: 'cenario', best: false },
  { label: 'Valorizacao Anual',   key: 'valorizAnual',    fmt: 'pct',    source: 'cenario', best: false },
  { label: 'Capital Aplicado',    key: 'valorInvestido',  fmt: 'moeda0', source: 'resultado', best: false },
  { label: 'Valor Futuro',        key: 'valorFuturo',     fmt: 'moeda0', source: 'resultado', best: false },
  { label: 'Lucro Bruto',         key: 'lucroBruto',      fmt: 'moeda0', source: 'resultado', best: true  },
  { label: 'Lucro Liquido',       key: 'lucroLiquido',    fmt: 'moeda0', source: 'resultado', best: true  },
  { label: 'ROI Total',           key: 'roi',             fmt: 'pct',    source: 'resultado', best: true  },
  { label: 'VPL',                 key: 'vpl',             fmt: 'moeda0', source: 'resultado', best: true  },
  { label: 'TIR (anual)',         key: 'tir',             fmt: 'pct',    source: 'resultado', best: true  },
] as const;

function memoriaLines(c: Cenario, r: Resultado, taxaVPL: number): { label: string; expr: string; result: string }[] {
  const valorizMensal = Math.pow(1 + c.valorizAnual, 1 / 12) - 1;
  const corretagemValor = r.valorFuturo * c.corretagem;
  const lines: { label: string; expr: string; result: string }[] = [
    {
      label: 'Valor Futuro',
      expr: `${fmt(c.valorImovel, 'moeda0')} × (1 + ${fmt(valorizMensal, 'pct')})^${c.periodoMeses}`,
      result: fmt(r.valorFuturo, 'moeda0'),
    },
    {
      label: 'Corretagem na Venda',
      expr: `${fmt(r.valorFuturo, 'moeda0')} × ${fmt(c.corretagem, 'pct')}`,
      result: fmt(corretagemValor, 'moeda0'),
    },
    {
      label: 'Valor Apurado (líq. corretagem)',
      expr: `${fmt(r.valorFuturo, 'moeda0')} − ${fmt(corretagemValor, 'moeda0')}`,
      result: fmt(r.valorApurado, 'moeda0'),
    },
  ];

  if (c.tipo === 'avista' && r.tipo === 'avista') {
    const desconto = c.valorImovel * c.taxaDesc;
    lines.push({
      label: 'Capital Aplicado',
      expr: `${fmt(c.valorImovel, 'moeda0')} − desconto à vista (${fmt(c.taxaDesc, 'pct')}) = ${fmt(c.valorImovel, 'moeda0')} − ${fmt(desconto, 'moeda0')}`,
      result: fmt(r.valorInvestido, 'moeda0'),
    });
    lines.push({
      label: 'Lucro Bruto',
      expr: `Valor Apurado − Capital Aplicado = ${fmt(r.valorApurado, 'moeda0')} − ${fmt(r.valorInvestido, 'moeda0')}`,
      result: fmt(r.lucroBruto, 'moeda0'),
    });
  } else if (c.tipo === 'parcelado' && r.tipo === 'parcelado') {
    lines.push({
      label: 'Capital Aplicado',
      expr: `Entrada (${fmt(r.valorEntrada, 'moeda0')}) + parcelas obra + chaves`,
      result: fmt(r.valorInvestido, 'moeda0'),
    });
    if (r.saldoFinal > 0.005) {
      lines.push({
        label: 'Saldo Devedor no Mês Final',
        expr: 'Restante do contrato indexado, ainda não pago no fim do período',
        result: fmt(r.saldoFinal, 'moeda0'),
      });
    }
    lines.push({
      label: 'Lucro Bruto',
      expr: `Valor Apurado − Saldo Devedor − Capital = ${fmt(r.valorApurado, 'moeda0')} − ${fmt(r.saldoFinal, 'moeda0')} − ${fmt(r.valorInvestido, 'moeda0')}`,
      result: fmt(r.lucroBruto, 'moeda0'),
    });
  }

  lines.push({
    label: `IR sobre Lucro Imobiliário (${fmt(c.ir, 'pct')})`,
    expr: r.lucroBruto > 0 ? `max(0; Lucro Bruto) × ${fmt(c.ir, 'pct')} = ${fmt(r.lucroBruto, 'moeda0')} × ${fmt(c.ir, 'pct')}` : 'Lucro Bruto ≤ 0 — sem IR',
    result: fmt(r.irValor, 'moeda0'),
  });
  lines.push({
    label: 'Lucro Líquido',
    expr: `Lucro Bruto − IR = ${fmt(r.lucroBruto, 'moeda0')} − ${fmt(r.irValor, 'moeda0')}`,
    result: fmt(r.lucroLiquido, 'moeda0'),
  });
  lines.push({
    label: 'ROI Total',
    expr: `Lucro Líquido / Capital Aplicado = ${fmt(r.lucroLiquido, 'moeda0')} / ${fmt(r.valorInvestido, 'moeda0')}`,
    result: fmt(r.roi, 'pct'),
  });
  lines.push({
    label: `VPL (taxa de desconto ${fmt(taxaVPL, 'pct')} a.a.)`,
    expr: 'Soma dos fluxos de caixa descontados a valor presente',
    result: fmt(r.vpl, 'moeda0'),
  });
  lines.push({
    label: 'TIR (anual)',
    expr: 'Taxa anual que torna o VPL dos fluxos igual a zero',
    result: isNaN(r.tir) ? '--' : fmt(r.tir, 'pct'),
  });

  return lines;
}

export default function CompareTab({ cenarios, taxaVPL }: Props) {
  const resultados = useMemo(
    () => cenarios.map((c) => calcular(c, taxaVPL)),
    [cenarios, taxaVPL],
  );
  const [memoriaOpen, setMemoriaOpen] = useState(false);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-akiva-border">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Indicador</th>
            {cenarios.map((c) => (
              <th key={c.id} className="text-right py-3 px-4 text-gray-300 font-medium">
                <div>{c.nome}</div>
                <div className="text-akiva-gold/60 text-xs font-normal mt-0.5">
                  {c.tipo === 'avista' ? 'A Vista' : 'Parcelado'} · {c.periodoMeses}m
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-akiva-border/30">
          {ROWS.map(({ label, key, fmt: fmtTipo, source, best: hasBest }) => {
            const values = resultados.map((r, i) => {
              const c = cenarios[i];
              return source === 'cenario'
                ? (c[key as keyof Cenario] as number)
                : (r[key as keyof typeof r] as number);
            });
            const best = hasBest ? Math.max(...values) : null;
            return (
              <tr key={key} className="hover:bg-akiva-surface/30 transition-colors">
                <td className="py-3 px-4 text-gray-400">{label}</td>
                {values.map((v, i) => {
                  const isBest = best !== null && v === best && values.filter((x) => x === best).length === 1;
                  const formatted = isNaN(v) ? '--' : fmt(v, fmtTipo);
                  return (
                    <td
                      key={cenarios[i].id}
                      className={`py-3 px-4 text-right font-medium ${isBest ? 'text-akiva-gold' : 'text-white'}`}
                    >
                      {formatted}
                      {isBest && <span className="ml-1 text-xs">★</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-gray-600 text-xs px-4 py-3">★ Melhor valor entre os cenarios para esse indicador.</p>

      <div className="border-t border-akiva-border">
        <button
          onClick={() => setMemoriaOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-akiva-surface/50 transition-colors text-left"
        >
          <span className="text-akiva-gold/90 text-sm font-medium">
            Memoria de Calculo
          </span>
          {memoriaOpen
            ? <ChevronUpIcon className="h-4 w-4 text-gray-400" />
            : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
        </button>

        {memoriaOpen && (
          <div className="px-4 pb-5 grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(cenarios.length, 3)}, minmax(0, 1fr))` }}>
            {cenarios.map((c, i) => {
              const r = resultados[i];
              const lines = memoriaLines(c, r, taxaVPL);
              return (
                <div key={c.id} className="bg-akiva-navy border border-akiva-border rounded-lg p-4">
                  <div className="mb-3 pb-2 border-b border-akiva-border/50">
                    <p className="text-white font-medium text-sm">{c.nome}</p>
                    <p className="text-akiva-gold/60 text-xs mt-0.5">
                      {c.tipo === 'avista' ? 'A Vista' : 'Parcelado'} · {c.periodoMeses}m · Valoriz. {fmt(c.valorizAnual, 'pct')} a.a.
                    </p>
                  </div>
                  <div className="space-y-2.5">
                    {lines.map((ln, k) => (
                      <div key={k} className="text-xs">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-gray-400 font-medium">{ln.label}</span>
                          <span className="text-akiva-gold font-semibold whitespace-nowrap">{ln.result}</span>
                        </div>
                        <p className="text-gray-500 text-[10px] mt-0.5 leading-relaxed">{ln.expr}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
