import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ReferenceDot, ResponsiveContainer,
} from 'recharts';
import type { Parcela } from '@/types';
import { fmtK } from '@/lib/calc';

interface Props {
  parcelas: Parcela[];
  periodoMeses: number;
}

export default function CronogramaChart({ parcelas, periodoMeses }: Props) {
  if (parcelas.length === 0) return null;

  const lastMes = Math.max(periodoMeses, parcelas[parcelas.length - 1]?.mes ?? 0);
  const dataMap = new Map<number, number>();
  parcelas.forEach((p) => { dataMap.set(p.mes, p.acumulado); });

  const data: { mes: number; acumulado: number }[] = [];
  let last = 0;
  for (let m = 0; m <= lastMes; m++) {
    if (dataMap.has(m)) last = dataMap.get(m)!;
    data.push({ mes: m, acumulado: last });
  }

  const entradaParcela = parcelas.find((p) => p.tipo === 'entrada');
  const chavesParcela = parcelas.find((p) => p.tipo === 'chaves');

  const yearMarks = Array.from({ length: Math.floor(lastMes / 12) }, (_, i) => (i + 1) * 12).filter((m) => m <= lastMes);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 10, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a3a5c" />
        <XAxis
          dataKey="mes"
          tickFormatter={(v) => `M${v}`}
          tick={{ fill: '#6b7f94', fontSize: 10 }}
          ticks={[0, ...yearMarks, lastMes]}
        />
        <YAxis
          tickFormatter={(v) => fmtK(v as number)}
          tick={{ fill: '#6b7f94', fontSize: 10 }}
          width={64}
        />
        <Tooltip
          formatter={(v) => fmtK(v as number)}
          labelFormatter={(l) => `Mes ${l}`}
          contentStyle={{ background: '#0a1f38', border: '1px solid #1a3a5c', fontSize: 12, color: '#e8edf5' }}
          itemStyle={{ color: '#E0CA90' }}
        />
        <Line dataKey="acumulado" stroke="#E0CA90" strokeWidth={2} dot={false} name="Acumulado pago" />
        {entradaParcela && (
          <ReferenceDot
            x={entradaParcela.mes}
            y={entradaParcela.acumulado}
            r={5}
            fill="#E0CA90"
            stroke="#001226"
            label={{ value: 'Entrada', position: 'top', fill: '#E0CA90', fontSize: 10 }}
          />
        )}
        {chavesParcela && (
          <ReferenceDot
            x={chavesParcela.mes}
            y={chavesParcela.acumulado}
            r={5}
            fill="#6ecf8f"
            stroke="#001226"
            label={{ value: 'Chaves', position: 'top', fill: '#6ecf8f', fontSize: 10 }}
          />
        )}
        {yearMarks.map((m) => (
          <ReferenceLine key={m} x={m} stroke="#1a3a5c" strokeDasharray="4 4" />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
