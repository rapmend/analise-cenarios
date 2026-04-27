import type { Estudo, Cenario, Resultado } from '@/types';
import { calcular, fmt, GLOSSARIO } from '@/lib/calc';

interface PrintOptions {
  // reservado para extensoes futuras
}

function fmtPct(v: number) { return fmt(v, 'pct'); }
function fmtM(v: number) { return fmt(v, 'moeda0'); }

function parcelasHtml(r: Extract<Resultado, { tipo: 'parcelado' }>): string {
  return `
    <table class="parcelas-table">
      <thead><tr><th>Mes</th><th>Tipo</th><th>Valor</th><th>Acumulado</th><th>Saldo Devedor</th></tr></thead>
      <tbody>
        ${r.parcelas.map((p) => `
          <tr>
            <td>${p.mes === 0 ? 'M0' : 'M' + p.mes}</td>
            <td class="tipo-${p.tipo}">${p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)}</td>
            <td>${fmt(p.valor, 'moeda')}</td>
            <td>${fmt(p.acumulado, 'moeda')}</td>
            <td>${p.saldoApos > 0.005 ? fmt(p.saldoApos, 'moeda') : '--'}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function cenarioSection(c: Cenario, r: Resultado, taxaVPL: number): string {
  const tipo = c.tipo === 'avista' ? 'A Vista' : 'Parcelado';
  return `
    <div class="cenario-section">
      <h3>${c.nome} <span class="tag">${tipo}</span></h3>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Capital Aplicado</div><div class="kpi-val">${fmtM(r.valorInvestido)}</div></div>
        <div class="kpi"><div class="kpi-label">Valor Futuro</div><div class="kpi-val">${fmtM(r.valorFuturo)}</div></div>
        <div class="kpi"><div class="kpi-label">Lucro Liquido</div><div class="kpi-val ${r.lucroLiquido >= 0 ? 'pos' : 'neg'}">${fmtM(r.lucroLiquido)}</div></div>
        <div class="kpi"><div class="kpi-label">ROI Total</div><div class="kpi-val ${r.roi >= 0 ? 'pos' : 'neg'}">${fmtPct(r.roi)}</div></div>
        <div class="kpi"><div class="kpi-label">VPL (${fmtPct(taxaVPL)} a.a.)</div><div class="kpi-val ${r.vpl >= 0 ? 'pos' : 'neg'}">${fmtM(r.vpl)}</div></div>
        <div class="kpi"><div class="kpi-label">TIR (anual)</div><div class="kpi-val">${isNaN(r.tir) ? '--' : fmtPct(r.tir)}</div></div>
      </div>
      <div class="premissas">
        <div class="p-row"><span>Valor do Imovel</span><span>${fmtM(c.valorImovel)}</span></div>
        <div class="p-row"><span>Valorizacao Anual</span><span>${fmtPct(c.valorizAnual)}</span></div>
        <div class="p-row"><span>Periodo</span><span>${c.periodoMeses} meses</span></div>
        <div class="p-row"><span>Desconto</span><span>${fmtPct(c.taxaDesc)}</span></div>
        ${c.tipo === 'parcelado' ? `
          <div class="p-row"><span>Indexador</span><span>${c.indexador}</span></div>
          <div class="p-row"><span>Taxa Indexador projetada (mensal)</span><span>${fmtPct(c.taxaIndexador)}</span></div>
          <div class="p-row"><span>Tempo de Obra</span><span>${c.tempoObra} meses</span></div>
          <div class="p-row"><span>Entrada</span><span>${fmtPct(c.pctEntrada)}</span></div>
          <div class="p-row"><span>Durante a Obra</span><span>${fmtPct(c.pctObra)}</span></div>
        ` : ''}
      </div>
      ${r.tipo === 'parcelado' && r.parcelas.length > 0 ? parcelasHtml(r) : ''}
    </div>`;
}

