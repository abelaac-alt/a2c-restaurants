import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { LE, STREAMLINES, TE, Streamline, lowerSurface, pointAtTime, upperSurface } from "./geometry";

export const C = {
  bg1: "#081a33",
  bg2: "#123562",
  text: "#f4f7fb",
  muted: "#9db5d6",
  lift: "#4fd1c5",
  weight: "#f6ad55",
  thrust: "#63b3ed",
  drag: "#fc8181",
  low: "#60a5fa",
  high: "#f87171",
  wing: "#e8eef7",
  flow: "#7fb2ff",
};

export const FONT = "Inter, 'DejaVu Sans', sans-serif";

export const Background: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg1} 0%, ${C.bg2} 100%)`, fontFamily: FONT }}>
    {children}
  </AbsoluteFill>
);

// Fundido de entrada y salida de cada escena
export const SceneFade: React.FC<{ duration: number; children: React.ReactNode }> = ({ duration, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

export const appear = (frame: number, start: number, len = 15) =>
  interpolate(frame, [start, start + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const SceneTitle: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => {
  const f = useCurrentFrame();
  const a = appear(f, 4, 18);
  return (
    <div
      style={{
        position: "absolute",
        top: 56,
        left: 80,
        display: "flex",
        alignItems: "center",
        gap: 22,
        opacity: a,
        transform: `translateY(${(1 - a) * -20}px)`,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          border: `3px solid ${C.lift}`,
          color: C.lift,
          fontSize: 30,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {n}
      </div>
      <div style={{ color: C.text, fontSize: 46, fontWeight: 700, letterSpacing: -0.5 }}>{children}</div>
    </div>
  );
};

// Subtítulos: cada línea aparece en su fotograma y sustituye a la anterior
export const Captions: React.FC<{ lines: { at: number; text: React.ReactNode }[] }> = ({ lines }) => {
  const f = useCurrentFrame();
  let idx = -1;
  lines.forEach((l, i) => {
    if (f >= l.at) idx = i;
  });
  if (idx < 0) return null;
  const l = lines[idx];
  const a = appear(f, l.at, 12);
  return (
    <div
      style={{
        position: "absolute",
        bottom: 64,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: a,
        transform: `translateY(${(1 - a) * 16}px)`,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          textAlign: "center",
          color: C.text,
          fontSize: 44,
          fontWeight: 500,
          lineHeight: 1.3,
          background: "rgba(4, 14, 30, 0.62)",
          padding: "18px 40px",
          borderRadius: 18,
        }}
      >
        {l.text}
      </div>
    </div>
  );
};

// Flecha SVG que crece desde (x, y) en la dirección (dx, dy) normalizada
export const Arrow: React.FC<{
  x: number;
  y: number;
  dx: number;
  dy: number;
  len: number;
  color: string;
  width?: number;
  label?: string;
  labelPos?: "end" | "side";
  labelAnchor?: "start" | "middle" | "end";
  labelOffset?: [number, number];
  fontSize?: number;
}> = ({ x, y, dx, dy, len, color, width = 12, label, labelAnchor = "middle", labelOffset = [0, 0], fontSize = 34 }) => {
  if (len < 2) return null;
  const n = Math.hypot(dx, dy);
  const ux = dx / n;
  const uy = dy / n;
  const head = Math.min(width * 3, len * 0.6);
  const ex = x + ux * len;
  const ey = y + uy * len;
  const bx = ex - ux * head;
  const by = ey - uy * head;
  const px = -uy;
  const py = ux;
  const hw = width * 1.7;
  return (
    <g>
      <line x1={x} y1={y} x2={bx} y2={by} stroke={color} strokeWidth={width} strokeLinecap="round" />
      <polygon points={`${ex},${ey} ${bx + px * hw},${by + py * hw} ${bx - px * hw},${by - py * hw}`} fill={color} />
      {label ? (
        <text
          x={ex + ux * 26 + labelOffset[0]}
          y={ey + uy * 26 + labelOffset[1]}
          fill={color}
          fontSize={fontSize}
          fontWeight={700}
          textAnchor={labelAnchor}
          dominantBaseline="middle"
          fontFamily={FONT}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
};

// Silueta lateral de un avión de pasajeros, morro a la derecha. Caja 400 x 130, centro en (200, 70).
export const Plane: React.FC<{ x: number; y: number; scale?: number; rotate?: number }> = ({
  x,
  y,
  scale = 1,
  rotate = 0,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale}) translate(-200 -70)`}>
    <path d="M40,50 L12,0 L52,0 L110,50 Z" fill="#c9d6e8" />
    <path
      d="M24,58 C30,50 50,48 80,48 L300,48 C338,48 366,56 388,68 C396,72 396,76 388,80 C366,90 338,94 300,94 L80,94 C52,94 34,88 26,80 C18,72 18,64 24,58 Z"
      fill="#f4f7fb"
    />
    <path d="M24,80 C34,88 52,94 80,94 L300,94 C338,94 366,90 388,80 L380,84 C360,92 336,96 300,96 L80,96 C50,96 32,90 24,80 Z" fill="#b8c7dc" />
    <path d="M18,64 L66,60 L82,68 L22,72 Z" fill="#9fb1c9" />
    <path d="M152,76 L256,76 L196,124 L170,124 Z" fill="#9fb1c9" />
    <rect x={176} y={96} width={60} height={20} rx={10} fill="#7f93b0" />
    <path d="M348,58 L376,66 L366,69 L344,64 Z" fill="#2b4c7e" />
    {Array.from({ length: 14 }, (_, i) => (
      <circle key={i} cx={110 + i * 16} cy={64} r={4} fill="#2b4c7e" />
    ))}
    <rect x={24} y={70} width={340} height={4} fill={C.thrust} opacity={0.8} />
  </g>
);

