import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";
import {
  Airfoil,
  Arrow,
  Background,
  C,
  Captions,
  Clouds,
  FONT,
  FlowDots,
  FlowLines,
  Plane,
  SceneTitle,
  appear,
  leSvg,
  teSvg,
  toSvg,
  usePop,
} from "./components";
import { AOA, STREAMLINES, lowerSurface, pointAtTime, upperSurface } from "./geometry";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1080;
const H = 1920;

export type Cue = { id: string; at: number; dur: number; text: string };
export type SceneProps = { cues: Cue[]; dur: number; liftoff?: number };

// Resalta palabras clave en los subtítulos
const KEY: Record<string, string> = {
  sustentación: C.lift,
  peso: C.weight,
  empuje: C.thrust,
  resistencia: C.drag,
};
const highlight = (text: string): React.ReactNode =>
  text.split(/(sustentación|peso|empuje|resistencia)/gi).map((part, i) => {
    const color = KEY[part.toLowerCase()];
    return color ? (
      <span key={i} style={{ color, fontWeight: 800 }}>
        {part}
      </span>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    );
  });
const SceneCaptions: React.FC<{ cues: Cue[] }> = ({ cues }) => (
  <Captions lines={cues.map((c) => ({ at: c.at, text: highlight(c.text) }))} />
);

// ---------- 1. Título ----------
export const TitleScene: React.FC<SceneProps> = ({ cues, dur }) => {
  const f = useCurrentFrame();
  const px = interpolate(f, [0, dur], [-250, 1330], { easing: Easing.inOut(Easing.quad) });
  const a = appear(f, 6, 22);
  const b = appear(f, 30, 22);
  return (
    <Background>
      <Clouds speed={3} opacity={0.14} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Plane x={px} y={620 + Math.sin(f / 12) * 8} scale={1} rotate={-4} />
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 70px" }}>
        <div
          style={{
            color: C.text,
            fontSize: 112,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.02,
            textAlign: "center",
            opacity: a,
            transform: `translateY(${(1 - a) * 30}px)`,
          }}
        >
          ¿Por qué vuelan los aviones?
        </div>
        <div style={{ color: C.muted, fontSize: 44, marginTop: 30, opacity: b, textAlign: "center" }}>
          La física de la sustentación, paso a paso
        </div>
      </AbsoluteFill>
      <SceneCaptions cues={cues} />
    </Background>
  );
};

// ---------- 2. Las cuatro fuerzas ----------
export const ForcesScene: React.FC<SceneProps> = ({ cues }) => {
  const f = useCurrentFrame();
  const cx = 520;
  const cy = 830;
  const bob = Math.sin(f / 18) * 6;
  const grow = (start: number) => appear(f, start, 22);
  const [c0, c1, c2] = cues;
  const tLift = c0.at + 10;
  const tWeight = c0.at + Math.round(c0.dur * 0.5);
  const tThrust = c1.at + 5;
  const tDrag = c1.at + Math.round(c1.dur * 0.6);
  const emph = appear(f, c2.at + Math.round(c2.dur * 0.45), 15);
  return (
    <Background>
      <Clouds speed={4} />
      <SceneTitle n={1}>Las cuatro fuerzas del vuelo</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <g transform={`translate(0 ${bob})`}>
          <Plane x={cx} y={cy} scale={0.95} />
          <Arrow
            x={cx}
            y={cy - 30}
            dx={0}
            dy={-1}
            len={(200 + 30 * emph) * grow(tLift)}
            width={12 + 4 * emph}
            color={C.lift}
            label="Sustentación"
            fontSize={38}
          />
          <Arrow x={cx} y={cy + 50} dx={0} dy={1} len={180 * grow(tWeight)} color={C.weight} label="Peso" fontSize={38} />
          <Arrow
            x={cx + 200}
            y={cy + 4}
            dx={1}
            dy={0}
            len={120 * grow(tThrust)}
            color={C.thrust}
            label="Empuje"
            labelOffset={[-90, -66]}
            fontSize={34}
          />
          <Arrow
            x={cx - 200}
            y={cy + 4}
            dx={-1}
            dy={0}
            len={120 * grow(tDrag)}
            color={C.drag}
            label="Resistencia"
            labelOffset={[80, -66]}
            fontSize={34}
          />
        </g>
      </svg>
      <SceneCaptions cues={cues} />
    </Background>
  );
};

