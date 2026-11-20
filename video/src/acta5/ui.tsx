import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { SH, SW } from "../acta/screens";
import { FONT, IcCheck, T, ease, pop } from "../acta/theme";

export { SW, SH, FONT, T, ease, pop };
export const W = 1080;
export const GOLD = "#ffcf5c";
export const RED = "#ff5d4f";
export const BLUE = "#6ab3f3";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Word = { w: string; at: number };
export type Cue = { id: string; at: number; dur: number; text: string; words: Word[] };
export type Scene = { name: string; start: number; dur: number; cues: Cue[] };
export type SP = { f: number; cues: Cue[]; dur: number };

// ---------- helpers de tiempos (fotograma local de la escena) ----------
export const nz = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
export const wa = (cues: Cue[], id: string, prefix: string, nth = 0): number => {
  const c = cues.find((x) => x.id === id)!;
  const p = nz(prefix);
  const ms = c.words.filter((w) => nz(w.w).startsWith(p));
  return (ms[nth] ?? ms[0] ?? { at: c.at }).at;
};
export const cueAt = (cues: Cue[], id: string) => cues.find((x) => x.id === id)!.at;
export const cueEnd = (cues: Cue[], id: string) => {
  const c = cues.find((x) => x.id === id)!;
  return c.at + c.dur;
};
export const between = (f: number, a: number, b: number) => f >= a && f < b;

