import { useMemo } from 'react';
import type { Cenario, Resultado } from '@/types';
import { calcular, serieTemporal } from '@/lib/calc';
import CenarioForm from '../panels/CenarioForm';
import CenarioMetrics from '../panels/CenarioMetrics';
import ParcelasTable from '../panels/ParcelasTable';
import CronogramaChart from '../charts/CronogramaChart';
import DualChart from '../charts/DualChart';

interface Props {
  cenario: Cenario;
  taxaVPL: number;
  onChange: (c: Cenario) => void;
  onRemove?: () => void;
  canRemove?: boolean;
}

export default function CenarioTab({ cenario, taxaVPL, onChange, onRemove, canRemove }: Props) {
  const resultado: Resultado = useMemo(() => calcular(cenario, taxaVPL), [cenario, taxaVPL]);
  const serie = useMemo(() => serieTemporal(cenario, resultado, taxaVPL), [cenario, resultado, taxaVPL]);

  return (
    <div className="space-y-4">
      <CenarioForm cenario={cenario} onChange={onChange} onRemove={onRemove} canRemove={canRemove} />
      <CenarioMetrics resultado={resultado} taxaVPL={taxaVPL} />

      {resultado.tipo === 'parcelado' && resultado.parcelas.length > 0 && (
        <>
          <div className="bg-akiva-surface border border-akiva-border rounded-lg p-4">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Cronograma de Pagamentos</p>
            <CronogramaChart parcelas={resultado.parcelas} periodoMeses={cenario.periodoMeses} />
          </div>
          <ParcelasTable parcelas={resultado.parcelas} />
        </>
      )}

      <div className="bg-akiva-surface border border-akiva-border rounded-lg p-4">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">Evolucao do Cenario</p>
        <DualChart serie={serie} />
      </div>
    </div>
  );
}