// ---------- 3. El ala desvía el aire ----------
export const WingScene: React.FC<SceneProps> = ({ cues }) => {
  const f = useCurrentFrame();
  const [c0, c1, c2] = cues;
  const draw = appear(f, c0.at, 40);
  const labels = appear(f, c0.at + 35, 20);
  const aoa = appear(f, c1.at + 10, 20);
  const flow = appear(f, c2.at - 5, 45);
  const dots = appear(f, c2.at + 15, 30);
  const [lx, ly] = leSvg();
  const [tx, ty] = teSvg();
  const r = 300;
  const arc = `M${lx + r},${ly} A${r},${r} 0 0 1 ${lx + r * Math.cos(AOA)},${ly + r * Math.sin(AOA)}`;
  return (
    <Background>
      <SceneTitle n={2}>La forma del ala</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <FlowLines reveal={flow} />
        <FlowDots opacity={dots} />
        <Airfoil draw={draw} />
        <g opacity={labels * (1 - flow * 0.7)} fontFamily={FONT}>
          <circle cx={lx} cy={ly} r={10} fill={C.weight} />
          <text x={lx} y={ly - 120} fill={C.text} fontSize={34} textAnchor="middle">
            Borde de ataque
          </text>
          <line x1={lx} y1={ly - 100} x2={lx} y2={ly - 16} stroke={C.text} strokeWidth={2} />
          <circle cx={tx} cy={ty} r={10} fill={C.weight} />
          <text x={tx - 40} y={ty + 110} fill={C.text} fontSize={34} textAnchor="middle">
            Borde de salida
          </text>
          <line x1={tx} y1={ty + 16} x2={tx - 20} y2={ty + 78} stroke={C.text} strokeWidth={2} />
        </g>
        <g opacity={aoa * (1 - flow * 0.75)} fontFamily={FONT}>
          <line x1={lx - 200} y1={ly} x2={W} y2={ly} stroke={C.muted} strokeWidth={3} strokeDasharray="12 10" />
          <line
            x1={lx}
            y1={ly}
            x2={tx + 80 * Math.cos(AOA)}
            y2={ty + 80 * Math.sin(AOA)}
            stroke={C.lift}
            strokeWidth={3}
            strokeDasharray="12 10"
          />
          <path d={arc} fill="none" stroke={C.lift} strokeWidth={5} />
          <text x={lx + r + 30} y={ly + 70} fill={C.lift} fontSize={36} fontWeight={700}>
            Ángulo de ataque
          </text>
          <text x={lx - 190} y={ly - 16} fill={C.muted} fontSize={32}>
            aire →
          </text>
        </g>
      </svg>
      <SceneCaptions cues={cues} />
    </Background>
  );
};

// ---------- 4. Diferencia de presión ----------
const normalArrows = (surface: [number, number][], upper: boolean) => {
  const out: { x: number; y: number; dx: number; dy: number; mag: number }[] = [];
  [0.06, 0.14, 0.24, 0.36, 0.5, 0.65, 0.8].forEach((p) => {
    const i = Math.round(p * (surface.length - 1));
    const [x0, y0] = toSvg(...surface[i - 1]);
    const [x1, y1] = toSvg(...surface[i + 1]);
    const [x, y] = toSvg(...surface[i]);
    let nx = y1 - y0;
    let ny = -(x1 - x0);
    const n = Math.hypot(nx, ny);
    nx /= n;
    ny /= n;
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }
    const mag = upper
      ? 85 * Math.exp(-(((p - 0.15) / 0.35) ** 2)) + 22
      : 50 * Math.exp(-(((p - 0.35) / 0.5) ** 2)) + 14;
    out.push({ x, y, dx: nx, dy: ny, mag });
  });
  return out;
};
const UP_ARROWS = normalArrows(upperSurface, true);
const LO_ARROWS = normalArrows(lowerSurface, false);

