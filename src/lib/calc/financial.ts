export function calcVPL(cf: number[], taxaAnual: number): number {
  const rm = Math.pow(1 + taxaAnual, 1 / 12) - 1;
  return cf.reduce((acc, v, t) => acc + v / Math.pow(1 + rm, t), 0);
}

export function calcTIR(cf: number[]): number {
  const temPos = cf.some((v) => v > 0);
  const temNeg = cf.some((v) => v < 0);
  if (!temPos || !temNeg) return NaN;

  let r = 0.01;
  for (let it = 0; it < 200; it++) {
    let f = 0;
    let df = 0;
    for (let t = 0; t < cf.length; t++) {
      const d = Math.pow(1 + r, t);
      f += cf[t] / d;
      if (t > 0) df -= (t * cf[t]) / (d * (1 + r));
    }
    if (Math.abs(f) < 1e-6) break;
    if (df === 0 || !isFinite(df)) {
      r += 0.001;
      continue;
    }
    let nr = r - f / df;
    if (nr <= -0.99) nr = (r - 0.99) / 2;
    if (Math.abs(nr - r) < 1e-8) {
      r = nr;
      break;
    }
    r = nr;
  }
  return Math.pow(1 + r, 12) - 1;
}