export const Clouds: React.FC<{ speed?: number; opacity?: number }> = ({ speed = 2, opacity = 0.12 }) => {
  const f = useCurrentFrame();
  const clouds = [
    { x: 200, y: 180, s: 1.2 },
    { x: 900, y: 120, s: 0.8 },
    { x: 1500, y: 260, s: 1.0 },
    { x: 600, y: 820, s: 1.4 },
    { x: 1300, y: 900, s: 0.9 },
    { x: 1900, y: 700, s: 1.1 },
  ];
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {clouds.map((c, i) => {
        const x = ((((c.x - f * speed * c.s) % 2300) + 2300) % 2300) - 200;
        return (
          <g key={i} transform={`translate(${x} ${c.y}) scale(${c.s})`} opacity={opacity}>
            <ellipse cx={0} cy={0} rx={110} ry={34} fill="#fff" />
            <ellipse cx={-40} cy={-22} rx={56} ry={36} fill="#fff" />
            <ellipse cx={34} cy={-28} rx={64} ry={42} fill="#fff" />
          </g>
        );
      })}
    </svg>
  );
};

// ---------- Vista del perfil alar ----------
export const WING = { x0: 640, cy: 470, S: 680 };
export const toSvg = (x: number, y: number): [number, number] => [WING.x0 + x * WING.S, WING.cy - y * WING.S];

const pathFrom = (pts: [number, number][]) =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"}${toSvg(p[0], p[1]).join(",")}`).join(" ");

export const airfoilPath = () => {
  const up = upperSurface.map((p) => toSvg(p[0], p[1]));
  const lo = [...lowerSurface].reverse().map((p) => toSvg(p[0], p[1]));
  return [...up, ...lo].map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ") + " Z";
};

export const Airfoil: React.FC<{ draw?: number; glow?: boolean }> = ({ draw = 1 }) => (
  <g>
    <path
      d={airfoilPath()}
      fill={C.wing}
      fillOpacity={draw}
      stroke="#ffffff"
      strokeWidth={3}
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - draw}
    />
  </g>
);

const streamPaths = STREAMLINES.map((s) => pathFrom(s.pts));

export const FlowLines: React.FC<{ opacity?: number; reveal?: number; highlightDown?: boolean }> = ({
  opacity = 1,
  reveal = 1,
}) => (
  <g opacity={opacity}>
    {streamPaths.map((d, i) => (
      <path
        key={i}
        d={d}
        fill="none"
        stroke={C.flow}
        strokeOpacity={0.35}
        strokeWidth={2.5}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - reveal}
      />
    ))}
  </g>
);

const RATE = 1 / 45; // unidades de cuerda por fotograma
const SPACING = 0.11;

export const FlowDots: React.FC<{ opacity?: number; tint?: boolean }> = ({ opacity = 1, tint = false }) => {
  const f = useCurrentFrame();
  return (
    <g opacity={opacity}>
      {STREAMLINES.map((s: Streamline, li) => {
        const total = s.cumTime[s.cumTime.length - 1];
        const n = Math.ceil(total / SPACING);
        const color = tint ? (s.upper ? C.low : C.high) : "#cfe2ff";
        return Array.from({ length: n }, (_, k) => {
          const t = (f * RATE + k * SPACING + li * 0.037) % total;
          const p = pointAtTime(s, t);
          if (!p) return null;
          const [x, y] = toSvg(p[0], p[1]);
          return <circle key={`${li}-${k}`} cx={x} cy={y} r={5} fill={color} />;
        });
      })}
    </g>
  );
};

export const leSvg = () => toSvg(LE[0], LE[1]);
export const teSvg = () => toSvg(TE[0], TE[1]);

export const usePop = (start: number) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - start, fps, config: { damping: 14 } });
};
