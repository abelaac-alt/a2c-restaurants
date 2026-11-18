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
const W = 1920;
const H = 1080;

// ---------- 1. Título ----------
export const TitleScene: React.FC = () => {
  const f = useCurrentFrame();
  const px = interpolate(f, [0, 150], [-250, 2150], { easing: Easing.inOut(Easing.quad) });
  const a = appear(f, 10, 25);
  const b = appear(f, 35, 25);
  return (
    <Background>
      <Clouds speed={3} opacity={0.14} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Plane x={px} y={300 + Math.sin(f / 12) * 8} scale={1.1} rotate={-3} />
      </svg>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 220 }}>
        <div
          style={{
            color: C.text,
            fontSize: 112,
            fontWeight: 800,
            letterSpacing: -2,
            opacity: a,
            transform: `translateY(${(1 - a) * 30}px)`,
          }}
        >
          ¿Por qué vuelan los aviones?
        </div>
        <div style={{ color: C.muted, fontSize: 44, marginTop: 24, opacity: b }}>
          La física de la sustentación, paso a paso
        </div>
      </AbsoluteFill>
    </Background>
  );
};

// ---------- 2. Las cuatro fuerzas ----------
export const ForcesScene: React.FC = () => {
  const f = useCurrentFrame();
  const cx = 960;
  const cy = 500;
  const bob = Math.sin(f / 18) * 6;
  const grow = (start: number) => appear(f, start, 22);
  return (
    <Background>
      <Clouds speed={4} />
      <SceneTitle n={1}>Las cuatro fuerzas del vuelo</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <g transform={`translate(0 ${bob})`}>
          <Plane x={cx} y={cy} scale={1.35} />
          <Arrow x={cx} y={cy - 40} dx={0} dy={-1} len={210 * grow(30)} color={C.lift} label="Sustentación" />
          <Arrow x={cx} y={cy + 60} dx={0} dy={1} len={210 * grow(80)} color={C.weight} label="Peso" />
          <Arrow
            x={cx + 270}
            y={cy + 4}
            dx={1}
            dy={0}
            len={170 * grow(130)}
            color={C.thrust}
            label="Empuje"
            labelAnchor="start"
          />
          <Arrow
            x={cx - 270}
            y={cy + 4}
            dx={-1}
            dy={0}
            len={170 * grow(180)}
            color={C.drag}
            label="Resistencia"
            labelAnchor="end"
          />
        </g>
      </svg>
      <Captions
        lines={[
          { at: 20, text: "Sobre un avión en vuelo actúan cuatro fuerzas." },
          { at: 130, text: "Los motores dan el empuje; el aire frena con su resistencia." },
          {
            at: 225,
            text: (
              <>
                Para no caer, algo tiene que compensar el peso:{" "}
                <span style={{ color: C.lift, fontWeight: 700 }}>la sustentación</span>, que nace en las alas.
              </>
            ),
          },
        ]}
      />
    </Background>
  );
};

