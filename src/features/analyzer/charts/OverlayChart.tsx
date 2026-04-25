import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { PontoSerie } from '@/lib/calc';
import { fmtK } from '@/lib/calc';
import type { Cenario } from '@/types';

interface SerieEntry { cenario: Cenario; serie: PontoSerie[] }

const PALETTE = ['#E0CA90', '#7aa3d8', '#6ecf8f', '#e07d5a', '#a78bfa'];

interface Props {
  entries: SerieEntry[];
  dataKey: keyof PontoSerie;
  height?: number;
}

export default function OverlayChart({ entries, dataKey, height = 260 }: Props) {
  if (entries.length === 0) return null;

  const maxMes = Math.max(...entries.map((e) => e.serie.length - 1));
  const yearMarks = Array.from({ length: Math.floor(maxMes / 12) }, (_, i) => (i + 1) * 12);

  const data = Array.from({ length: maxMes + 1 }, (_, m) => {
    const row: Record<string, number | undefined> = { mes: m };
    entries.forEach(({ cenario, serie }) => {
      row[cenario.id] = serie[m]?.[dataKey] as number | undefined;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" />
        <XAxis
          dataKey="mes"
          tickFormatter={(v) => `M${v}`}
          tick={{ fill: '#6b7f94', fontSize: 10 }}
          ticks={[0, ...yearMarks, maxMes]}
        />
        <YAxis tickFormatter={(v) => fmtK(v as number)} tick={{ fill: '#6b7f94', fontSize: 10 }} width={72} />
        <Tooltip
          formatter={(v, key) => {
            const entry = entries.find((e) => e.cenario.id === key);
            return [fmtK(v as number), entry?.cenario.nome ?? String(key)];
          }}
          labelFormatter={(l) => `Mes ${l}`}
          itemSorter={(item) => -(item.value as number)}
          contentStyle={{ background: '#0a1f38', border: '1px solid #1a3a5c', fontSize: 12, color: '#e8edf5' }}
        />
        <Legend
          formatter={(key) => entries.find((e) => e.cenario.id === key)?.cenario.nome ?? key}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
        {entries.map(({ cenario }, i) => (
          <Line
            key={cenario.id}
            dataKey={cenario.id}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={false}
            name={cenario.nome}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
