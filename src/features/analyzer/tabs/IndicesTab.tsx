import { useEffect, useMemo, useState, useCallback } from 'react';
import { fmt } from '@/lib/calc';
import { INDICES_HISTORICOS, resumoIndice, type IndiceKey } from '@/lib/indices/historical';
import { carregarProjecaoAnoCorrente, fmtAtualizado, type ProjecaoAnoCorrente } from '@/lib/indices/currentYear';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const COLS: { key: IndiceKey; label: string; sub: string }[] = [
  { key: 'incc',        label: 'INCC-M',       sub: 'FGV' },
  { key: 'cubSP',       label: 'CUB-SP',       sub: 'Sinduscon-SP' },
  { key: 'cubMG',       label: 'CUB-MG',       sub: 'Sinduscon-MG' },
  { key: 'cubNacional', label: 'CUB Nacional', sub: 'CBIC' },
];

export default function IndicesTab() {
  const anoCorrente = new Date().getFullYear();

  // Anos fechados (anteriores ao corrente). Em ordem cronológica.
  const dadosFechados = useMemo(
    () => INDICES_HISTORICOS.filter((d) => d.ano < anoCorrente),
    [anoCorrente],
  );

  const [projecao, setProjecao] = useState<ProjecaoAnoCorrente | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const atualizar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const p = await carregarProjecaoAnoCorrente(anoCorrente);
      if (!p) {
        setErro('Não foi possível obter dados do Banco Central. Verifique sua conexão.');
      } else {
        setProjecao(p);
      }
    } catch {
      setErro('Erro ao consultar a API do Banco Central.');
    } finally {
      setLoading(false);
    }
  }, [anoCorrente]);

  // Auto-fetch quando a aba é montada
  useEffect(() => {
    atualizar();
  }, [atualizar]);

  // Resumos baseados apenas em anos fechados
  const resumos = useMemo(
    () => COLS.map((c) => ({ key: c.key, ...resumoIndice(dadosFechados, c.key) })),
    [dadosFechados],
  );

  // Maior valor de cada ano fechado (para destacar)
  const maxPorAno = useMemo(
    () => dadosFechados.map((d) => Math.max(d.incc, d.cubSP, d.cubMG, d.cubNacional)),
    [dadosFechados],
  );

  const anoIni = dadosFechados[0]?.ano ?? anoCorrente;
  const anoFim = dadosFechados[dadosFechados.length - 1]?.ano ?? anoCorrente;

  return (
    <div className="bg-akiva-surface border border-akiva-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-akiva-border flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-akiva-gold font-serif text-lg">
            Índices da Construção Civil — {anoIni} a {anoCorrente}
          </h2>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-2xl">
            Variação anual acumulada (% no ano). O ano corrente <strong className="text-akiva-gold/80">{anoCorrente}</strong> é
            projetado a partir do acumulado YTD mantendo o ritmo médio. Use como referência para projetar
            valorização do imóvel ou taxa de indexador em contratos de obra.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {projecao && (
            <span className="text-gray-500 text-[11px] whitespace-nowrap">
              Atualizado: <span className="text-gray-300">{fmtAtualizado(projecao.atualizadoEm)}</span>
            </span>
          )}
          <button
            onClick={atualizar}
            disabled={loading}
            className="px-3 py-1.5 border border-akiva-gold/40 text-akiva-gold hover:bg-akiva-gold/10 transition-colors text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {erro && (
        <div className="px-4 py-2 bg-red-950/30 border-b border-red-900/40 text-red-300 text-xs">
          {erro}
        </div>
      )}

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
            {dadosFechados.map((d, i) => (
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

            {/* Linha do ano corrente — projeção */}
            <tr className="bg-akiva-gold/5 border-t-2 border-akiva-gold/30">
              <td className="py-2.5 px-4 font-medium tabular-nums">
                <div className="text-akiva-gold">{anoCorrente}</div>
                <div className="text-akiva-gold/60 text-[10px] font-normal uppercase tracking-wider">
                  Em curso · projeção
                </div>
              </td>
              {COLS.map((c) => {
                const dados = projecao?.valores[c.key];
                if (!dados) {
                  return (
                    <td key={c.key} className="py-2.5 px-4 text-center text-gray-500 tabular-nums">
                      <Tooltip>
                        <TooltipTrigger>—</TooltipTrigger>
                        <TooltipContent className="bg-akiva-surface border-akiva-border text-white max-w-xs p-3 text-xs">
                          {c.key === 'incc'
                            ? 'Buscando dados do Banco Central...'
                            : 'Sem API pública estável para CUB. Atualize manualmente em src/lib/indices/historical.ts quando o sindicato publicar os valores mensais.'}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                  );
                }
                return (
                  <td key={c.key} className="py-2.5 px-4 text-center font-semibold tabular-nums text-akiva-gold">
                    <Tooltip>
                      <TooltipTrigger>{fmt(dados.projecao, 'pct')}</TooltipTrigger>
                      <TooltipContent className="bg-akiva-surface border-akiva-border text-white max-w-xs p-3 text-xs">
                        <p className="font-semibold mb-1">Projeção anualizada</p>
                        <p className="text-gray-300">
                          Acumulado YTD: <strong className="text-akiva-gold">{fmt(dados.acumulado, 'pct')}</strong>
                          {' '}em <strong>{projecao!.mesesFechados}</strong> {projecao!.mesesFechados === 1 ? 'mês' : 'meses'}.
                        </p>
                        <p className="text-gray-400 mt-1">
                          Fórmula: (1 + acumulado)^(12 / meses) − 1
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </td>
                );
              })}
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
          Fontes: <strong className="text-gray-400">FGV</strong> (INCC-M, série SGS 192 do BCB —
          <span className="text-akiva-gold/80"> atualização automática</span>),
          <strong className="text-gray-400"> Sinduscon-SP</strong> (CUB-SP, R8-N),
          <strong className="text-gray-400"> Sinduscon-MG</strong> (CUB-MG, R8-N),
          <strong className="text-gray-400"> CBIC</strong> (CUB Nacional).
        </p>
        <p className="mt-1">
          Valores históricos baseados em publicações oficiais. Os CUBs não possuem API pública
          estável — para atualizar o ano corrente dos CUBs ou anos passados, edite
          <code className="text-akiva-gold/70 mx-1">src/lib/indices/historical.ts</code>.
          A média anual usa cálculo geométrico, considerando apenas anos fechados.
        </p>
      </div>
    </div>
  );
}