export const PressureScene: React.FC<SceneProps> = ({ cues }) => {
  const f = useCurrentFrame();
  const [c0, c1, c2, c3] = cues;
  const low = appear(f, c0.at + 5, 30);
  const high = appear(f, c1.at + 5, 30);
  const surf = appear(f, c2.at + 5, 25);
  const lift = usePop(c3.at + Math.round(c3.dur * 0.55));
  const [cx] = toSvg(0.4, 0);
  const cyUp = toSvg(0, 0.2)[1];
  const cyLo = toSvg(0, -0.18)[1];
  const [ax, ay] = toSvg(0.3, 0.12);
  return (
    <Background>
      <SceneTitle n={3}>Arriba poca presión, abajo mucha</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="low">
            <stop offset="0%" stopColor={C.low} stopOpacity={0.55} />
            <stop offset="100%" stopColor={C.low} stopOpacity={0} />
          </radialGradient>
          <radialGradient id="high">
            <stop offset="0%" stopColor={C.high} stopOpacity={0.45} />
            <stop offset="100%" stopColor={C.high} stopOpacity={0} />
          </radialGradient>
        </defs>
        <FlowLines opacity={0.6} />
        <FlowDots tint opacity={0.55} />
        <ellipse cx={cx - 20} cy={cyUp - 20} rx={460} ry={200} fill="url(#low)" opacity={low} />
        <ellipse cx={cx} cy={cyLo + 10} rx={440} ry={170} fill="url(#high)" opacity={high} />
        <Airfoil />
        <g opacity={low} fontFamily={FONT}>
          {[-280, -150, 140, 270].map((dx, i) => (
            <text key={i} x={cx + dx - 40} y={cyUp - 20 + (i % 2) * 40} fill={C.low} fontSize={60} fontWeight={800} textAnchor="middle">
              −
            </text>
          ))}
          <text x={W / 2 - 40} y={cyUp - 250} fill={C.low} fontSize={40} fontWeight={700} textAnchor="middle">
            Presión baja · aire más rápido
          </text>
        </g>
        <g opacity={high} fontFamily={FONT}>
          {[-220, -80, 60, 200].map((dx, i) => (
            <text key={i} x={cx + dx} y={cyLo + 40 + (i % 2) * 30} fill={C.high} fontSize={54} fontWeight={800} textAnchor="middle">
              +
            </text>
          ))}
          <text x={W / 2 - 40} y={cyLo + 170} fill={C.high} fontSize={40} fontWeight={700} textAnchor="middle">
            Presión alta · aire más lento
          </text>
        </g>
        <g opacity={surf}>
          {UP_ARROWS.map((a, i) => (
            <Arrow key={`u${i}`} x={a.x} y={a.y} dx={a.dx} dy={a.dy} len={a.mag * surf} color={C.low} width={5} />
          ))}
          {LO_ARROWS.map((a, i) => (
            <Arrow
              key={`l${i}`}
              x={a.x - a.dx * (a.mag + 6)}
              y={a.y - a.dy * (a.mag + 6)}
              dx={a.dx}
              dy={a.dy}
              len={a.mag * surf}
              color={C.high}
              width={5}
            />
          ))}
        </g>
        <Arrow x={ax} y={ay} dx={0} dy={-1} len={190 * lift} color={C.lift} width={16} label="Sustentación" labelAnchor="start" labelOffset={[30, 40]} fontSize={42} />
      </svg>
      <SceneCaptions cues={cues} />
    </Background>
  );
};

// ---------- 5. Acción y reacción ----------
export const NewtonScene: React.FC<SceneProps> = ({ cues }) => {
  const f = useCurrentFrame();
  const [c0, c1, c2] = cues;
  const down = appear(f, c0.at + 10, 30);
  const up = usePop(c1.at + Math.round(c1.dur * 0.5));
  const eq = appear(f, c2.at, 20);
  const [tx, ty] = teSvg();
  const [ax, ay] = toSvg(0.3, 0.12);
  return (
    <Background>
      <SceneTitle n={4}>Acción y reacción</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <FlowLines opacity={0.8} />
        <FlowDots />
        <Airfoil />
        <g opacity={down}>
          {[0, 1, 2].map((i) => (
            <Arrow key={i} x={tx - 10 + i * 80} y={ty + 30 + i * 18} dx={0.45} dy={1} len={140 * down} color={C.weight} width={10} />
          ))}
          <text x={W / 2 + 60} y={ty + 205} fill={C.weight} fontSize={38} fontWeight={700} textAnchor="middle" fontFamily={FONT}>
            El ala empuja el aire hacia abajo
          </text>
        </g>
        <Arrow x={ax} y={ay} dx={0} dy={-1} len={240 * up} color={C.lift} width={16} />
        <text x={W / 2} y={ay - 290} fill={C.lift} fontSize={38} fontWeight={700} textAnchor="middle" fontFamily={FONT} opacity={up}>
          El aire empuja el ala hacia arriba
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 150,
          top: 360,
          textAlign: "center",
          color: C.text,
          fontSize: 38,
          fontWeight: 600,
          opacity: eq,
          background: "rgba(79, 209, 197, 0.12)",
          border: `2px solid ${C.lift}`,
          borderRadius: 14,
          padding: "14px 20px",
        }}
      >
        3.ª ley de Newton: acción = reacción
      </div>
      <SceneCaptions cues={cues} />
    </Background>
  );
};