// ---------- 3. El ala desvía el aire ----------
export const WingScene: React.FC = () => {
  const f = useCurrentFrame();
  const draw = appear(f, 10, 40);
  const flow = appear(f, 150, 50);
  const dots = appear(f, 190, 30);
  const labels = appear(f, 50, 20);
  const aoa = appear(f, 100, 20);
  const [lx, ly] = leSvg();
  const [tx, ty] = teSvg();
  // línea de cuerda y horizontal para el ángulo de ataque
  const r = 260;
  const arc = `M${lx + r},${ly} A${r},${r} 0 0 1 ${lx + r * Math.cos(AOA)},${ly + r * Math.sin(AOA)}`;
  return (
    <Background>
      <SceneTitle n={2}>La forma del ala</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <FlowLines reveal={flow} />
        <FlowDots opacity={dots} />
        <Airfoil draw={draw} />
        <g opacity={labels * (1 - flow * 0.6)}>
          <circle cx={lx} cy={ly} r={9} fill={C.weight} />
          <text x={lx - 30} y={ly - 40} fill={C.text} fontSize={30} textAnchor="end" fontFamily={FONT}>
            Borde de ataque
          </text>
          <circle cx={tx} cy={ty} r={9} fill={C.weight} />
          <text x={tx + 20} y={ty + 50} fill={C.text} fontSize={30} fontFamily={FONT}>
            Borde de salida
          </text>
        </g>
        <g opacity={aoa * (1 - flow * 0.7)}>
          <line x1={lx} y1={ly} x2={lx + 900} y2={ly} stroke={C.muted} strokeWidth={3} strokeDasharray="12 10" />
          <line x1={lx} y1={ly} x2={tx + 60 * Math.cos(AOA)} y2={ty + 60 * Math.sin(AOA)} stroke={C.lift} strokeWidth={3} strokeDasharray="12 10" />
          <path d={arc} fill="none" stroke={C.lift} strokeWidth={4} />
          <text x={lx + r + 20} y={ly + 26} fill={C.lift} fontSize={30} fontWeight={700} fontFamily={FONT}>
            Ángulo de ataque
          </text>
          <text x={lx - 150} y={ly + 8} fill={C.muted} fontSize={28} fontFamily={FONT}>
            aire →
          </text>
        </g>
      </svg>
      <Captions
        lines={[
          { at: 15, text: "Si cortamos un ala y la miramos de lado, vemos un perfil aerodinámico." },
          { at: 95, text: "Está algo curvada e inclinada unos grados contra el aire: el ángulo de ataque." },
          { at: 170, text: "Al avanzar, el ala obliga al aire a curvarse a su alrededor..." },
          { at: 265, text: "...y lo deja salir inclinado hacia abajo por detrás." },
        ]}
      />
    </Background>
  );
};

// ---------- 4. Diferencia de presión ----------
const normalArrows = (surface: [number, number][], upper: boolean) => {
  const out: { x: number; y: number; dx: number; dy: number; mag: number }[] = [];
  const picks = [0.06, 0.14, 0.24, 0.36, 0.5, 0.65, 0.8];
  picks.forEach((p) => {
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
    } // que apunte hacia arriba
    // succión mayor cerca del borde de ataque
    const mag = upper ? 95 * Math.exp(-(((p - 0.15) / 0.35) ** 2)) + 25 : 55 * Math.exp(-(((p - 0.35) / 0.5) ** 2)) + 15;
    out.push({ x, y, dx: nx, dy: ny, mag });
  });
  return out;
};
const UP_ARROWS = normalArrows(upperSurface, true);
const LO_ARROWS = normalArrows(lowerSurface, false);

export const PressureScene: React.FC = () => {
  const f = useCurrentFrame();
  const low = appear(f, 25, 30);
  const high = appear(f, 120, 30);
  const surf = appear(f, 200, 25);
  const lift = usePop(250);
  const [cx] = toSvg(0.4, 0);
  const cyUp = toSvg(0, 0.2)[1];
  const cyLo = toSvg(0, -0.18)[1];
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
        <ellipse cx={cx - 40} cy={cyUp} rx={520} ry={190} fill="url(#low)" opacity={low} />
        <ellipse cx={cx} cy={cyLo} rx={480} ry={150} fill="url(#high)" opacity={high} />
        <Airfoil />
        <g opacity={low} fontFamily={FONT}>
          {[-260, -120, 20, 160, 300].map((dx, i) => (
            <text key={i} x={cx + dx - 60} y={cyUp - 30 + (i % 2) * 40} fill={C.low} fontSize={56} fontWeight={800} textAnchor="middle">
              −
            </text>
          ))}
          <text x={cx - 420} y={cyUp - 110} fill={C.low} fontSize={38} fontWeight={700} textAnchor="middle">
            Presión baja · aire más rápido
          </text>
        </g>
        <g opacity={high} fontFamily={FONT}>
          {[-200, -60, 80, 220].map((dx, i) => (
            <text key={i} x={cx + dx} y={cyLo + 30 + (i % 2) * 30} fill={C.high} fontSize={50} fontWeight={800} textAnchor="middle">
              +
            </text>
          ))}
          <text x={cx} y={cyLo + 130} fill={C.high} fontSize={38} fontWeight={700} textAnchor="middle">
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
        <Arrow x={toSvg(0.3, 0)[0]} y={toSvg(0.3, 0.12)[1]} dx={0} dy={-1} len={190 * lift} color={C.lift} width={16} label="Sustentación" labelAnchor="start" labelOffset={[30, 30]} fontSize={40} />
      </svg>
      <Captions
        lines={[
          { at: 20, text: "Por encima del ala, el aire se acelera y su presión baja." },
          { at: 115, text: "Por debajo, el aire se frena un poco y la presión sube." },
          { at: 195, text: "El aire de abajo empuja más que el de arriba..." },
          {
            at: 250,
            text: (
              <>
                ...y el resultado es una fuerza neta hacia arriba:{" "}
                <span style={{ color: C.lift, fontWeight: 700 }}>la sustentación</span>.
              </>
            ),
          },
        ]}
      />
    </Background>
  );
};

