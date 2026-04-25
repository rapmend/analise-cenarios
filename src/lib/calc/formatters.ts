export function fmt(v: number | null | undefined, tipo: string): string {
  if (v === null || v === undefined || isNaN(v as number)) return '·';
  const neg = v < 0;
  const abs = Math.abs(v);
  switch (tipo) {
    case 'moeda':
      return (neg ? '-' : '') + 'R$ ' + abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    case 'moeda0':
      return (neg ? '-' : '') + 'R$ ' + abs.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    case 'pct':
      return (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
    case 'pct4':
      return (v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) + '%';
    case 'int':
      return Math.round(v).toString();
    default:
      return v.toString();
  }
}

export function fmtK(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return (v < 0 ? '-' : '') + 'R$ ' + (abs / 1_000_000).toFixed(1) + 'M';
  if (abs >= 1_000) return (v < 0 ? '-' : '') + 'R$ ' + (abs / 1_000).toFixed(0) + 'k';
  return fmt(v, 'moeda0');
}

export function parseInput(s: string, tipo: string): number {
  const limpo = s.replace(/[R$\s.]/g, '').replace(',', '.').replace('%', '');
  const n = parseFloat(limpo);
  if (isNaN(n)) return 0;
  if (tipo === 'pct' || tipo === 'pct4') return n / 100;
  return n;
}
