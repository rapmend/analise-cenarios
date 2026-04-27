import { useState } from 'react';
import type { Parcela } from '@/types';
import type { PontoSerie } from '@/lib/calc';
import { fmt } from '@/lib/calc';
import { ChevronDownIcon, ChevronUpIcon, DownloadIcon } from '@radix-ui/react-icons';

interface Props {
  parcelas: Parcela[];
  /** Série temporal (mes -> valores) para olhar o custo de oportunidade em cada mês */
  serie?: PontoSerie[];
  /** Nome exibido no cabeçalho do grupo de custo de oportunidade */
  benchmarkNome?: string;
  /** Nome do cenário (usado no nome do arquivo exportado) */
  cenarioNome?: string;
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

/** Formata número como string em padrão brasileiro (vírgula decimal, sem separador de milhar) para CSV. */
function csvNum(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '';
  return n.toFixed(2).replace('.', ',');
}

function csvCell(v: string | number | null | undefined): string {
  const s = typeof v === 'number' ? csvNum(v) : (v ?? '');
  if (/[;"\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function slug(s: string): string {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'cronograma';
}

export default function ParcelasTable({ parcelas, serie, benchmarkNome, cenarioNome }: Props) {
  const [open, setOpen] = useState(false);

  if (parcelas.length === 0) return null;

  const showBenchmark = !!serie && !!benchmarkNome;

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const headerGroup = ['', '', 'Imóvel', '', '', '', '', ...(showBenchmark ? [benchmarkNome ?? '', ''] : [])];
    const headerCols = [
      'Mês', 'Tipo',
      'Vr. Parcela', 'Pagto Acumulado', 'Valor Imóvel', 'Saldo Devedor Imóvel', 'Saldo Líquido Imóvel',
      ...(showBenchmark ? ['Acumulado Aplicação', 'Lucro Bruto Aplicação'] : []),
    ];
    const rows = parcelas.map((p) => {
      const pt = serie?.[p.mes];
      return [
        p.mes === 0 ? 'M0' : `M${p.mes}`,
        TIPO_LABEL[p.tipo] ?? p.tipo,
        csvNum(p.valor),
        csvNum(p.acumulado),
        pt ? csvNum(pt.valorImovel) : '',
        p.saldoApos > 0.005 ? csvNum(p.saldoApos) : '',
        pt ? csvNum(pt.patrimonio) : '',
        ...(showBenchmark ? [pt ? csvNum(pt.valorAplicacao) : '', pt ? csvNum(pt.posicaoFinanceira) : ''] : []),
      ];
    });

    const csv = [headerGroup, headerCols, ...rows]
      .map((r) => r.map(csvCell).join(';'))
      .join('\r\n');

    // BOM UTF-8 garante acentos corretos no Excel
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cronograma-${slug(cenarioNome ?? 'cenario')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  return (
    <div className="border border-akiva-border rounded-lg overflow-hidden">
      <div className="w-full flex items-center justify-between bg-akiva-navy">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center justify-between px-4 py-3 hover:bg-akiva-surface/50 transition-colors text-left"
        >
          <span className="text-gray-300 text-sm font-medium">
            Cronograma de parcelas ({parcelas.length})
          </span>
          {open ? <ChevronUpIcon className="h-4 w-4 text-gray-400" /> : <ChevronDownIcon className="h-4 w-4 text-gray-400" />}
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-3 mr-2 py-1.5 border border-akiva-border rounded text-xs text-gray-400 hover:text-akiva-gold hover:border-akiva-gold/40 transition-colors"
          title="Exportar cronograma para CSV (abre no Excel)"
        >
          <DownloadIcon className="h-3.5 w-3.5" />
          CSV
        </button>
      </div>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-akiva-surface">
              <tr className="border-b border-akiva-border">
                <th rowSpan={2} className="px-4 py-2 text-left text-gray-400 font-medium align-bottom">Mês</th>
                <th rowSpan={2} className="px-4 py-2 text-left text-gray-400 font-medium align-bottom">Tipo</th>
                <th colSpan={5} className="px-4 py-1 text-center text-akiva-gold/80 font-medium uppercase tracking-wider text-[10px] border-l border-akiva-border/60">
                  Imóvel
                </th>
                {showBenchmark && (
                  <th colSpan={2} className="px-4 py-1 text-center text-blue-300/80 font-medium uppercase tracking-wider text-[10px] border-l border-akiva-border/60" title="Custo de oportunidade no benchmark configurado (valor bruto, sem IR)">
                    {benchmarkNome}
                  </th>
                )}
              </tr>
              <tr>
                <th className="px-4 py-2 text-right text-gray-400 font-medium border-l border-akiva-border/60" title="Valor do desembolso da parcela no mês">Vr. Parcela</th>
                <th className="px-4 py-2 text-right text-gray-400 font-medium" title="Soma nominal de todos os pagamentos feitos até o mês">Pagto Acumulado</th>
                <th className="px-4 py-2 text-right text-gray-400 font-medium" title="Valor do imóvel corrigido pela valorização mensal composta">Valor Imóvel</th>
                <th className="px-4 py-2 text-right text-gray-400 font-medium" title="Saldo devedor do contrato após o pagamento">Saldo Devedor Imóvel</th>
                <th className="px-4 py-2 text-right text-gray-400 font-medium" title="Valor Imóvel − corretagem − saldo devedor − IR sobre lucro imobiliário">Saldo Líquido Imóvel</th>
                {showBenchmark && (
                  <>
                    <th className="px-4 py-2 text-right text-gray-400 font-medium border-l border-akiva-border/60" title="Valor bruto compostado da aplicação no mês">Acumulado</th>
                    <th className="px-4 py-2 text-right text-gray-400 font-medium" title="Acumulado − capital nominal pago = lucro bruto da aplicação">Lucro Bruto</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-akiva-border/50">
              {parcelas.map((p, i) => {
                const ponto = serie?.[p.mes];
                const liquidoColor = ponto && ponto.posicaoFinanceira < 0 ? 'text-red-400' : 'text-green-400';
                return (
                  <tr key={i} className="hover:bg-akiva-surface/30 transition-colors">
                    <td className="px-4 py-1.5 text-gray-300">{p.mes === 0 ? 'M0' : `M${p.mes}`}</td>
                    <td className={`px-4 py-1.5 font-medium ${TIPO_COLOR[p.tipo]}`}>{TIPO_LABEL[p.tipo]}</td>
                    <td className="px-4 py-1.5 text-right text-white border-l border-akiva-border/60">{fmt(p.valor, 'moeda')}</td>
                    <td className="px-4 py-1.5 text-right text-gray-300">{fmt(p.acumulado, 'moeda')}</td>
                    <td className="px-4 py-1.5 text-right text-akiva-gold/90">{ponto ? fmt(ponto.valorImovel, 'moeda') : '--'}</td>
                    <td className="px-4 py-1.5 text-right text-gray-400">{p.saldoApos > 0.005 ? fmt(p.saldoApos, 'moeda') : '--'}</td>
                    <td className={`px-4 py-1.5 text-right ${ponto && ponto.patrimonio - p.acumulado >= 0 ? 'text-green-400/90' : 'text-akiva-gold/90'}`}>{ponto ? fmt(ponto.patrimonio, 'moeda') : '--'}</td>
                    {showBenchmark && (
                      <>
                        <td className="px-4 py-1.5 text-right text-blue-300 border-l border-akiva-border/60">
                          {ponto ? fmt(ponto.valorAplicacao, 'moeda') : '--'}
                        </td>
                        <td className={`px-4 py-1.5 text-right ${liquidoColor}`}>
                          {ponto ? fmt(ponto.posicaoFinanceira, 'moeda') : '--'}
                        </td>
                      </>
                    )}
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