// ---------- 5. Acción y reacción ----------
export const NewtonScene: React.FC = () => {
  const f = useCurrentFrame();
  const down = appear(f, 30, 30);
  const up = usePop(120);
  const eq = appear(f, 200, 25);
  const [tx, ty] = teSvg();
  return (
    <Background>
      <SceneTitle n={4}>Acción y reacción</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <FlowLines opacity={0.8} />
        <FlowDots />
        <Airfoil />
        <g opacity={down}>
          {[0, 1, 2].map((i) => (
            <Arrow
              key={i}
              x={tx + 80 + i * 120}
              y={ty + 20 + i * 20}
              dx={0.45}
              dy={1}
              len={150 * down}
              color={C.weight}
              width={10}
            />
          ))}
          <text x={tx + 220} y={ty + 260} fill={C.weight} fontSize={36} fontWeight={700} textAnchor="middle" fontFamily={FONT}>
            El ala empuja el aire hacia abajo
          </text>
        </g>
        <Arrow x={toSvg(0.3, 0)[0]} y={toSvg(0.3, 0.12)[1]} dx={0} dy={-1} len={260 * up} color={C.lift} width={16} />
        <text
          x={toSvg(0.3, 0)[0] - 40}
          y={toSvg(0.3, 0.12)[1] - 150}
          fill={C.lift}
          fontSize={36}
          fontWeight={700}
          textAnchor="end"
          fontFamily={FONT}
          opacity={up}
        >
          El aire empuja el ala hacia arriba
        </text>
      </svg>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 60,
          color: C.text,
          fontSize: 34,
          opacity: eq,
          background: "rgba(79, 209, 197, 0.12)",
          border: `2px solid ${C.lift}`,
          borderRadius: 14,
          padding: "14px 26px",
        }}
      >
        3.ª ley de Newton: acción = reacción
      </div>
      <Captions
        lines={[
          { at: 25, text: "Fíjate en el aire que sale por detrás: va inclinado hacia abajo." },
          { at: 115, text: "Si el ala empuja el aire hacia abajo, el aire empuja el ala hacia arriba." },
          { at: 205, text: "Presión y Newton no son dos causas distintas: son dos formas de contar lo mismo." },
        ]}
      />
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
const START_X = -0.45;

