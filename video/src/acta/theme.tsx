import React from "react";
import { Easing, interpolate, spring } from "remotion";

// Colores del tema oscuro de Acta (res/values-night del APK) e icono de la app
export const T = {
  bg: "#0f1211",
  bg2: "#16201d",
  surface: "#181c1a",
  surface2: "#232825",
  line: "#2a2f2c",
  ink: "#eceeeb",
  ink2: "#a4a9a4",
  ink3: "#7d827d",
  accent: "#7cc3b0",
  accentSoft: "#1d3430",
  onAccent: "#06201a",
  call: "#2fa86a",
  danger: "#f2867a",
  rec: "#e0574a",
  cream: "#f2f2ee",
  ok: "#6fd39a",
  okSoft: "#18321f",
  warn: "#e7b65c",
  av1bg: "#1f3530",
  av1fg: "#9fd3c3",
  av2bg: "#352c1c",
  av2fg: "#e2c690",
};
export const FONT = "Inter, 'DejaVu Sans', sans-serif";
export const FPS = 30;
export const BEAT = 15; // fotogramas por pulso a 120 ppm

export const ease = (f: number, a: number, len = 12) =>
  interpolate(f, [a, a + len], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

export const pop = (f: number, a: number, damping = 13) => spring({ frame: f - a, fps: FPS, config: { damping } });

// 1 en cada pulso, decae hasta el siguiente
export const beatPulse = (globalF: number) => Math.exp(-(globalF % BEAT) / 4);

// ---------- Iconos (SVG propios, trazo sencillo) ----------
type IP = { size?: number; color?: string; stroke?: number };
const Svg: React.FC<IP & { children: React.ReactNode; vb?: string }> = ({ size = 32, children, vb = "0 0 24 24" }) => (
  <svg width={size} height={size} viewBox={vb} style={{ display: "block" }}>
    {children}
  </svg>
);
// auricular del icono de Acta
export const HANDSET =
  "M19.4,15.6c-1.2,0 -2.4,-0.2 -3.5,-0.6c-0.35,-0.1 -0.75,0 -1,0.25l-1.6,2c-2.85,-1.35 -5.5,-3.9 -6.9,-6.85l1.95,-1.65c0.25,-0.3 0.35,-0.7 0.25,-1.05c-0.35,-1.1 -0.55,-2.3 -0.55,-3.5c0,-0.55 -0.45,-1 -1,-1H4.6C4.05,3.2 3.4,3.45 3.4,4.2c0,9.3 7.7,17 17,17c0.7,0 1,-0.6 1,-1.2v-3.4c0,-0.55 -0.45,-1 -1,-1z";
export const IcPhone: React.FC<IP> = ({ size, color = T.cream }) => (
  <Svg size={size}>
    <path d={HANDSET} fill={color} />
  </Svg>
);
export const IcHangup: React.FC<IP> = ({ size, color = "#fff" }) => (
  <Svg size={size}>
    <g transform="rotate(135 12 12)">
      <path d={HANDSET} fill={color} />
    </g>
  </Svg>
);
const line = (color: string, stroke: number) => ({
  fill: "none",
  stroke: color,
  strokeWidth: stroke,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});
export const IcMicOff: React.FC<IP> = ({ size, color = T.ink, stroke = 2 }) => (
  <Svg size={size}>
    <rect x="9" y="3" width="6" height="11" rx="3" {...line(color, stroke)} />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3M4 4l16 16" {...line(color, stroke)} />
  </Svg>
);
export const IcSpeaker: React.FC<IP> = ({ size, color = T.ink, stroke = 2 }) => (
  <Svg size={size}>
    <path d="M4 10v4h4l5 4V6L8 10H4z" {...line(color, stroke)} />
    <path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" {...line(color, stroke)} />
  </Svg>
);
export const IcBookmark: React.FC<IP> = ({ size, color = T.ink, stroke = 2 }) => (
  <Svg size={size}>
    <path d="M7 3h10v18l-5-4-5 4V3z" {...line(color, stroke)} />
  </Svg>
);
export const IcKeypad: React.FC<IP> = ({ size, color = T.ink }) => (
  <Svg size={size}>
    {[6, 12, 18].map((x) => [5, 11, 17].map((y) => <circle key={`${x}${y}`} cx={x} cy={y} r={1.7} fill={color} />))}
    <circle cx={12} cy={22} r={1.5} fill={color} />
  </Svg>
);
export const IcSearch: React.FC<IP> = ({ size, color = T.ink2, stroke = 2.2 }) => (
  <Svg size={size}>
    <circle cx="11" cy="11" r="6.5" {...line(color, stroke)} />
    <path d="M16 16l5 5" {...line(color, stroke)} />
  </Svg>
);
export const IcCal: React.FC<IP> = ({ size, color = T.onAccent, stroke = 2 }) => (
  <Svg size={size}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" {...line(color, stroke)} />
    <path d="M3.5 10h17M8 3v4M16 3v4" {...line(color, stroke)} />
  </Svg>
);
export const IcCheck: React.FC<IP> = ({ size, color = T.ok, stroke = 2.6 }) => (
  <Svg size={size}>
    <path d="M5 12.5l4.5 4.5L19 7.5" {...line(color, stroke)} />
  </Svg>
);
export const IcBack: React.FC<IP> = ({ size, color = T.ink, stroke = 2.2 }) => (
  <Svg size={size}>
    <path d="M15 5l-7 7 7 7" {...line(color, stroke)} />
  </Svg>
);
export const IcPlay: React.FC<IP> = ({ size, color = T.onAccent }) => (
  <Svg size={size}>
    <path d="M8 5l11 7-11 7z" fill={color} />
  </Svg>
);
export const IcPause: React.FC<IP> = ({ size, color = T.onAccent }) => (
  <Svg size={size}>
    <rect x="6.5" y="5" width="4" height="14" rx="1" fill={color} />
    <rect x="13.5" y="5" width="4" height="14" rx="1" fill={color} />
  </Svg>
);
export const IcSpark: React.FC<IP> = ({ size, color = T.accent }) => (
  <Svg size={size}>
    <path d="M12 2l2.2 6.3L20.5 10.5l-6.3 2.2L12 19l-2.2-6.3L3.5 10.5l6.3-2.2z" fill={color} />
    <path d="M19 15l.9 2.3 2.3.9-2.3.9L19 21.4l-.9-2.3-2.3-.9 2.3-.9z" fill={color} />
  </Svg>
);
export const IcLock: React.FC<IP> = ({ size, color = T.accent, stroke = 2 }) => (
  <Svg size={size}>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" {...line(color, stroke)} />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" {...line(color, stroke)} />
    <circle cx="12" cy="15.5" r="1.4" fill={color} />
  </Svg>
);
export const IcShield: React.FC<IP> = ({ size, color = T.accent, stroke = 1.6 }) => (
  <Svg size={size}>
    <path d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" {...line(color, stroke)} />
  </Svg>
);
export const IcFinger: React.FC<IP & { progress?: number }> = ({ size, color = T.accent, stroke = 1.5, progress = 1 }) => (
  <Svg size={size}>
    {[
      "M6.5 9.5a5.8 5.8 0 0 1 11 0",
      "M4.8 13.5a7.5 7.5 0 0 1 .4-5.5",
      "M8.5 18.5c-.9-1.6-1.4-3.4-1.4-5.2a4.9 4.9 0 0 1 9.8 0c0 1.4-.2 2.8-.6 4.1",
      "M11.9 13.3c0 2.6.8 5.1 2.2 7.2",
      "M9.8 13.3a2.1 2.1 0 0 1 4.2 0c0 1.9.4 3.8 1.2 5.5",
      "M19.2 8c.6 1.4.9 2.8.9 4.3",
      "M7.6 4.8a8.5 8.5 0 0 1 8.8 0",
    ].map((d, i) => (
      <path key={i} d={d} {...line(color, stroke)} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, Math.max(0, progress * 7 - i))} />
    ))}
  </Svg>
);

