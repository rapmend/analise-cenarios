import { useState } from 'react';
import type { Parcela } from '@/types';
import { fmt } from '@/lib/calc';
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons';

interface Props {
  parcelas: Parcela[];
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

export default function ParcelasTable({ parcelas }: Props) {
  const [open, setOpen] = useState(false);

  if (parcelas.length === 0) return null;

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
                <th className="px-4 py-2 text-right text-gray-400 font-medium">Saldo Devedor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-akiva-border/50">
              {parcelas.map((p, i) => (
                <tr key={i} className="hover:bg-akiva-surface/30 transition-colors">
                  <td className="px-4 py-1.5 text-gray-300">{p.mes === 0 ? 'M0' : `M${p.mes}`}</td>
                  <td className={`px-4 py-1.5 font-medium ${TIPO_COLOR[p.tipo]}`}>{TIPO_LABEL[p.tipo]}</td>
                  <td className="px-4 py-1.5 text-right text-white">{fmt(p.valor, 'moeda')}</td>
                  <td className="px-4 py-1.5 text-right text-gray-300">{fmt(p.acumulado, 'moeda')}</td>
                  <td className="px-4 py-1.5 text-right text-gray-400">{p.saldoApos > 0.005 ? fmt(p.saldoApos, 'moeda') : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