export const MythScene: React.FC = () => {
  const f = useCurrentFrame();
  const start = 120;
  const tt = Math.max(0, (f - start) / 70); // unidades de tiempo
  const stamp = usePop(255);
  const badge = appear(f, 10, 15);
  const markers = [MYTH_UP, MYTH_LO].map((s) => {
    const t0 = timeAtX(s, START_X);
    const trail: string[] = [];
    for (let k = 0; k <= 30; k++) {
      const p = pointAtTime(s, t0 + (tt * k) / 30);
      if (p) trail.push(toSvg(p[0], p[1]).join(","));
    }
    const p = pointAtTime(s, t0 + tt);
    return { s, trail, p: p ? toSvg(p[0], p[1]) : null };
  });
  const [tx, ty] = teSvg();
  const [sx] = toSvg(START_X, 0);
  const show = appear(f, start - 20, 15);
  return (
    <Background>
      <SceneTitle n={5}>Un mito muy extendido</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <FlowLines opacity={0.5} />
        <Airfoil />
        <g opacity={show}>
          <line x1={sx} y1={ty - 300} x2={sx} y2={ty + 265} stroke={C.muted} strokeWidth={2} strokeDasharray="8 8" />
          <text x={sx} y={ty + 295} fill={C.muted} fontSize={28} textAnchor="middle" fontFamily={FONT}>
            salen a la vez
          </text>
          <line x1={tx} y1={ty - 300} x2={tx} y2={ty + 265} stroke={C.muted} strokeWidth={2} strokeDasharray="8 8" />
          <text x={tx} y={ty + 295} fill={C.muted} fontSize={28} textAnchor="middle" fontFamily={FONT}>
            borde de salida
          </text>
          {markers.map((m, i) => (
            <g key={i}>
              <polyline
                points={m.trail.join(" ")}
                fill="none"
                stroke={m.s.upper ? C.low : C.high}
                strokeWidth={6}
                strokeOpacity={0.6}
              />
              {m.p ? <circle cx={m.p[0]} cy={m.p[1]} r={14} fill={m.s.upper ? C.low : C.high} stroke="#fff" strokeWidth={3} /> : null}
            </g>
          ))}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          right: 80,
          top: 140,
          width: 560,
          opacity: badge,
          background: "rgba(4, 14, 30, 0.7)",
          borderRadius: 16,
          padding: "22px 28px",
          color: C.text,
          fontSize: 30,
          lineHeight: 1.35,
        }}
      >
        <div style={{ color: C.weight, fontWeight: 800, fontSize: 26, letterSpacing: 2, marginBottom: 8 }}>MITO</div>
        «El aire de arriba recorre más camino y debe ir más rápido para reencontrarse con el de abajo al final del ala.»
        <div
          style={{
            position: "absolute",
            right: 30,
            bottom: -30,
            transform: `rotate(-12deg) scale(${stamp})`,
            border: `5px solid ${C.drag}`,
            color: C.drag,
            fontWeight: 900,
            fontSize: 54,
            padding: "2px 22px",
            borderRadius: 10,
            background: "rgba(8, 26, 51, 0.9)",
          }}
        >
          FALSO
        </div>
      </div>
      <Captions
        lines={[
          { at: 15, text: "Seguramente te lo han contado así alguna vez..." },
          { at: 110, text: "Soltemos dos partículas de aire a la vez, una por arriba y otra por abajo." },
          { at: 220, text: "La de arriba llega mucho antes. Nadie obliga al aire a reencontrarse." },
          { at: 300, text: "Lo que manda es la forma y la inclinación del ala, que curvan el flujo." },
        ]}
      />
    </Background>
  );
};

// ---------- 7. Velocidad y despegue ----------
const V_LIFT = 250;
const speedAt = (f: number) => interpolate(f, [40, 230], [0, 300], { ...clamp, easing: Easing.in(Easing.quad) });

