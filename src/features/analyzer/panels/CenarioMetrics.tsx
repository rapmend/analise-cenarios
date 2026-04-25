import type { Resultado } from '@/types';
import { fmt } from '@/lib/calc';
import { GLOSSARIO } from '@/lib/calc';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type GKey = keyof typeof GLOSSARIO;

interface KpiProps {
  label: string;
  value: string;
  glossKey?: GKey;
  positive?: boolean;
}

function KpiCard({ label, value, glossKey, positive }: KpiProps) {
  const valueColor =
    positive === undefined
      ? 'text-white'
      : positive
      ? 'text-green-400'
      : 'text-red-400';

  const inner = (
    <div className="flex flex-col justify-between h-full min-h-[72px] px-4 py-3 cursor-default select-none">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-500 leading-none">{label}</span>
        {glossKey && (
          <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border border-gray-600 text-gray-600 text-[8px] leading-none flex-shrink-0">
            ?
          </span>
        )}
      </div>
      <p className={`font-semibold text-xl leading-none mt-2 ${valueColor}`}>{value}</p>
    </div>
  );

  if (!glossKey) return <>{inner}</>;

  return (
    <Tooltip>
      <TooltipTrigger className="text-left w-full h-full">{inner}</TooltipTrigger>
      <TooltipContent className="bg-akiva-surface border-akiva-border text-white max-w-xs p-3">
        <p className="font-semibold text-akiva-gold text-xs mb-1">{GLOSSARIO[glossKey].titulo}</p>
        <p className="text-gray-300 text-xs leading-relaxed">{GLOSSARIO[glossKey].txt}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function CenarioMetrics({ resultado, taxaVPL }: { resultado: Resultado; taxaVPL: number }) {
  const r = resultado;

  const cards: KpiProps[] = [
    { label: 'Capital Aplicado',              value: fmt(r.valorInvestido, 'moeda0'),                              glossKey: 'investido' },
    { label: 'Valor Futuro',                  value: fmt(r.valorFuturo, 'moeda0'),                                 glossKey: 'valorFuturo' },
    { label: 'Lucro Liquido',                 value: fmt(r.lucroLiquido, 'moeda0'),  positive: r.lucroLiquido >= 0, glossKey: 'lucroLiquido' },
    { label: 'ROI Total',                     value: fmt(r.roi, 'pct'),              positive: r.roi >= 0,          glossKey: 'roi' },
    { label: `VPL (${fmt(taxaVPL, 'pct')} a.a.)`, value: fmt(r.vpl, 'moeda0'),     positive: r.vpl >= 0,          glossKey: 'vpl' },
    { label: 'TIR (anual)',                   value: isNaN(r.tir) ? '--' : fmt(r.tir, 'pct'), positive: !isNaN(r.tir) && r.tir >= taxaVPL, glossKey: 'tir' },
  ];

  if (r.tipo === 'parcelado' && r.saldoFinal > 0.005) {
    cards.push({ label: 'Saldo Devedor na Venda', value: fmt(r.saldoFinal, 'moeda0'), positive: false });
  }

  return (
    <div className="bg-akiva-navy border border-akiva-border rounded-lg overflow-hidden">
      <div className="grid grid-cols-3 divide-x divide-akiva-border">
        {cards.map((c, i) => (
          <div
            key={c.label}
            className={`${i >= 3 ? 'border-t border-akiva-border' : ''}`}
          >
            <KpiCard {...c} />
          </div>
        ))}
      </div>
    </div>
  );
}
