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

  return (
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
          dataKey="valorAplicacao"
          stroke="#60a5fa"
          strokeWidth={2}
          dot={false}
          name={benchmarkNome}
        />

        {/* Par 2: Resultado líquido — imóvel (dourado pontilhado) vs aplicação (azul pontilhado) */}
        <Line
          dataKey="posicaoLiquida"
          stroke="#E0CA90"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          name="Result. Liquido Imovel"
        />
        <Line
          dataKey="posicaoFinanceira"
          stroke="#93c5fd"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          name={`Result. Liquido ${benchmarkNome}`}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