// ---------- subtítulos ----------
const HOT: [RegExp, string][] = [
  [/^paso$/, GOLD],
  [/^(uno|dos|tres|cuatro|cinco):?$/, GOLD],
  [/^telegram/, BLUE],
  [/^(adb|groq)/, T.accent],
  [/^acta/, T.accent],
  [/^gratis/, T.ok],
  [/^(segura|segur[oa]s?|legal)/, T.ok],
  [/^(delito|ajenas|sin)$/, RED],
  [/^(1|2)?(\d)?$/, "#fff"],
];
const chunks = (ws: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  ws.forEach((w) => {
    cur.push(w);
    if (cur.length >= 4 || /[.,:;?!…]$/.test(w.w)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  // une un bloque final de 1 palabra con el anterior
  if (out.length > 1 && out[out.length - 1].length === 1) {
    const last = out.pop()!;
    out[out.length - 1].push(...last);
  }
  return out;
};
export const Captions: React.FC<{ f: number; cues: Cue[]; y: number }> = ({ f, cues, y }) => {
  const c = cues.find((x) => f >= x.at && f <= x.at + x.dur + 8);
  if (!c) return null;
  const cs = chunks(c.words);
  let idx = 0;
  cs.forEach((ch, i) => {
    if (f >= ch[0].at) idx = i;
  });
  const ch = cs[idx];
  const a = pop(f, ch[0].at, 12);
  return (
    <div style={{ position: "absolute", top: y, left: 40, right: 120, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 68,
          fontWeight: 900,
          lineHeight: 1.06,
          letterSpacing: -1,
          background: "rgba(4,12,10,0.8)",
          borderRadius: 30,
          padding: "12px 28px 16px",
          maxWidth: 920,
          transform: `scale(${0.88 + 0.12 * Math.min(1, a)})`,
          textShadow: "0 4px 0 rgba(0,0,0,0.5)",
        }}
      >
        {ch.map((w, i) => {
          const on = f >= w.at;
          const k = nz(w.w);
          const hot = HOT.find(([r]) => r.test(k))?.[1];
          return (
            <span key={i} style={{ color: on ? (hot && hot !== "#fff" ? hot : "#fff") : "rgba(255,255,255,0.45)", marginRight: 16, display: "inline-block" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- cabecera de capítulo ----------
export const Chapter: React.FC<{ n: number; total: number; label: string; f: number }> = ({ n, total, label, f }) => {
  const a = ease(f, 2, 12);
  return (
    <div style={{ position: "absolute", top: 232, left: 50, right: 130, display: "flex", justifyContent: "center", opacity: a, transform: `translateY(${(1 - a) * -16}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18, background: "rgba(4,14,12,0.78)", border: `2px solid ${T.accent}`, borderRadius: 40, padding: "10px 28px", fontFamily: FONT }}>
        <div style={{ color: T.accent, fontSize: 30, fontWeight: 900, letterSpacing: 1 }}>
          {n}/{total}
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{ width: 22, height: 8, borderRadius: 4, background: i < n ? T.accent : T.line }} />
          ))}
        </div>
        <div style={{ color: T.ink, fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>{label}</div>
      </div>
    </div>
  );
};

// ---------- móvil ----------
export const PhoneFrame: React.FC<{ y: number; rot?: number; scale?: number; children: React.ReactNode }> = ({ y, rot = 0, scale = 1.18, children }) => (
  <div
    style={{
      position: "absolute",
      left: (W - SW - 24) / 2 - 30,
      top: y,
      width: SW + 24,
      height: SH + 24,
      transform: `scale(${scale}) rotate(${rot}deg)`,
      transformOrigin: "top center",
      borderRadius: 64,
      background: "#050605",
      border: "3px solid #3a403c",
      boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,195,176,0.15)",
    }}
  >
    <div style={{ position: "absolute", left: 12, top: 12, width: SW, height: SH, borderRadius: 52, overflow: "hidden", background: T.bg, fontFamily: FONT, color: T.ink }}>
      {children}
      <div style={{ position: "absolute", top: 14, left: SW / 2 - 14, width: 28, height: 28, borderRadius: 14, background: "#000" }} />
    </div>
  </div>
);
export const Screen: React.FC<{ bg?: string; children: React.ReactNode }> = ({ bg = T.bg, children }) => (
  <div style={{ position: "absolute", inset: 0, background: bg, fontFamily: FONT, color: T.ink, overflow: "hidden" }}>{children}</div>
);
export const PhoneIn: React.FC<{ f: number; at: number; y?: number; rot?: number; children: React.ReactNode }> = ({ f, at, y = 312, rot = -1.5, children }) => {
  const e = pop(f, at, 15);
  return (
    <PhoneFrame y={y + (1 - e) * 1400} rot={rot}>
      {children}
    </PhoneFrame>
  );
};

// ---------- controles de Android / Acta ----------
export const Toggle: React.FC<{ on: boolean; w?: number }> = ({ on, w = 70 }) => (
  <div style={{ width: w, height: w * 0.55, borderRadius: w, background: on ? T.accent : "#4a4f4c", position: "relative", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: w * 0.07, left: on ? w - w * 0.41 - w * 0.07 : w * 0.07, width: w * 0.41, height: w * 0.41, borderRadius: w, background: on ? T.onAccent : "#cfd2cf" }} />
  </div>
);
export const Btn: React.FC<{ label: string; kind?: "primary" | "ghost" | "ok"; pressed?: boolean; size?: number }> = ({ label, kind = "primary", pressed, size = 22 }) => (
  <div
    style={{
      background: kind === "primary" ? T.accent : kind === "ok" ? T.okSoft : "transparent",
      color: kind === "primary" ? T.onAccent : kind === "ok" ? T.ok : T.accent,
      border: kind === "ok" ? `1.5px solid ${T.ok}` : "none",
      borderRadius: 16,
      padding: "14px 22px",
      fontSize: size,
      fontWeight: 800,
      textAlign: "center",
      transform: `scale(${pressed ? 0.94 : 1})`,
      filter: pressed ? "brightness(1.2)" : "none",
    }}
  >
    {label}
  </div>
);
export const Dialog: React.FC<{ title: string; body?: React.ReactNode; buttons: React.ReactNode; children?: React.ReactNode; icon?: React.ReactNode }> = ({ title, body, buttons, children, icon }) => (
  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.62)", display: "flex", alignItems: "center", justifyContent: "center", padding: 28 }}>
    <div style={{ width: "100%", background: "#2a2d2b", borderRadius: 28, padding: "28px 26px 18px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
      {icon ? <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{icon}</div> : null}
      <div style={{ fontSize: 27, fontWeight: 800, textAlign: icon ? "center" : "left", lineHeight: 1.2 }}>{title}</div>
      {body ? <div style={{ fontSize: 20, color: T.ink2, lineHeight: 1.4, marginTop: 12, textAlign: icon ? "center" : "left" }}>{body}</div> : null}
      {children}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 22 }}>{buttons}</div>
    </div>
  </div>
);
export const AppBar: React.FC<{ title: string }> = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "64px 22px 18px" }}>
    <svg width="30" height="30" viewBox="0 0 24 24">
      <path d="M15 5l-7 7 7 7" fill="none" stroke={T.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <div style={{ fontSize: 28, fontWeight: 800 }}>{title}</div>
  </div>
);
export const Chip: React.FC<{ on?: boolean; label: string }> = ({ on, label }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      borderRadius: 14,
      padding: "6px 14px",
      fontSize: 17,
      fontWeight: 800,
      background: on ? T.okSoft : "transparent",
      color: on ? T.ok : T.ink3,
      border: `1.5px solid ${on ? T.ok : T.line}`,
    }}
  >
    {on ? <IcCheck size={18} /> : null}
    {label}
  </div>
);

// ---------- iconos extra ----------
type IP = { size?: number; color?: string };
const base = (color: string, w = 2) => ({ fill: "none", stroke: color, strokeWidth: w, strokeLinecap: "round" as const, strokeLinejoin: "round" as const });
export const IcDown: React.FC<IP> = ({ size = 32, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 4v11M7 11l5 5 5-5M5 20h14" {...base(color, 2.4)} />
  </svg>
);
export const IcFile: React.FC<IP> = ({ size = 32, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M7 3h7l4 4v14H7z" {...base(color, 2)} />
    <path d="M14 3v4h4" {...base(color, 2)} />
  </svg>
);
export const IcFolder: React.FC<IP> = ({ size = 32, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M3 6h6l2 2h10v11H3z" fill={color} />
  </svg>
);
export const IcZip: React.FC<IP> = ({ size = 32, color = "#b9c7d8" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 2h9l4 4v16H6z" fill={color} />
    <path d="M11 3v2h2V3zM11 7v2h2V7zM11 11v2h2v-2zM11 15h2v4h-2z" fill="#56656e" />
  </svg>
);
export const IcTerm: React.FC<IP> = ({ size = 32, color = T.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <rect x="2.5" y="4" width="19" height="16" rx="3" {...base(color, 2)} />
    <path d="M6.5 9.5l3 2.5-3 2.5M12 15h5" {...base(color, 2)} />
  </svg>
);
export const IcCloud: React.FC<IP> = ({ size = 32, color = BLUE }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18 9.5 4.3 4.3 0 0 1 17.5 18z" {...base(color, 2)} />
  </svg>
);
export const IcX: React.FC<IP> = ({ size = 32, color = RED }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M6 6l12 12M18 6L6 18" {...base(color, 3)} />
  </svg>
);
export const IcScale: React.FC<IP> = ({ size = 32, color = GOLD }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M12 4v16M7 20h10M5 8h14M5 8l-3 6a3 3 0 0 0 6 0zM19 8l-3 6a3 3 0 0 0 6 0z" {...base(color, 1.8)} />
  </svg>
);
export const IcTelegram: React.FC<IP> = ({ size = 32, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M3 11.5l17-7-3 15-5-3.6-2.6 2.4-.6-4.4L17 7.5 8 13.2z" fill={color} />
  </svg>
);
export const IcPlug: React.FC<IP> = ({ size = 32, color = T.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24">
    <path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-12 0zM12 17v4" {...base(color, 2)} />
  </svg>
);

// ---------- ventanas de escritorio ----------
export const WindowFrame: React.FC<{ x: number; y: number; w: number; h: number; title: string; dark?: boolean; children: React.ReactNode; scale?: number }> = ({ x, y, w, h, title, dark = true, children, scale = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 22, overflow: "hidden", background: dark ? "#0c1210" : "#fff", border: `2px solid ${dark ? "#33403b" : "#d9d9d9"}`, boxShadow: "0 50px 110px rgba(0,0,0,0.6)", transform: `scale(${scale})`, transformOrigin: "top left", fontFamily: FONT }}>
    <div style={{ height: 52, background: dark ? "#1b2421" : "#eee", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
      {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
        <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
      ))}
      <div style={{ flex: 1, textAlign: "center", fontSize: 22, color: dark ? T.ink2 : "#555", fontWeight: 600 }}>{title}</div>
      <div style={{ width: 60 }} />
    </div>
    <div style={{ position: "absolute", top: 52, left: 0, right: 0, bottom: 0 }}>{children}</div>
  </div>
);
export const MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace";
export const typed = (s: string, f: number, at: number, len: number) => s.slice(0, Math.floor(interpolate(f, [at, at + len], [0, s.length], clamp)));

// ---------- fondo y fundido de escena ----------
export const Bg: React.FC<{ glow?: string }> = ({ glow = "rgba(124,195,176,0.16)" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(100% 55% at 50% 38%, ${glow} 0%, rgba(0,0,0,0) 70%), ${T.bg}` }} />
);
