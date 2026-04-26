import { useState } from 'react';
import type { Parcela } from '@/types';
import type { PontoSerie } from '@/lib/calc';
import { fmt } from '@/lib/calc';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

interface Props {
  parcelas: Parcela[];
  /** Série temporal (mes -> valores) para olhar o custo de oportunidade em cada mês */
  serie?: PontoSerie[];
  /** Nome exibido no cabeçalho da coluna de custo de oportunidade */
  benchmarkNome?: string;
}

const TIPO_LABEL: Record<string, string> = {
  entrada: 'Entrada',
  obra: 'Obra',
  chaves: 'Chaves',
};
const TIPO_COLOR: Record<string, string> = {
  entrada: 'text-akiva-gold',
  obra: 'text-blue-300',
  chaves: 'text-green-400',
};

export default function ParcelasTable({ parcelas, serie, benchmarkNome }: Props) {
  const [open, setOpen] = useState(false);

  if (parcelas.length === 0) return null;

  const showBenchmark = !!serie && !!benchmarkNome;

  return (
    <div className="border border-akiva-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-akiva-navy hover:bg-akiva-surface/50 transition-colors text-left"
      >
        <span className="text-gray-300 text-sm font-medium">
          Cronograma de parcelas ({parcelas.length})
        </span>
        {open ? <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-akiva-surface">
              <tr>
                <th className="px-4 py-2 text-left text-gray-400 font-medium">Mês</th>
                <th className="px-4 py-2 text-left text-gray-400 font-medium">Tipo</th>
                <th className="px-4 py-2 text-right text-gray-400 font-medium">Valor</th>
                <th className="px-4 py-2 text-right text-gray-400 font-medium">Acumulado</th>
                {showBenchmark && (
                  <th className="px-4 py-2 text-right text-blue-300/80 font-medium" title="Valor liquido (apos IR) que os mesmos desembolsos teriam acumulado no benchmark ate o mes da parcela">
                    {benchmarkNome}
                  </th>
                )}
                <th className="px-4 py-2 text-right text-gray-400 font-medium">Saldo Devedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-akiva-border/50">
              {parcelas.map((p, i) => {
                const ponto = serie?.[p.mes];
                return (
                  <tr key={i} className="hover:bg-akiva-surface/30 transition-colors">
                    <td className="px-4 py-1.5 text-gray-300">{p.mes === 0 ? 'M0' : `M${p.mes}`}</td>
                    <td className={`px-4 py-1.5 font-medium ${TIPO_COLOR[p.tipo]}`}>{TIPO_LABEL[p.tipo]}</td>
                    <td className="px-4 py-1.5 text-right text-white">{fmt(p.valor, 'moeda')}</td>
                    <td className="px-4 py-1.5 text-right text-gray-300">{fmt(p.acumulado, 'moeda')}</td>
                    {showBenchmark && (
                      <td className="px-4 py-1.5 text-right text-blue-300">
                        {ponto ? fmt(ponto.valorAplicacao, 'moeda') : '--'}
                      </td>
                    )}
                    <td className="px-4 py-1.5 text-right text-gray-400">{p.saldoApos > 0.005 ? fmt(p.saldoApos, 'moeda') : '--'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
