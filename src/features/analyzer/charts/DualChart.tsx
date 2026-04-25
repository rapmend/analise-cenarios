import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { PontoSerie } from '@/lib/calc';
import { fmtK } from '@/lib/calc';

interface Props {
  serie: PontoSerie[];
}

export default function DualChart({ serie }: Props) {
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
          contentStyle={{ background: '#0a1f38', border: '1px solid #1a3a5c', fontSize: 12, color: '#e8edf5' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />

        {/* Par 1: Valor do ativo vs capital desembolsado */}
        <Line
          dataKey="valorImovel"
          stroke="#E0CA90"
          strokeWidth={2}
          dot={false}
          name="Valor do Imovel"
        />
        <Line
          dataKey="capitalAplicado"
          stroke="#7aa3d8"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={false}
          name="Capital Acumulado"
        />

        {/* Par 2: Posicao liquida imovel vs posicao liquida aplicacao financeira */}
        <Area
          dataKey="posicaoLiquida"
          stroke="#6ecf8f"
          fill="rgba(110,207,143,0.12)"
          strokeWidth={2}
          dot={false}
          name="Pos. Liquida Imovel"
        />
        <Line
          dataKey="posicaoFinanceira"
          stroke="#c084fc"
          strokeWidth={1.5}
          strokeDasharray="6 3"
          dot={false}
          name="Pos. Liquida Aplicacao"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