export const TakeoffScene: React.FC = () => {
  const f = useCurrentFrame();
  const v = speedAt(f);
  let dist = 0;
  for (let k = 0; k <= f; k++) dist += speedAt(k) * 0.09;
  // fotograma del despegue
  let fLift = 0;
  while (speedAt(fLift) < V_LIFT && fLift < 400) fLift++;
  const air = Math.max(0, f - fLift);
  const climb = Math.min(300, 0.06 * air * air);
  const pitch = -interpolate(air, [0, 20], [0, 9], clamp);
  const groundY = 730;
  const px = 820;
  const py = groundY - 92 - climb;
  const weight = 150;
  const lift = Math.min(230, weight * (v / V_LIFT) ** 2);
  const wonLift = f >= fLift;
  return (
    <Background>
      <SceneTitle n={6}>Hace falta velocidad</SceneTitle>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <rect x={0} y={groundY} width={W} height={H - groundY} fill="#0d2440" />
        <rect x={0} y={groundY} width={W} height={70} fill="#24364f" />
        {Array.from({ length: 14 }, (_, i) => {
          const x = ((((i * 180 - dist) % 2520) + 2520) % 2520) - 300;
          return <rect key={i} x={x} y={groundY + 31} width={90} height={8} fill="#e8eef7" opacity={0.8} />;
        })}
        <g transform={`translate(${px} ${py}) rotate(${pitch})`}>
          <rect x={-6} y={40} width={8} height={40} fill="#7f93b0" />
          <circle cx={-2} cy={84} r={12} fill="#1b2a3f" stroke="#7f93b0" strokeWidth={3} />
          <rect x={180} y={40} width={8} height={40} fill="#7f93b0" />
          <circle cx={184} cy={84} r={10} fill="#1b2a3f" stroke="#7f93b0" strokeWidth={3} />
          <Plane x={0} y={0} scale={1.3} />
        </g>
        <Arrow x={px} y={py - 50} dx={0} dy={-1} len={lift} color={C.lift} label="Sustentación" labelAnchor="start" labelOffset={[24, 30]} />
        <Arrow x={px} y={py + 70} dx={0} dy={1} len={weight * appear(f, 10, 20)} color={C.weight} label="Peso" labelAnchor="start" labelOffset={[24, -40]} />
      </svg>
      <div style={{ position: "absolute", right: 90, top: 150, textAlign: "right", fontFamily: FONT }}>
        <div style={{ color: C.muted, fontSize: 30 }}>velocidad</div>
        <div style={{ color: C.text, fontSize: 96, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(v)} <span style={{ fontSize: 40, color: C.muted }}>km/h</span>
        </div>
        <div style={{ color: wonLift ? C.lift : C.muted, fontSize: 34, fontWeight: 700, marginTop: 6 }}>
          {wonLift ? "Sustentación > peso" : "Sustentación < peso"}
        </div>
      </div>
      <Captions
        lines={[
          { at: 15, text: "La sustentación crece con el cuadrado de la velocidad: el doble de rápido, cuatro veces más." },
          { at: 140, text: "Por eso el avión acelera por la pista hasta que las alas generan suficiente fuerza." },
          { at: fLift + 5, text: "Cuando la sustentación supera al peso... ¡el avión despega!" },
        ]}
      />
    </Background>
  );
};

// ---------- 8. Resumen ----------
export const SummaryScene: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    "El ala, curvada e inclinada, desvía el aire hacia abajo.",
    "Arriba la presión baja; abajo sube.",
    "La diferencia empuja el ala hacia arriba: la sustentación.",
    "Con suficiente velocidad, la sustentación vence al peso.",
  ];
  const end = appear(f, 175, 20);
  return (
    <Background>
      <Clouds speed={3} />
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Plane x={1620} y={300 + Math.sin(f / 15) * 10} scale={0.85} rotate={-4} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 150, fontFamily: FONT }}>
        <div style={{ color: C.lift, fontSize: 34, fontWeight: 700, letterSpacing: 3, marginBottom: 30 }}>EN RESUMEN</div>
        {items.map((t, i) => {
          const a = appear(f, 15 + i * 35, 18);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 24,
                alignItems: "baseline",
                color: C.text,
                fontSize: 46,
                marginBottom: 30,
                opacity: a,
                transform: `translateX(${(1 - a) * -30}px)`,
                maxWidth: 1150,
              }}
            >
              <span style={{ color: C.lift, fontWeight: 800 }}>{i + 1}</span>
              <span>{t}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 90,
          left: 0,
          right: 0,
          textAlign: "center",
          color: C.text,
          fontSize: 72,
          fontWeight: 800,
          opacity: end,
          letterSpacing: -1,
        }}
      >
        Así vuelan los aviones.
      </div>
    </Background>
  );
};

