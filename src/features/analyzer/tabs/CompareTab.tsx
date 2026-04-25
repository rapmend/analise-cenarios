import { useMemo } from 'react';
import type { Cenario } from '@/types';
import { calcular, fmt } from '@/lib/calc';

interface Props {
  cenarios: Cenario[];
  taxaVPL: number;
}

const ROWS = [
  { label: 'Capital Aplicado', key: 'valorInvestido', fmt: 'moeda0' },
  { label: 'Valor Futuro', key: 'valorFuturo', fmt: 'moeda0' },
  { label: 'Lucro Bruto', key: 'lucroBruto', fmt: 'moeda0' },
  { label: 'Lucro Liquido', key: 'lucroLiquido', fmt: 'moeda0' },
  { label: 'ROI Total', key: 'roi', fmt: 'pct' },
  { label: 'VPL', key: 'vpl', fmt: 'moeda0' },
  { label: 'TIR (anual)', key: 'tir', fmt: 'pct' },
] as const;

export default function CompareTab({ cenarios, taxaVPL }: Props) {
  const resultados = useMemo(
    () => cenarios.map((c) => calcular(c, taxaVPL)),
    [cenarios, taxaVPL],
  );

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
          {ROWS.map(({ label, key, fmt: fmtTipo }) => {
            const values = resultados.map((r) => {
              const v = r[key as keyof typeof r] as number;
              return v;
            });
            const best = key === 'vpl' || key === 'roi' || key === 'tir' || key === 'lucroLiquido' || key === 'lucroBruto'
              ? Math.max(...values)
              : null;

            return (
              <tr key={key} className="hover:bg-akiva-surface/30 transition-colors">
                <td className="py-3 px-4 text-gray-400">{label}</td>
                {resultados.map((r, i) => {
                  const v = r[key as keyof typeof r] as number;
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
    </div>
  );
}
