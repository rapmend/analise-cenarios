import type { Resultado } from '@/types';
import { fmt } from '@/lib/calc';
import { GLOSSARIO } from '@/lib/calc';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type GKey = keyof typeof GLOSSARIO;

interface Props {
  resultado: Resultado;
  taxaVPL: number;
}

function KpiCard({ label, value, glossKey, positive }: { label: string; value: string; glossKey?: GKey; positive?: boolean }) {
  const card = (
    <div className="bg-akiva-navy border border-akiva-border rounded-lg p-3 space-y-1 cursor-default">
      <div className="flex items-center gap-1 text-gray-400 text-xs">
        <span>{label}</span>
        {glossKey && <span className="text-gray-600 text-xs">(?)</span>}
      </div>
      <p className={`font-semibold text-lg leading-tight ${positive === undefined ? 'text-white' : positive ? 'text-green-400' : 'text-red-400'}`}>
        {value}
      </p>
    </div>
  );

  if (!glossKey) return card;

  return (
    <Tooltip>
      <TooltipTrigger className="text-left w-full">{card}</TooltipTrigger>
      <TooltipContent className="bg-akiva-surface border-akiva-border text-white max-w-xs p-3">
        <p className="font-semibold text-akiva-gold text-xs mb-1">{GLOSSARIO[glossKey].titulo}</p>
        <p className="text-gray-300 text-xs leading-relaxed">{GLOSSARIO[glossKey].txt}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function CenarioMetrics({ resultado, taxaVPL }: Props) {
  const r = resultado;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      <KpiCard label="Capital Aplicado" value={fmt(r.valorInvestido, 'moeda0')} glossKey="investido" />
      <KpiCard label="Valor Futuro" value={fmt(r.valorFuturo, 'moeda0')} glossKey="valorFuturo" />
      <KpiCard
        label="Lucro Liquido"
        value={fmt(r.lucroLiquido, 'moeda0')}
        glossKey="lucroLiquido"
        positive={r.lucroLiquido >= 0}
      />
      <KpiCard
        label="ROI Total"
        value={fmt(r.roi, 'pct')}
        glossKey="roi"
        positive={r.roi >= 0}
      />
      <KpiCard
        label={`VPL (${fmt(taxaVPL, 'pct')} a.a.)`}
        value={fmt(r.vpl, 'moeda0')}
        glossKey="vpl"
        positive={r.vpl >= 0}
      />
      <KpiCard
        label="TIR (anual)"
        value={isNaN(r.tir) ? '--' : fmt(r.tir, 'pct')}
        glossKey="tir"
        positive={!isNaN(r.tir) && r.tir >= taxaVPL}
      />
      {r.tipo === 'parcelado' && r.saldoFinal > 0.005 && (
        <KpiCard label="Saldo Devedor na Venda" value={fmt(r.saldoFinal, 'moeda0')} positive={false} />
      )}
    </div>
  );
}
