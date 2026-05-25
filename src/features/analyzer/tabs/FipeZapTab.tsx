import { useMemo, useState } from 'react';
import { fmt } from '@/lib/calc';
import {
  FIPEZAP_HISTORICO,
  resumoFipeZap,
  resumoCidadeTipologia,
  getValorCidadeTipologia,
  TIPOLOGIAS,
  type FipeZapKey,
  type TipologiaKey,
} from '@/lib/indices/fipezap';

const COLS: { key: FipeZapKey; label: string; sub: string }[] = [
  { key: 'composto', label: 'Composto',         sub: '50+ cidades' },
  { key: 'sp',       label: 'São Paulo',        sub: 'SP' },
  { key: 'rj',       label: 'Rio de Janeiro',   sub: 'RJ' },
  { key: 'bh',       label: 'Belo Horizonte',   sub: 'MG' },
  { key: 'bsb',      label: 'Brasília',         sub: 'DF' },
  { key: 'cwb',      label: 'Curitiba',         sub: 'PR' },
  { key: 'vix',      label: 'Vitória',          sub: 'ES' },
];

export default function FipeZapTab() {
  const anoCorrente = new Date().getFullYear();
  const [tipologia, setTipologia] = useState<TipologiaKey>('geral');
  const [cidadesSel, setCidadesSel] = useState<Set<FipeZapKey>>(
    () => new Set(COLS.map((c) => c.key)),
  );

  const toggleCidade = (key: FipeZapKey) => {
    setCidadesSel((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size <= 1) return prev; // mantém ao menos uma coluna
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const colsVisiveis = useMemo(
    () => COLS.filter((c) => cidadesSel.has(c.key)),
    [cidadesSel],
  );

  const dados = useMemo(
    () => FIPEZAP_HISTORICO.filter((d) => d.ano < anoCorrente),
    [anoCorrente],
  );

  const resumos = useMemo(
    () => colsVisiveis.map((c) => {
      if (tipologia !== 'geral') {
        return { key: c.key, ...resumoCidadeTipologia(dados, c.key, tipologia) };
      }
      return { key: c.key, ...resumoFipeZap(dados, c.key) };
    }),
    [dados, tipologia, colsVisiveis],
  );

  // Maior valor de cada ano (entre capitais visíveis — excluindo Composto)
  const maxPorAno = useMemo(
    () => dados.map((d) => {
      const vs = colsVisiveis
        .filter((c) => c.key !== 'composto')
        .map((c) => getValorCidadeTipologia(d, c.key, tipologia) ?? -Infinity);
      return vs.length ? Math.max(...vs) : -Infinity;
    }),
    [dados, tipologia, colsVisiveis],
  );

  const anoIni = dados[0]?.ano ?? anoCorrente;
  const anoFim = dados[dados.length - 1]?.ano ?? anoCorrente;
  const tipologiaAtual = TIPOLOGIAS.find((t) => t.key === tipologia)!;
  const filtroTipologia = tipologia !== 'geral';

  return (
    <div className="bg-akiva-surface border border-akiva-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-akiva-border flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-akiva-gold font-serif text-lg">
            FipeZap Residencial — Venda — {anoIni} a {anoFim}
          </h2>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-2xl">
            Variação anual acumulada do preço de venda de imóveis residenciais. Use como
            referência regional e por tipologia para calibrar a premissa de valorização.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor de tipologia */}
          <div className="flex items-center gap-2 bg-akiva-navy border border-akiva-border rounded px-3 py-1.5">
            <span className="text-gray-400 text-xs whitespace-nowrap">Tipologia:</span>
            <select
              value={tipologia}
              onChange={(e) => setTipologia(e.target.value as TipologiaKey)}
              className="bg-transparent border-none text-white text-xs focus:outline-none cursor-pointer [&_option]:bg-akiva-surface"
            >
              {TIPOLOGIAS.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
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
      </div>

      {/* Seletor de capitais (multiselect via chips) */}
      <div className="px-4 py-2.5 bg-akiva-navy/20 border-b border-akiva-border/50 flex items-center gap-2 flex-wrap">
        <span className="text-gray-500 text-xs whitespace-nowrap mr-1">Capitais:</span>
        {COLS.map((c) => {
          const ativo = cidadesSel.has(c.key);
          return (
            <button
              key={c.key}
              onClick={() => toggleCidade(c.key)}
              className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
                ativo
                  ? 'bg-akiva-gold/15 border-akiva-gold/50 text-akiva-gold'
                  : 'bg-transparent border-akiva-border text-gray-500 hover:text-gray-300 hover:border-gray-500'
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Badge do filtro ativo */}
      <div className="px-4 py-2 bg-akiva-navy/30 border-b border-akiva-border/50 flex items-center gap-2 text-xs flex-wrap">
        <span className="text-gray-500">Exibindo:</span>
        <span className="text-akiva-gold font-medium">{tipologiaAtual.label}</span>
        <span className="text-gray-500">· {tipologiaAtual.sub}</span>
        {filtroTipologia && (
          <span className="text-gray-600 ml-2">
            (capitais ajustadas pelo delta tipologia−geral do Composto FIPE no mesmo ano)
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-akiva-border">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Ano</th>
              {colsVisiveis.map((c) => (
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
                {colsVisiveis.map((c) => {
                  const v = getValorCidadeTipologia(d, c.key, tipologia);
                  if (v === undefined) {
                    return (
                      <td key={c.key} className="py-2.5 px-4 text-center text-gray-600 tabular-nums">
                        —
                      </td>
                    );
                  }
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
              {colsVisiveis.map((c) => (
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
          <strong className="text-gray-400">Sobre as tipologias:</strong> a FIPE publica
          mensalmente o índice Composto segmentado por quantidade de dormitórios (1d, 2d, 3d, 4+d).
          Como a série histórica completa cidade × tipologia × ano não é divulgada, as capitais
          são ajustadas pelo <strong>delta (em pontos percentuais) entre a tipologia e o Geral
          observado no Composto FIPE</strong> daquele ano. Ex.: se em 2024 o Composto Geral subiu
          7,90% e o 1d subiu 8,60% (delta +0,70pp), aplicamos +0,70pp à variação de cada capital
          em 2024. O Composto exibe o valor oficial da FIPE.
        </p>
        <p className="mt-1">
          A FIPE não disponibiliza API pública estável — para atualizar valores, edite
          <code className="text-akiva-gold/70 mx-1">src/lib/indices/fipezap.ts</code>.
        </p>
      </div>
    </div>
  );
}
