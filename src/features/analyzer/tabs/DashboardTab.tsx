import { useMemo } from 'react';
import type { Cenario } from '@/types';
import type { BenchmarkConfig } from '@/types';
import { calcular, serieTemporal, fmt } from '@/lib/calc';
import OverlayChart from '../charts/OverlayChart';
import DualChart from '../charts/DualChart';

interface Props {
  cenarios: Cenario[];
  taxaVPL: number;
  benchmark: BenchmarkConfig;
}

export default function DashboardTab({ cenarios, taxaVPL, benchmark }: Props) {
  const benchmarkIR: 'regressiva' | number =
    benchmark.tipo === 'rendaFixa' ? 'regressiva' :
    benchmark.tipo === 'isento'    ? 0 :
    benchmark.aliquotaIR;

  const entries = useMemo(
    () => cenarios.map((c) => {
      const r = calcular(c, taxaVPL);
      return { cenario: c, serie: serieTemporal(c, r, taxaVPL, benchmarkIR), lucroLiquido: r.lucroLiquido };
    }),
    [cenarios, taxaVPL, benchmarkIR],
  );

  return (
    <div className="space-y-6">
      <div className="border-l-2 border-akiva-gold/60 bg-akiva-gold/5 px-4 py-3 rounded-r text-xs text-gray-300 leading-relaxed">
        <p className="text-akiva-gold/90 font-semibold mb-1">Sobre as premissas deste estudo</p>
        <p>
          As <strong className="text-akiva-gold/90">premissas</strong> adotadas (valorizacao anual, taxa de desconto/VPL,
          prazos, indexador, corretagem, IR e custo de oportunidade) sao <strong>decisivas</strong> para tornar o projeto
          viavel ou inviavel. Pequenas variacoes em qualquer uma delas podem inverter o resultado.
        </p>
        <p className="mt-1.5">
          Existe portanto <strong className="text-akiva-gold/90">sensibilidade</strong> e <strong className="text-akiva-gold/90">vies</strong> inerentes a essas estimativas.
          Recomenda-se explorar cenarios alternativos e faixas de variacao das premissas antes de qualquer decisao —
          o objetivo deste estudo e auxiliar a decisao do cliente, nao garantir retorno.
        </p>
      </div>

      <div className="bg-akiva-surface border border-akiva-border rounded-lg p-5">
        <h3 className="font-serif text-akiva-gold text-lg mb-1">Lucro Bruto Comparado</h3>
        <p className="text-gray-500 text-xs mb-4">Lucro bruto projetado mes a mes — imovel vs benchmark — por cenario.</p>
        <OverlayChart entries={entries} dataKey="posicaoLiquida" />
      </div>

      <div className="bg-akiva-surface border border-akiva-border rounded-lg p-5">
        <h3 className="font-serif text-akiva-gold text-lg mb-1">{benchmark.nome} (custo de oportunidade)</h3>
        <p className="text-gray-500 text-xs mb-4">Valor liquido acumulado do benchmark se os mesmos desembolsos fossem aplicados.</p>
        <OverlayChart entries={entries} dataKey="valorAplicacao" height={220} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {entries.map(({ cenario, serie }) => (
          <div key={cenario.id} className="bg-akiva-surface border border-akiva-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-white font-medium text-sm">{cenario.nome}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  <span className="text-akiva-gold/70">{cenario.tipo === 'avista' ? 'A Vista' : 'Parcelado'}</span>
                  {' · '}Valorizacao {fmt(cenario.valorizAnual, 'pct')} a.a. · {cenario.periodoMeses}m
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 text-xs">Lucro Bruto Final</p>
                <p className={`font-semibold text-sm ${serie[serie.length - 1]?.posicaoLiquida >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {fmt(serie[serie.length - 1]?.posicaoLiquida ?? 0, 'moeda0')}
                </p>
              </div>
            </div>
            <DualChart serie={serie} benchmarkNome={benchmark.nome} />
          </div>
        ))}
      </div>
    </div>
  );
}
