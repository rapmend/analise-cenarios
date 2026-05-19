import { useMemo } from 'react';
import { fmt } from '@/lib/calc';
import { FIPEZAP_HISTORICO, resumoFipeZap, type FipeZapKey } from '@/lib/indices/fipezap';

const COLS: { key: FipeZapKey; label: string; sub: string }[] = [
  { key: 'composto', label: 'Composto',         sub: '50+ cidades' },
  { key: 'sp',       label: 'São Paulo',        sub: 'SP' },
  { key: 'rj',       label: 'Rio de Janeiro',   sub: 'RJ' },
  { key: 'bh',       label: 'Belo Horizonte',   sub: 'MG' },
  { key: 'bsb',      label: 'Brasília',         sub: 'DF' },
  { key: 'cwb',      label: 'Curitiba',         sub: 'PR' },
];

export default function FipeZapTab() {
  const anoCorrente = new Date().getFullYear();
  const dados = useMemo(
    () => FIPEZAP_HISTORICO.filter((d) => d.ano < anoCorrente),
    [anoCorrente],
  );

  const resumos = useMemo(
    () => COLS.map((c) => ({ key: c.key, ...resumoFipeZap(dados, c.key) })),
    [dados],
  );

  // Maior valor de cada ano (entre capitais — excluindo Composto)
  const maxPorAno = useMemo(
    () => dados.map((d) => Math.max(d.sp, d.rj, d.bh, d.bsb, d.cwb)),
    [dados],
  );

  const anoIni = dados[0]?.ano ?? anoCorrente;
  const anoFim = dados[dados.length - 1]?.ano ?? anoCorrente;

  return (
    <div className="bg-akiva-surface border border-akiva-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-akiva-border flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-akiva-gold font-serif text-lg">
            FipeZap Residencial — Venda — {anoIni} a {anoFim}
          </h2>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-2xl">
            Variação anual acumulada do preço de venda de imóveis residenciais. Use como
            referência regional para calibrar a premissa de valorização do imóvel.
            O <strong className="text-akiva-gold/80">Composto</strong> é a média ponderada
            de 50+ cidades; as demais colunas mostram capitais selecionadas.
          </p>
        </div>
        <a
          href="https://www.fipe.org.br/pt-br/indices/fipezap/#indice-mensal"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 border border-akiva-gold/40 text-akiva-gold hover:bg-akiva-gold/10 transition-colors text-xs rounded whitespace-nowrap"
        >
          Ver na FIPE ↗
        </a>
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
                  // Não destacar a coluna Composto (média) — destaca só capital líder
                  const isMax = c.key !== 'composto' && v === maxPorAno[i];
                  const isNegative = v < 0;
                  return (
                    <td
                      key={c.key}
                      className={`py-2.5 px-4 text-center font-medium tabular-nums ${
                        isMax ? 'text-akiva-gold' : isNegative ? 'text-red-400/80' : 'text-white'
                      }`}
                    >
                      {fmt(v, 'pct')}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* Linha do ano corrente — sem dados auto-atualizados */}
            <tr className="bg-akiva-gold/5 border-t-2 border-akiva-gold/30">
              <td className="py-2.5 px-4 font-medium tabular-nums">
                <div className="text-akiva-gold">{anoCorrente}</div>
                <div className="text-akiva-gold/60 text-[10px] font-normal uppercase tracking-wider">
                  Em curso · manual
                </div>
              </td>
              {COLS.map((c) => (
                <td key={c.key} className="py-2.5 px-4 text-center text-gray-500 tabular-nums">
                  —
                </td>
              ))}
            </tr>
          </tbody>
          <tfoot className="border-t-2 border-akiva-border">
            <tr className="bg-akiva-navy/40">
              <td className="py-2.5 px-4 text-gray-300 font-semibold text-xs uppercase tracking-wider">
                Média anual
                <span className="block text-gray-600 text-[10px] font-normal normal-case tracking-normal">
                  geométrica · {anoIni}–{anoFim}
                </span>
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
                <td key={r.key} className="py-2.5 px-4 text-center tabular-nums">
                  <span className={r.min < 0 ? 'text-red-400/80' : 'text-gray-300'}>
                    {fmt(r.min, 'pct')}
                  </span>
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
          <span className="text-akiva-gold/80">★</span> Em destaque a capital com maior variação no ano (Composto excluído).
          Valores negativos em <span className="text-red-400/80">vermelho</span>.
          Fonte: <strong className="text-gray-400">FIPE / Grupo OLX</strong> — Índice FipeZap de Preços de Imóveis Anunciados.
        </p>
        <p className="mt-1">
          A FIPE não disponibiliza API pública estável — para atualizar valores, edite
          <code className="text-akiva-gold/70 mx-1">src/lib/indices/fipezap.ts</code> consultando a
          publicação mensal em <a href="https://www.fipe.org.br/pt-br/indices/fipezap/" target="_blank" rel="noopener noreferrer" className="text-akiva-gold/80 hover:underline">fipe.org.br/indices/fipezap</a>.
          A média anual usa cálculo geométrico, considerando apenas anos fechados.
        </p>
      </div>
    </div>
  );
}
