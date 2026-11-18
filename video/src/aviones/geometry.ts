// Perfil alar NACA 4412 y un modelo sencillo de líneas de corriente.
// Unidades: cuerda = 1, y positiva hacia arriba, marco del viento (horizontal).

export const AOA = (8 * Math.PI) / 180; // ángulo de ataque
const M = 0.04;
const P = 0.4;
const T = 0.13;

const camber = (x: number) =>
  x < P ? (M / (P * P)) * (2 * P * x - x * x) : (M / ((1 - P) * (1 - P))) * (1 - 2 * P + 2 * P * x - x * x);

const thickness = (x: number) =>
  5 * T * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);

// Gira el perfil alrededor de 1/4 de cuerda (morro arriba).
const rot = (x: number, y: number): [number, number] => {
  const dx = x - 0.25;
  const c = Math.cos(AOA);
  const s = Math.sin(AOA);
  return [0.25 + dx * c + y * s, -dx * s + y * c];
};

const N = 120;
const xs = Array.from({ length: N + 1 }, (_, i) => 0.5 * (1 - Math.cos((Math.PI * i) / N)));

export const upperSurface: [number, number][] = xs.map((x) => rot(x, camber(x) + thickness(x)));
export const lowerSurface: [number, number][] = xs.map((x) => rot(x, camber(x) - thickness(x)));

export const LE = rot(0, 0);
export const TE = rot(1, 0);

const interp = (pts: [number, number][], x: number) => {
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[i + 1];
    if ((x >= x0 && x <= x1) || (x <= x0 && x >= x1)) {
      const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return null;
};

// Envolvente que siguen las líneas: corriente ascendente delante, superficie, deflexión hacia abajo detrás.
const envelope = (x: number, upper: boolean) => {
  if (x <= LE[0]) return LE[1] * Math.exp((x - LE[0]) / 0.35);
  if (x >= TE[0]) return TE[1] - 0.1 * (1 - Math.exp(-(x - TE[0]) / 0.35));
  const y = interp(upper ? upperSurface : lowerSurface, x);
  return y ?? 0;
};

export const X_MIN = -0.9;
export const X_MAX = 1.9;
const GRID = 280;
const gx = Array.from({ length: GRID + 1 }, (_, i) => X_MIN + ((X_MAX - X_MIN) * i) / GRID);

const blur = (arr: number[], sigma: number) => {
  const step = (X_MAX - X_MIN) / GRID;
  const r = Math.ceil((3 * sigma) / step);
  return arr.map((_, i) => {
    let s = 0;
    let w = 0;
    for (let k = -r; k <= r; k++) {
      const j = Math.min(arr.length - 1, Math.max(0, i + k));
      const wk = Math.exp(-((k * step) ** 2) / (2 * sigma * sigma));
      s += arr[j] * wk;
      w += wk;
    }
    return s / w;
  });
};

export type Streamline = {
  y0: number;
  upper: boolean;
  pts: [number, number][];
  cumTime: number[]; // tiempo acumulado para recorrer la línea (velocidad local variable)
};

export const makeStreamline = (y0: number): Streamline => {
  const upper = y0 > 0;
  const f = Math.exp(-Math.abs(y0) / 0.55);
  const env = gx.map((x) => envelope(x, upper));
  const smooth = blur(env, 0.03 + Math.abs(y0) * 0.5);
  const pts: [number, number][] = gx.map((x, i) => [x, y0 + f * smooth[i]]);
  // velocidad local: más rápida por encima del ala, más lenta por debajo
  const k = upper ? 1.1 : -0.35;
  const speed = (x: number) => 1 + k * f * Math.exp(-(((x - 0.35) / 0.45) ** 2));
  const cumTime = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    cumTime.push(cumTime[i - 1] + dx / speed((pts[i][0] + pts[i - 1][0]) / 2));
  }
  return { y0, upper, pts, cumTime };
};

// Posición sobre la línea tras un tiempo t (en unidades de cuerda / velocidad libre).
export const pointAtTime = (s: Streamline, t: number): [number, number] | null => {
  const ct = s.cumTime;
  if (t < 0 || t > ct[ct.length - 1]) return null;
  let lo = 0;
  let hi = ct.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (ct[mid] < t) lo = mid;
    else hi = mid;
  }
  const a = (t - ct[lo]) / (ct[hi] - ct[lo] || 1);
  return [s.pts[lo][0] + a * (s.pts[hi][0] - s.pts[lo][0]), s.pts[lo][1] + a * (s.pts[hi][1] - s.pts[lo][1])];
};

export const STREAM_Y0 = [-0.86, -0.62, -0.42, -0.26, -0.14, -0.06, 0.06, 0.14, 0.26, 0.42, 0.62, 0.86];
export const STREAMLINES = STREAM_Y0.map(makeStreamline);