function comparativoTableHtml(cenarios: Cenario[], resultados: Resultado[]): string {
  const ROWS: Array<{ label: string; key: string; fmt: 'moeda0' | 'pct'; source: 'cenario' | 'resultado'; best: boolean }> = [
    { label: 'Valor do Imovel',     key: 'valorImovel',    fmt: 'moeda0', source: 'cenario',   best: false },
    { label: 'Valorizacao Anual',   key: 'valorizAnual',   fmt: 'pct',    source: 'cenario',   best: false },
    { label: 'Capital Aplicado',    key: 'valorInvestido', fmt: 'moeda0', source: 'resultado', best: false },
    { label: 'Valor Futuro',        key: 'valorFuturo',    fmt: 'moeda0', source: 'resultado', best: false },
    { label: 'Lucro Bruto',         key: 'lucroBruto',     fmt: 'moeda0', source: 'resultado', best: true  },
    { label: 'Lucro Liquido',       key: 'lucroLiquido',   fmt: 'moeda0', source: 'resultado', best: true  },
    { label: 'ROI Total',           key: 'roi',            fmt: 'pct',    source: 'resultado', best: true  },
    { label: 'VPL',                 key: 'vpl',            fmt: 'moeda0', source: 'resultado', best: true  },
    { label: 'TIR (anual)',         key: 'tir',            fmt: 'pct',    source: 'resultado', best: true  },
  ];

  const headers = cenarios.map(c => `
    <th class="cmp-th">
      <div class="cmp-th-name">${c.nome}</div>
      <div class="cmp-th-sub">${c.tipo === 'avista' ? 'A Vista' : 'Parcelado'} · ${c.periodoMeses}m</div>
    </th>
  `).join('');

  const rows = ROWS.map(({ label, key, fmt: fmtTipo, source, best: hasBest }) => {
    const values = resultados.map((r, i) => {
      const c = cenarios[i];
      return source === 'cenario'
        ? (c[key as keyof Cenario] as number)
        : (r[key as keyof typeof r] as number);
    });
    const best = hasBest ? Math.max(...values) : null;
    const tds = values.map((v) => {
      const isBest = best !== null && v === best && values.filter(x => x === best).length === 1;
      const formatted = isNaN(v) ? '--' : fmt(v, fmtTipo);
      return `<td class="cmp-td ${isBest ? 'cmp-best' : ''}">${formatted}${isBest ? ' ★' : ''}</td>`;
    }).join('');
    return `<tr><td class="cmp-label">${label}</td>${tds}</tr>`;
  }).join('');

  return `
    <table class="cmp-table">
      <thead><tr><th class="cmp-th-label">Indicador</th>${headers}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p class="cmp-note">★ Melhor valor entre os cenarios para esse indicador.</p>
  `;
}

function glossarioHtml(): string {
  return Object.values(GLOSSARIO).map((g) => `
    <div class="gloss-item">
      <strong>${g.titulo}</strong>
      <p>${g.txt}</p>
    </div>`).join('');
}