// ---------- 6. El mito del tiempo de tránsito ----------
const MYTH_UP = STREAMLINES.find((s) => s.y0 === 0.06)!;
const MYTH_LO = STREAMLINES.find((s) => s.y0 === -0.06)!;
const timeAtX = (s: typeof MYTH_UP, x: number) => {
  const i = s.pts.findIndex((p) => p[0] >= x);
  return s.cumTime[Math.max(0, i)];
};
const START_X = -0.3;

export const MythScene: React.FC<SceneProps> = ({ cues }) => {
  const f = useCurrentFrame();
  const [c0, c1, c2] = cues;
  const start = c1.at + c1.dur - 5;
  const tt = Math.max(0, (f - start) / 55);
  const stamp = usePop(c2.at + 8);
  const badge = appear(f, c0.at, 15);
  const show = appear(f, c1.at, 15);
  const markers = [MYTH_UP, MYTH_LO].map((s) => {
    const t0 = timeAtX(s, START_X);
    const trail: string[] = [];
    for (let k = 0; k <= 40; k++) {
      const p = pointAtTime(s, t0 + (tt * k) / 40);
      if (p) trail.push(toSvg(p[0], p[1]).join(","));
    }
    const p = pointAtTime(s, t0 + tt);
    return { s, trail, p: p ? toSvg(p[0], p[1]) : null };
  });
  const [tx, ty] = teSvg();
  const [sx] = toSvg(START_X, 0);
  return (
    <Background>
      <SceneTitle n={5}>Un mito muy extendido</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <FlowLines opacity={0.5} />
        <Airfoil />
        <g opacity={show} fontFamily={FONT}>
          <line x1={sx} y1={ty - 330} x2={sx} y2={ty + 200} stroke={C.muted} strokeWidth={2} strokeDasharray="8 8" />
          <text x={sx + 6} y={ty + 240} fill={C.muted} fontSize={30} textAnchor="middle">
            salida
          </text>
          <line x1={tx} y1={ty - 330} x2={tx} y2={ty + 200} stroke={C.muted} strokeWidth={2} strokeDasharray="8 8" />
          <text x={tx} y={ty + 240} fill={C.muted} fontSize={30} textAnchor="middle">
            borde de salida
          </text>
          {markers.map((m, i) => (
            <g key={i}>
              <polyline points={m.trail.join(" ")} fill="none" stroke={m.s.upper ? C.low : C.high} strokeWidth={7} strokeOpacity={0.65} />
              {m.p ? <circle cx={m.p[0]} cy={m.p[1]} r={16} fill={m.s.upper ? C.low : C.high} stroke="#fff" strokeWidth={3} /> : null}
            </g>
          ))}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 150,
          top: 350,
          opacity: badge,
          background: "rgba(4, 14, 30, 0.75)",
          borderRadius: 16,
          padding: "22px 28px",
          color: C.text,
          fontSize: 34,
          lineHeight: 1.35,
        }}
      >
        <div style={{ color: C.weight, fontWeight: 800, fontSize: 28, letterSpacing: 2, marginBottom: 8 }}>MITO</div>
        «El aire de arriba va más rápido para reencontrarse con el de abajo al final del ala.»
        <div
          style={{
            position: "absolute",
            right: 24,
            bottom: -72,
            transform: `rotate(-10deg) scale(${stamp})`,
            border: `5px solid ${C.drag}`,
            color: C.drag,
            fontWeight: 900,
            fontSize: 58,
            padding: "2px 22px",
            borderRadius: 10,
            background: "rgba(8, 26, 51, 0.92)",
          }}
        >
          FALSO
        </div>
      </div>
      <SceneCaptions cues={cues} />
    </Background>
  );
};

// ---------- 7. Velocidad y despegue ----------
const V_LIFT = 250;

