import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { useAppStore } from '@/store/appStore';
import { addCenario, removeCenario, updateCenario } from '@/store/appStore';
import AppShell from '@/components/AppShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardTab from '@/features/analyzer/tabs/DashboardTab';
import CompareTab from '@/features/analyzer/tabs/CompareTab';
import CenarioTab from '@/features/analyzer/tabs/CenarioTab';
import { printPdf } from '@/features/analyzer/pdf/printPdf';
import type { Cenario, BenchmarkConfig } from '@/types';
import { BENCHMARK_DEFAULT } from '@/types';

const CENARIO_AVISTA_BASE: Omit<Cenario & { tipo: 'avista' }, 'id' | 'nome'> = {
  tipo: 'avista',
  valorImovel: 550000,
  valorizAnual: 0.12,
  periodoMeses: 24,
  corretagem: 0.05,
  ir: 0.15,
  taxaDesc: 0.135,
};

export default function EstudoAnalyzerPage() {
  const { clienteId, estudoId } = useParams<{ clienteId: string; estudoId: string }>();
  const { clientes, estudosByCliente, loadClientes, loadEstudos, updateEstudo } = useAppStore();

  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadClientes();
    if (clienteId) loadEstudos(clienteId);
  }, [clienteId, loadClientes, loadEstudos]);

  const cliente = clientes.find((c) => c.id === clienteId);
  const estudo = clienteId ? estudosByCliente[clienteId]?.find((e) => e.id === estudoId) : undefined;

  // benchmark com fallback para estudos antigos sem o campo
  const benchmark: BenchmarkConfig = estudo?.benchmark ?? BENCHMARK_DEFAULT;

  const handleCenarioChange = useCallback((cenario: Cenario) => {
    if (!estudo) return;
    updateEstudo(updateCenario(estudo, cenario));
  }, [estudo, updateEstudo]);

  const handleCenarioRemove = useCallback((id: string) => {
    if (!estudo || estudo.cenarios.length <= 1) return;
    updateEstudo(removeCenario(estudo, id));
  }, [estudo, updateEstudo]);

  const handleAddCenario = useCallback(() => {
    if (!estudo) return;
    const novo: Cenario = { ...CENARIO_AVISTA_BASE, id: nanoid(), nome: `Cenario ${estudo.cenarios.length + 1}` };
    updateEstudo(addCenario(estudo, novo));
  }, [estudo, updateEstudo]);

  const handleTaxaVPL = useCallback((v: number) => {
    if (!estudo) return;
    updateEstudo({ ...estudo, taxaDescontoVPL: v });
  }, [estudo, updateEstudo]);

  const handleDataEmissao = useCallback((v: string) => {
    if (!estudo) return;
    updateEstudo({ ...estudo, dataEmissao: v });
  }, [estudo, updateEstudo]);

  const handleBenchmark = useCallback((patch: Partial<BenchmarkConfig>) => {
    if (!estudo) return;
    updateEstudo({ ...estudo, benchmark: { ...benchmark, ...patch } });
  }, [estudo, benchmark, updateEstudo]);

  const handlePrint = useCallback(async () => {
    if (!estudo || !cliente) return;
    const prevTab = activeTab;
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      // espera o tab montar e Recharts dimensionar
      await new Promise((r) => setTimeout(r, 600));
    }
    // captura SVGs dos overlay charts do dashboard (primeiros 2 — visões comparativas).
    // Base UI só monta o tabpanel ativo, então qualquer querySelector pega só os do dashboard.
    // Cada .recharts-wrapper tem várias <svg> (ícones de legenda + chart); o chart é o filho direto.
    const wrappers = Array.from(document.querySelectorAll('[role="tabpanel"] .recharts-wrapper'));
    const dashboardCharts = wrappers.slice(0, 2).map((w) => {
      const svg = w.querySelector(':scope > svg');
      return svg ? svg.outerHTML : '';
    }).filter(Boolean);
    printPdf(estudo, cliente.iniciais, { dashboardCharts });
    if (prevTab !== 'dashboard') setActiveTab(prevTab);
  }, [estudo, cliente, activeTab]);

  if (!estudo || !cliente) {
    return (
      <AppShell breadcrumbs={[{ label: 'Clientes', href: '/clientes' }]}>
        <p className="text-gray-400">Estudo nao encontrado.</p>
      </AppShell>
    );
  }

  const cenarioTabs = estudo.cenarios.map((c) => ({ id: c.id, label: c.nome }));

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Clientes', href: '/clientes' },
        { label: cliente.nome, href: `/clientes/${clienteId}` },
        { label: estudo.nome },
      ]}
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-akiva-gold text-2xl font-medium truncate">{estudo.nome}</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-akiva-surface border border-akiva-border rounded px-3 py-1.5">
            <span className="text-gray-400 text-xs whitespace-nowrap">Taxa VPL/TIR</span>
            <Input
              type="number"
              step="0.5"
              value={+(estudo.taxaDescontoVPL * 100).toFixed(2)}
              onChange={(e) => handleTaxaVPL(parseFloat(e.target.value) / 100 || 0)}
              className="bg-transparent border-none text-white text-sm w-16 p-0 focus-visible:ring-0 text-right [appearance:textfield]"
            />
            <span className="text-gray-500 text-xs">% a.a.</span>
          </div>
          <div className="flex items-center gap-2 bg-akiva-surface border border-akiva-border rounded px-3 py-1.5">
            <span className="text-gray-400 text-xs whitespace-nowrap">Emissao</span>
            <Input
              type="date"
              value={estudo.dataEmissao}
              onChange={(e) => handleDataEmissao(e.target.value)}
              className="bg-transparent border-none text-white text-xs w-32 p-0 focus-visible:ring-0 [color-scheme:dark]"
            />
          </div>
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="border-akiva-gold/40 text-akiva-gold hover:bg-akiva-gold/10 text-xs"
          >
            Gerar PDF
          </Button>
        </div>
      </div>

      {/* Custo de oportunidade */}
      <div className="inline-flex flex-wrap items-center gap-2 mb-6 px-3 py-2 bg-akiva-surface border border-akiva-border rounded-lg">
        <span className="text-gray-400 text-xs whitespace-nowrap">Custo de oportunidade:</span>
        <Input
          type="text"
          value={benchmark.nome}
          onChange={(e) => handleBenchmark({ nome: e.target.value })}
          placeholder="Ex: CDB, CDI, Tesouro IPCA+"
          className="bg-transparent border border-akiva-border text-white text-xs h-7 w-44 px-2 focus-visible:ring-0"
        />
        <select
          value={benchmark.tipo}
          onChange={(e) => handleBenchmark({ tipo: e.target.value as BenchmarkConfig['tipo'] })}
          className="bg-akiva-navy border border-akiva-border text-gray-300 text-xs rounded px-2 h-7 focus:outline-none focus:border-akiva-gold/40"
        >
          <option value="rendaFixa">Renda Fixa (IR regressivo)</option>
          <option value="outro">Outro IR</option>
          <option value="isento">Isento de IR</option>
        </select>
        {benchmark.tipo === 'outro' && (
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 text-xs">Aliq. IR</span>
            <Input
              type="number"
              step="0.5"
              min="0"
              max="100"
              value={+(benchmark.aliquotaIR * 100).toFixed(1)}
              onChange={(e) => handleBenchmark({ aliquotaIR: parseFloat(e.target.value) / 100 || 0 })}
              className="bg-transparent border border-akiva-border text-white text-xs h-7 w-14 px-2 focus-visible:ring-0 text-right [appearance:textfield]"
            />
            <span className="text-gray-500 text-xs">%</span>
          </div>
        )}
        {benchmark.tipo === 'rendaFixa' && (
          <span className="text-gray-600 text-xs">22,5% → 20% → 17,5% → 15% sobre o lucro</span>
        )}
        {benchmark.tipo === 'isento' && (
          <span className="text-gray-600 text-xs">Sem incidencia de IR</span>
        )}
      </div>

      {/* Nota sobre projeção e IR */}
      <p className="text-gray-500 text-[11px] leading-relaxed mb-6 -mt-3 max-w-3xl">
        IR incide somente sobre o lucro e apenas no encerramento da operação (resgate);
        durante o período os valores são brutos. A taxa de juros é uma premissa — pode
        ser maior ou menor na prática. Este estudo é uma projeção baseada nos parâmetros informados.
      </p>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <TabsList className="bg-akiva-surface border border-akiva-border flex-shrink-0">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-akiva-blue data-[state=active]:text-akiva-gold text-gray-400 text-xs">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="comparativo" className="data-[state=active]:bg-akiva-blue data-[state=active]:text-akiva-gold text-gray-400 text-xs">
              Comparativo
            </TabsTrigger>
            {cenarioTabs.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="data-[state=active]:bg-akiva-blue data-[state=active]:text-akiva-gold text-gray-400 text-xs whitespace-nowrap">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <button
            onClick={handleAddCenario}
            className="flex-shrink-0 px-3 py-1.5 border border-dashed border-akiva-border rounded text-gray-500 hover:text-akiva-gold hover:border-akiva-gold/40 transition-colors text-xs"
          >
            + Cenario
          </button>
        </div>

        <TabsContent value="dashboard">
          <DashboardTab cenarios={estudo.cenarios} taxaVPL={estudo.taxaDescontoVPL} benchmark={benchmark} />
        </TabsContent>

        <TabsContent value="comparativo">
          <div className="bg-akiva-surface border border-akiva-border rounded-lg overflow-hidden">
            <CompareTab cenarios={estudo.cenarios} taxaVPL={estudo.taxaDescontoVPL} />
          </div>
        </TabsContent>

        {estudo.cenarios.map((c) => (
          <TabsContent key={c.id} value={c.id}>
            <CenarioTab
              cenario={c}
              taxaVPL={estudo.taxaDescontoVPL}
              benchmark={benchmark}
              onChange={handleCenarioChange}
              onRemove={() => handleCenarioRemove(c.id)}
              canRemove={estudo.cenarios.length > 1}
            />
          </TabsContent>
        ))}
      </Tabs>
    </AppShell>
  );
}