// Icono de la app: cuadrado oscuro, auricular crema y punto rojo de grabación
export const AppIcon: React.FC<{ size: number; dotPulse?: number }> = ({ size, dotPulse = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 108 108" style={{ display: "block", overflow: "visible" }}>
    <rect x="4" y="4" width="100" height="100" rx="26" fill="#161616" stroke="#2c2c2c" strokeWidth="1.5" />
    <g transform="translate(29 29) scale(2.1)">
      <path d={HANDSET} fill={T.cream} />
    </g>
    <circle cx="69" cy="39" r={8 + 10 * dotPulse} fill={T.rec} opacity={0.35 * dotPulse} />
    <circle cx="69" cy="39" r="5" fill={T.rec} />
  </svg>
);

export const Avatar: React.FC<{ size: number; initials: string; bg?: string; fg?: string }> = ({
  size,
  initials,
  bg = T.av1bg,
  fg = T.av1fg,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: bg,
      color: fg,
      fontSize: size * 0.38,
      fontWeight: 700,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {initials}
  </div>
);

// Onda tipo "toque" que se expande en un punto
export const Tap: React.FC<{ f: number; at: number; x: number; y: number; color?: string }> = ({
  f,
  at,
  x,
  y,
  color = "rgba(255,255,255,0.55)",
}) => {
  const p = (f - at) / 14;
  if (p < 0 || p > 1) return null;
  const r = 20 + 60 * p;
  return (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: 2 * r,
        height: 2 * r,
        borderRadius: r,
        background: color,
        opacity: 1 - p,
        pointerEvents: "none",
      }}
    />
  );
};
