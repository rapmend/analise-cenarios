import { useState } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { PontoSerie } from '@/lib/calc';
import { fmtK } from '@/lib/calc';

interface Props {
  serie: PontoSerie[];
  benchmarkNome?: string;
}

export default function DualChart({ serie, benchmarkNome = 'Aplicacao Financeira' }: Props) {
  const yearMarks = Array.from({ length: Math.floor((serie.length - 1) / 12) }, (_, i) => (i + 1) * 12);
  const [aplicView, setAplicView] = useState<'bruto' | 'liquido'>('bruto');
  const aplicKey = aplicView === 'bruto' ? 'valorAplicacao' : 'valorAplicacaoLiq';
  const aplicLucroKey = aplicView === 'bruto' ? 'posicaoFinanceira' : 'posicaoFinanceiraLiq';
  const aplicSuffix = aplicView === 'bruto' ? '(bruto)' : '(liq. se resgatado)';

  return (
    <div>
      <div className="flex items-center justify-end gap-2 px-2 pb-1 text-[11px] text-gray-400">
        <span>Aplicacao:</span>
        <div className="inline-flex rounded border border-akiva-border overflow-hidden">
          <button
            type="button"
            onClick={() => setAplicView('bruto')}
            className={`px-2 py-0.5 transition-colors ${aplicView === 'bruto' ? 'bg-akiva-gold/20 text-akiva-gold' : 'text-gray-500 hover:text-gray-300'}`}
          >Bruto</button>
          <button
            type="button"
            onClick={() => setAplicView('liquido')}
            className={`px-2 py-0.5 transition-colors border-l border-akiva-border ${aplicView === 'liquido' ? 'bg-akiva-gold/20 text-akiva-gold' : 'text-gray-500 hover:text-gray-300'}`}
          >Liquido se resgatado</button>
        </div>
      </div>
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart data={serie} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" />
        <XAxis
          dataKey="mes"
          tickFormatter={(v) => `M${v}`}
          tick={{ fill: '#6b7f94', fontSize: 10 }}
          ticks={[0, ...yearMarks, serie.length - 1]}
        />
        <YAxis tickFormatter={(v) => fmtK(v as number)} tick={{ fill: '#6b7f94', fontSize: 10 }} width={64} />
        <Tooltip
          formatter={(v, name) => [fmtK(v as number), name]}
          labelFormatter={(l) => `Mes ${l}`}
          itemSorter={(item) => -(item.value as number)}
          contentStyle={{ background: '#0a1f38', border: '1px solid #1a3a5c', fontSize: 12, color: '#e8edf5' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

        {/* Par 1: Valor bruto — imóvel (dourado sólido) vs aplicação corrigida (azul sólido) */}
        <Line
          dataKey="valorImovel"
          stroke="#E0CA90"
          strokeWidth={2}
          dot={false}
          name="Valor do Imovel"
        />
        <Line
          dataKey={aplicKey}
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
          name={`${benchmarkNome} ${aplicSuffix}`}
        />

        {/* Par 2: Lucro líquido imóvel + lucro da aplicação na visão escolhida */}
        <Line
          dataKey="posicaoLiquida"
          stroke="#E0CA90"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          name="Lucro Liquido Imovel"
        />
        <Line
          dataKey={aplicLucroKey}
          stroke="#93c5fd"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          name={`Lucro ${benchmarkNome} ${aplicSuffix}`}
        />
      </ComposedChart>
    </ResponsiveContainer>

      <details className="mt-2 text-[11px] text-gray-500 leading-relaxed">
        <summary className="cursor-pointer text-gray-400 hover:text-gray-300 select-none">
          Como o grafico e construido
        </summary>
        <div className="mt-2 pl-3 border-l border-akiva-border/40 space-y-2">
          <p>
            <span className="text-akiva-gold/80">Imovel — Valor do Imovel:</span>{' '}
            valor de mercado projetado mes a mes pela valorizacao anual composta (linha solida dourada).
          </p>
          <p>
            <span className="text-akiva-gold/80">Imovel — Lucro Liquido:</span>{' '}
            valor do imovel menos corretagem, saldo devedor e IR sobre lucro imobiliario, menos o capital ja aplicado ate o mes
            (linha pontilhada dourada). Reflete "se eu vendesse neste mes".
          </p>
          <p>
            <span className="text-akiva-gold/80">Aplicacao — Bruto (default):</span>{' '}
            cada aporte capitaliza pela taxa anual da aplicacao ate o mes m, <em>sem deduzir IR</em>.
            Esta visao preserva a base de juros compostos como ocorre na pratica — o IR de renda fixa so e devido no resgate.
          </p>
          <p>
            <span className="text-akiva-gold/80">Aplicacao — Liquido se resgatado:</span>{' '}
            simulacao "se eu resgatasse neste mes". Para cada aporte, aplica IR sobre o ganho usando a aliquota correspondente ao prazo
            (tabela regressiva 22,5% / 20% / 17,5% / 15%, ou aliquota fixa). E uma visao apenas para visualizacao — nao altera
            a capitalizacao real.
          </p>
          <p className="text-gray-600">
            Importante: VPL, TIR e ROI exibidos no painel usam o resultado real do encerramento (com IR no resgate), nao a trilha
            bruta intermediaria.
          </p>
        </div>
      </details>
    </div>
  );
}
