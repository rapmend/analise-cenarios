import { useMemo } from 'react';
import { fmt } from '@/lib/calc';
import { INDICES_HISTORICOS, resumoIndice, type IndiceKey } from '@/lib/indices/historical';

const COLS: { key: IndiceKey; label: string; sub: string }[] = [
  { key: 'incc',        label: 'INCC-M',       sub: 'FGV' },
  { key: 'cubSP',       label: 'CUB-SP',       sub: 'Sinduscon-SP' },
  { key: 'cubMG',       label: 'CUB-MG',       sub: 'Sinduscon-MG' },
  { key: 'cubNacional', label: 'CUB Nacional', sub: 'CBIC' },
];

export default function IndicesTab() {
  const dados = INDICES_HISTORICOS;

  // Resumos (média geométrica, mín, máx)
  const resumos = useMemo(
    () => COLS.map((c) => ({ key: c.key, ...resumoIndice(dados, c.key) })),
    [dados],
  );

  // Maior valor de cada ano (para destacar)
  const maxPorAno = useMemo(
    () => dados.map((d) => Math.max(d.incc, d.cubSP, d.cubMG, d.cubNacional)),
    [dados],
  );

  const anoIni = dados[0].ano;
  const anoFim = dados[dados.length - 1].ano;

  return (
    <div className="bg-akiva-surface border border-akiva-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-akiva-border">
        <h2 className="text-akiva-gold font-serif text-lg">
          Índices da Construção Civil — {anoIni} a {anoFim}
        </h2>
        <p className="text-gray-500 text-xs mt-1 leading-relaxed">
          Variação anual acumulada (% no ano). Use como referência para projetar
          valorização do imóvel ou taxa de indexador em contratos de obra.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-akiva-border">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Ano</th>
              {COLS.map((c) => (
                <th key={c.key} className="text-center py-3 px-4 text-gray-300 font-medium align-bottom">
                  <div className="leading-tight">{c.label}</div>
                  <div className="text-akiva-gold/60 text-[10px] font-normal mt-0.5">{c.sub}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-akiva-border/30">
            {dados.map((d, i) => (
              <tr key={d.ano} className="hover:bg-akiva-navy/30 transition-colors">
                <td className="py-2.5 px-4 text-gray-400 font-medium tabular-nums">{d.ano}</td>
                {COLS.map((c) => {
                  const v = d[c.key];
                  const isMax = v === maxPorAno[i];
                  return (
                    <td
                      key={c.key}
                      className={`py-2.5 px-4 text-center font-medium tabular-nums ${isMax ? 'text-akiva-gold' : 'text-white'}`}
                    >
                      {fmt(v, 'pct')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-akiva-border">
            <tr className="bg-akiva-navy/40">
              <td className="py-2.5 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wider">
                Média anual
                <span className="block text-gray-600 text-[10px] font-normal normal-case tracking-normal">geométrica</span>
              </td>
              {resumos.map((r) => (
                <td key={r.key} className="py-2.5 px-4 text-center text-akiva-gold font-semibold tabular-nums">
                  {fmt(r.media, 'pct')}
                </td>
              ))}
            </tr>
            <tr className="bg-akiva-navy/20">
              <td className="py-2.5 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wider">Mínimo</td>
              {resumos.map((r) => (
                <td key={r.key} className="py-2.5 px-4 text-center text-gray-300 tabular-nums">
                  {fmt(r.min, 'pct')}
                  <span className="block text-gray-600 text-[10px] font-normal">{r.anoMin}</span>
                </td>
              ))}
            </tr>
            <tr className="bg-akiva-navy/20">
              <td className="py-2.5 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wider">Máximo</td>
              {resumos.map((r) => (
                <td key={r.key} className="py-2.5 px-4 text-center text-gray-300 tabular-nums">
                  {fmt(r.max, 'pct')}
                  <span className="block text-gray-600 text-[10px] font-normal">{r.anoMax}</span>
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="px-4 py-3 border-t border-akiva-border text-gray-500 text-[11px] leading-relaxed">
        <p>
          <span className="text-akiva-gold/80">★</span> Em destaque o maior índice de cada ano.
          Fontes: <strong className="text-gray-400">FGV</strong> (INCC-M),
          <strong className="text-gray-400"> Sinduscon-SP</strong> (CUB-SP, R8-N),
          <strong className="text-gray-400"> Sinduscon-MG</strong> (CUB-MG, R8-N),
          <strong className="text-gray-400"> CBIC</strong> (CUB Nacional).
        </p>
        <p className="mt-1">
          Valores baseados em publicações oficiais — verificar com a fonte primária antes
          de uso em apresentação ao cliente. A média anual usa cálculo geométrico, que reflete
          o efeito composto da inflação setorial ao longo do período.
        </p>
      </div>
    </div>
  );
}