export const TakeoffScene: React.FC<SceneProps> = ({ cues, liftoff }) => {
  const f = useCurrentFrame();
  const fStart = cues[0].at;
  const fLift = liftoff ?? fStart + 200;
  // la velocidad llega a V_LIFT justo en el despegue y sigue subiendo
  const speedAt = (k: number) => {
    if (k <= fStart) return 0;
    const u = (k - fStart) / (fLift - fStart);
    return Math.min(300, V_LIFT * u * u);
  };
  const v = speedAt(f);
  let dist = 0;
  for (let k = 0; k <= f; k++) dist += speedAt(k) * 0.09;
  const air = Math.max(0, f - fLift);
  const climb = Math.min(520, 0.07 * air * air);
  const pitch = -interpolate(air, [0, 20], [0, 10], clamp);
  const groundY = 1250;
  const px = 470;
  const py = groundY - 92 - climb;
  const weight = 160;
  const lift = Math.min(250, weight * (v / V_LIFT) ** 2);
  const won = f >= fLift;
  const gear = interpolate(air, [25, 45], [1, 0], clamp);
  return (
    <Background>
      <SceneTitle n={6}>Hace falta velocidad</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <rect x={0} y={groundY} width={W} height={H - groundY} fill="#0d2440" />
        <rect x={0} y={groundY} width={W} height={70} fill="#24364f" />
        {Array.from({ length: 10 }, (_, i) => {
          const x = ((((i * 180 - dist) % 1800) + 1800) % 1800) - 300;
          return <rect key={i} x={x} y={groundY + 31} width={90} height={8} fill="#e8eef7" opacity={0.8} />;
        })}
        <g transform={`translate(${px} ${py}) rotate(${pitch})`}>
          <g opacity={gear}>
            <rect x={-6} y={40} width={8} height={40} fill="#7f93b0" />
            <circle cx={-2} cy={84} r={12} fill="#1b2a3f" stroke="#7f93b0" strokeWidth={3} />
            <rect x={180} y={40} width={8} height={40} fill="#7f93b0" />
            <circle cx={184} cy={84} r={10} fill="#1b2a3f" stroke="#7f93b0" strokeWidth={3} />
          </g>
          <Plane x={0} y={0} scale={1.3} />
        </g>
        <Arrow x={px} y={py - 50} dx={0} dy={-1} len={lift} color={C.lift} label="Sustentación" labelAnchor="start" labelOffset={[24, 30]} fontSize={38} />
        <Arrow
          x={px}
          y={py + 70}
          dx={0}
          dy={1}
          len={weight * appear(f, 8, 20)}
          color={C.weight}
          label="Peso"
          labelAnchor="start"
          labelOffset={[24, -40]}
          fontSize={38}
        />
      </svg>
      <div style={{ position: "absolute", left: 70, top: 370, fontFamily: FONT }}>
        <div style={{ color: C.muted, fontSize: 32 }}>velocidad</div>
        <div style={{ color: C.text, fontSize: 110, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
          {Math.round(v)} <span style={{ fontSize: 44, color: C.muted }}>km/h</span>
        </div>
        <div style={{ color: won ? C.lift : C.muted, fontSize: 38, fontWeight: 700, marginTop: 10 }}>
          {won ? "Sustentación > peso" : "Sustentación < peso"}
        </div>
      </div>
      <SceneCaptions cues={cues} />
    </Background>
  );
};

// ---------- 8. Resumen ----------
export const SummaryScene: React.FC<SceneProps> = ({ cues }) => {
  const f = useCurrentFrame();
  const [c0, c1, c2] = cues;
  const items = [
    { at: c0.at, t: "El ala desvía el aire hacia abajo." },
    { at: c0.at + Math.round(c0.dur * 0.5), t: "Arriba la presión baja; abajo sube." },
    { at: c1.at, t: "Esa diferencia empuja el ala hacia arriba." },
    { at: c1.at + Math.round(c1.dur * 0.45), t: "Con velocidad, la sustentación vence al peso." },
  ];
  const end = appear(f, c2.at, 20);
  return (
    <Background>
      <Clouds speed={3} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Plane x={interpolate(f, [0, 400], [-200, 1300])} y={1130 + Math.sin(f / 15) * 10} scale={0.9} rotate={-4} />
      </svg>
      <div style={{ position: "absolute", left: 70, right: 150, top: 270, fontFamily: FONT }}>
        <div style={{ color: C.lift, fontSize: 36, fontWeight: 800, letterSpacing: 3, marginBottom: 34 }}>EN RESUMEN</div>
        {items.map((it, i) => {
          const a = appear(f, it.at, 18);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 24,
                alignItems: "baseline",
                color: C.text,
                fontSize: 48,
                fontWeight: 600,
                lineHeight: 1.2,
                marginBottom: 34,
                opacity: a,
                transform: `translateX(${(1 - a) * -30}px)`,
              }}
            >
              <span style={{ color: C.lift, fontWeight: 800 }}>{i + 1}</span>
              <span>{it.t}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          top: 1290,
          left: 60,
          right: 140,
          textAlign: "center",
          color: C.text,
          fontSize: 76,
          fontWeight: 800,
          opacity: end,
          letterSpacing: -1,
          lineHeight: 1.05,
        }}
      >
        Así vuelan los aviones.
      </div>
    </Background>
  );
};