export function printPdf(estudo: Estudo, clienteCodigo: string, _opts: PrintOptions = {}): void {
  const resultados = estudo.cenarios.map((c) => calcular(c, estudo.taxaDescontoVPL));
  const dataEmissao = new Date(estudo.dataEmissao).toLocaleDateString('pt-BR');

  const benchmark = estudo.benchmark;
  const irText =
    benchmark.tipo === 'rendaFixa' ? 'IR regressivo de renda fixa (22,5% até 6m · 20% de 7-12m · 17,5% de 13-24m · 15% acima de 24m)' :
    benchmark.tipo === 'isento'    ? 'isento de IR' :
    `IR fixo de ${fmtPct(benchmark.aliquotaIR)} sobre o lucro`;
  const disclaimerCusto = `<strong>Custo de oportunidade considerado:</strong> ${benchmark.nome} a ${fmtPct(estudo.taxaDescontoVPL)} a.a. — ${irText}.<br>` +
    `O IR incide <strong>somente sobre o lucro</strong> e <strong>apenas no encerramento da operação</strong> (resgate); durante o período os valores apresentados são brutos.<br>` +
    `A taxa de juros utilizada é uma <strong>premissa</strong> e pode resultar maior ou menor na prática. Este estudo é uma <strong>projeção</strong> baseada nos parâmetros informados, não constituindo garantia de retorno.`;

  const disclaimerPremissas = `<strong>Sobre as premissas deste estudo:</strong> as premissas adotadas (valorização anual, taxa de desconto/VPL, prazos, indexador, corretagem, IR e custo de oportunidade) são <strong>decisivas</strong> para tornar o projeto viável ou inviável — pequenas variações em qualquer uma delas podem inverter o resultado.<br>` +
    `Existe portanto <strong>sensibilidade</strong> e <strong>viés</strong> inerentes a essas estimativas. Recomenda-se explorar cenários alternativos e faixas de variação das premissas antes de qualquer decisão — o objetivo deste estudo é auxiliar a decisão do cliente, não garantir retorno.`;

  const sections = [
    { num: '1', title: 'Comparativo Numérico' },
    { num: '2', title: 'Cenários Detalhados' },
    { num: '3', title: 'Glossário de Indicadores' },
  ];

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>${estudo.nome}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;600&display=swap');
  @page {
    margin: 60px 50px 70px 50px;
    size: A4;
    @bottom-right {
      content: counter(page);
      color: #6b7f94;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
    }
    @bottom-left {
      content: "${estudo.nome.replace(/"/g, '\\"')} · ${clienteCodigo.replace(/"/g, '\\"')}";
      color: #6b7f94;
      font-size: 10px;
      font-family: 'Inter', sans-serif;
    }
  }
  @page :first {
    margin: 0;
    @bottom-right { content: ''; }
    @bottom-left { content: ''; }
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; font-size: 11px; line-height: 1.5; }

  .cover { background: #001226; color: #fff; min-height: 100vh; display: flex; flex-direction: column; padding: 60px 56px; }
  .cover-logo { font-family: 'EB Garamond', serif; color: #E0CA90; font-size: 32px; letter-spacing: 2px; margin-bottom: 8px; }
  .cover-sub { color: #8ba0b8; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
  .cover-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }
  .cover-title { font-family: 'EB Garamond', serif; font-size: 36px; color: #e8edf5; line-height: 1.2; margin-bottom: 12px; }
  .cover-cliente { color: #E0CA90; font-size: 16px; margin-bottom: 4px; letter-spacing: 1px; }
  .cover-date { color: #8ba0b8; font-size: 12px; }
  .cover-disclaimer { color: #c9d3df; font-size: 10px; line-height: 1.55; margin-top: 22px; padding: 12px 14px; background: rgba(224,202,144,0.06); border-left: 2px solid #E0CA90; border-radius: 0 4px 4px 0; }
  .cover-disclaimer strong { color: #E0CA90; font-weight: 600; }
  .cover-footer { color: #8ba0b8; font-size: 11px; border-top: 1px solid #1a3a5c; padding-top: 16px; }

  .page { page-break-before: always; }
  h2 { font-family: 'EB Garamond', serif; color: #003469; font-size: 22px; margin-bottom: 16px; }
  h3 { font-family: 'EB Garamond', serif; color: #001226; font-size: 18px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; }
  .tag { background: #003469; color: #E0CA90; font-size: 10px; font-family: 'Inter', sans-serif; padding: 2px 8px; border-radius: 4px; vertical-align: middle; }

  /* Índice */
  .toc-list { list-style: none; padding: 0; margin: 24px 0; }
  .toc-item { display: flex; align-items: baseline; padding: 12px 0; border-bottom: 1px dotted #d0d4dd; }
  .toc-num { color: #E0CA90; font-weight: 600; width: 30px; }
  .toc-title { color: #1a1a2e; font-size: 14px; flex: 1; }

  /* Comparativo */
  .cmp-table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
  .cmp-th-label, .cmp-th { padding: 10px 8px; text-align: center; border-bottom: 2px solid #003469; vertical-align: bottom; }
  .cmp-th-label { text-align: left; color: #6b7f94; font-weight: 600; }
  .cmp-th-name { color: #1a1a2e; font-weight: 600; line-height: 1.25; }
  .cmp-th-sub { color: #8893a8; font-size: 9px; font-weight: 400; margin-top: 3px; }
  .cmp-label { padding: 8px; color: #6b7f94; border-bottom: 1px solid #f0f0f0; }
  .cmp-td { padding: 8px; text-align: center; border-bottom: 1px solid #f0f0f0; font-weight: 500; font-variant-numeric: tabular-nums; }
  .cmp-best { color: #b5892a; font-weight: 700; }
  .cmp-note { color: #8893a8; font-size: 10px; margin-top: 10px; }

  /* Cenários */
  .cenario-section { margin-bottom: 36px; border: 1px solid #e0e4ed; border-radius: 8px; padding: 20px; page-break-inside: avoid; }
  .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .kpi { background: #f4f6fb; border-radius: 6px; padding: 10px 12px; }
  .kpi-label { color: #6b7f94; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
  .kpi-val { font-weight: 600; font-size: 15px; color: #1a1a2e; }
  .kpi-val.pos { color: #1a7a45; }
  .kpi-val.neg { color: #c0392b; }

  .premissas { border-top: 1px solid #e8e8e8; padding-top: 12px; margin-bottom: 14px; }
  .p-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid #f0f0f0; }
  .p-row span:first-child { color: #6b7f94; }
  .p-row span:last-child { font-weight: 500; }

  .parcelas-table { width: 100%; border-collapse: collapse; font-size: 9px; margin-top: 10px; }
  .parcelas-table th { background: #f4f6fb; padding: 6px 8px; text-align: center; color: #6b7f94; font-weight: 600; border-bottom: 2px solid #e0e4ed; }
  .parcelas-table td { padding: 4px 8px; text-align: center; border-bottom: 1px solid #f0f0f0; font-variant-numeric: tabular-nums; }
  .parcelas-table .tipo-entrada { color: #b5892a; font-weight: 600; }
  .parcelas-table .tipo-obra { color: #2a5b9e; }
  .parcelas-table .tipo-chaves { color: #1a7a45; font-weight: 600; }

  .gloss-item { margin-bottom: 16px; page-break-inside: avoid; }
  .gloss-item strong { color: #003469; font-size: 13px; display: block; margin-bottom: 4px; }
  .gloss-item p { color: #4a5568; line-height: 1.6; }

  @media print {
    .cover { page-break-after: always; }
    .cenario-section { page-break-inside: avoid; }
  }
</style>
</head>
<body>

<div class="cover">
  <div>
    <div class="cover-sub">Analise de Investimento Imobiliario</div>
  </div>
  <div class="cover-body">
    <div class="cover-title">${estudo.nome}</div>
    <div class="cover-cliente">${clienteCodigo}</div>
    <div class="cover-date">Emitido em ${dataEmissao}</div>
    <div class="cover-disclaimer">${disclaimerCusto}</div>
    <div class="cover-disclaimer">${disclaimerPremissas}</div>
  </div>
  <div class="cover-footer">
    Documento confidencial · Taxa de Desconto VPL: ${fmtPct(estudo.taxaDescontoVPL)} a.a.
  </div>
</div>

<div class="page">
  <h2>Índice</h2>
  <ul class="toc-list">
    ${sections.map(s => `<li class="toc-item"><span class="toc-num">${s.num}</span><span class="toc-title">${s.title}</span></li>`).join('')}
  </ul>
</div>

<div class="page">
  <h2>1. Comparativo Numérico</h2>
  ${comparativoTableHtml(estudo.cenarios, resultados)}
</div>

<div class="page">
  <h2>2. Cenários Detalhados</h2>
  ${estudo.cenarios.map((c, i) => cenarioSection(c, resultados[i], estudo.taxaDescontoVPL)).join('')}
</div>

<div class="page">
  <h2>3. Glossário de Indicadores</h2>
  ${glossarioHtml()}
</div>

</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.addEventListener('load', () => win.print());
}
