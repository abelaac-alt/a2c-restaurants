import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing.json";
import { SH, SW } from "../acta/screens";
import {
  AppIcon,
  Avatar,
  FONT,
  IcCheck,
  IcPause,
  IcPhone,
  IcSearch,
  IcSpark,
  T,
  Tap,
  beatPulse,
  ease,
  pop,
} from "../acta/theme";

type Word = { w: string; at: number };
type Cue = { id: string; at: number; dur: number; text: string; agent: boolean; words: Word[] };
type Scene = { name: string; start: number; dur: number; cues: Cue[] };
const SCENES = timing.scenes as Scene[];
const EV = timing.events;
export const STORY_DURATION = timing.total;
const W = 1080;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const scene = (n: string) => SCENES.find((s) => s.name === n)!;
const RED = "#ff5d4f";

// ---------- Subtítulos virales: bloques de 2-3 palabras, palabra actual resaltada ----------
const HOT: Record<string, string> = {
  gratis: T.accent,
  "gratis.": T.accent,
  "gratis,": T.accent,
  nunca: RED,
  "acta.": T.accent,
  "acta:": T.accent,
  acta: T.accent,
  minuto: T.accent,
  "cargo.": T.ok,
  anulan: T.ok,
  "esto.": RED,
  "cuelen.": RED,
};
const chunks = (words: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  words.forEach((w) => {
    cur.push(w);
    if (cur.length >= 3 || /[.,:;?!…]$/.test(w.w)) {
      out.push(cur);
      cur = [];
    }
  });
  if (cur.length) out.push(cur);
  return out;
};
const Captions: React.FC<{ gf: number; y: number }> = ({ gf, y }) => {
  // busca el bloque activo en todas las escenas
  for (const s of SCENES) {
    for (const c of s.cues) {
      const start = s.start + c.at;
      const end = start + c.dur + 6;
      if (gf < start || gf > end) continue;
      const cs = chunks(c.words);
      let idx = 0;
      cs.forEach((ch, i) => {
        if (gf >= s.start + ch[0].at) idx = i;
      });
      const ch = cs[idx];
      const t0 = s.start + ch[0].at;
      const a = pop(gf, t0, 12);
      return (
        <div
          style={{
            position: "absolute",
            top: y,
            left: 60,
            right: 140,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: c.agent ? 62 : 82,
            fontWeight: 900,
            fontStyle: c.agent ? "italic" : "normal",
            lineHeight: 1.05,
            letterSpacing: -1.5,
            transform: `scale(${0.85 + 0.15 * Math.min(1, a)})`,
            textShadow: "0 6px 0 rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.6)",
            WebkitTextStroke: "2px rgba(0,0,0,0.5)",
          }}
        >
          {c.agent && idx === 0 ? "«" : ""}
          {ch.map((w, i) => {
            const on = gf >= s.start + w.at;
            const key = w.w.toLowerCase().replace(/[«»]/g, "");
            const hot = HOT[key];
            return (
              <span key={i} style={{ color: hot ? hot : on ? (c.agent ? T.cream : "#fff") : "rgba(255,255,255,0.55)", marginRight: 18 }}>
                {w.w}
              </span>
            );
          })}
          {c.agent && idx === cs.length - 1 ? "»" : ""}
        </div>
      );
    }
  }
  return null;
};

// ---------- Fondo: rojo tenso al principio, verde de Acta tras el drop ----------
const Backdrop: React.FC<{ gf: number }> = ({ gf }) => {
  const green = ease(gf, EV.drop, 6);
  const p = gf >= EV.drop ? beatPulse(gf) : 0;
  const tense = 0.12 + 0.06 * Math.abs(Math.sin(gf / 10));
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 40%, rgba(160,40,32,${tense * (1 - green)}) 0%, rgba(0,0,0,0) 70%)` }} />
      <div
        style={{
          position: "absolute",
          left: -10,
          top: 400,
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          opacity: green,
          background: `radial-gradient(circle, rgba(124,195,176,${0.18 + 0.12 * p}) 0%, rgba(124,195,176,0) 62%)`,
          transform: `scale(${1 + 0.05 * p})`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Gancho: POV + llamada + factura ----------
const PovBanner: React.FC<{ gf: number }> = ({ gf }) => {
  const out = ease(gf, scene("deny").start + scene("deny").dur - 30, 8);
  return (
    <div style={{ position: "absolute", top: 240, left: 60, right: 140, display: "flex", justifyContent: "center", opacity: 1 - out }}>
      <div
        style={{
          background: "#fff",
          color: "#0b0b0b",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 54,
          lineHeight: 1.1,
          padding: "16px 26px",
          borderRadius: 18,
          textAlign: "center",
          transform: `rotate(-1.5deg) scale(${1 + 0.04 * Math.sin(gf / 6)})`,
        }}
      >
        POV: te juran que nunca te prometieron nada
      </div>
    </div>
  );
};

const CallCard: React.FC<{ f: number }> = ({ f }) => {
  const a = 1 + 0 * f;
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 200,
        top: 470,
        background: T.surface,
        border: `1px solid ${T.line}`,
        borderRadius: 28,
        padding: "24px 26px",
        display: "flex",
        gap: 20,
        alignItems: "center",
        fontFamily: FONT,
        opacity: Math.min(1, a),
        transform: `translateY(${(1 - a) * 40}px)`,
      }}
    >
      <div style={{ width: 70, height: 70, borderRadius: 35, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IcPhone size={36} color={T.accent} />
      </div>
      <div>
        <div style={{ color: T.ink, fontSize: 30, fontWeight: 700 }}>Atención al cliente</div>
        <div style={{ color: T.ink2, fontSize: 24, marginTop: 2 }}>Fibra · 12 mar · 11:04 · 8:42</div>
      </div>
    </div>
  );
};

const Bill: React.FC<{ gf: number }> = ({ gf }) => {
  const a = pop(gf, EV.bill - 4, 10);
  if (gf < EV.bill - 4) return null;
  const shake = gf < EV.bill + 12 ? Math.sin(gf * 2.2) * 10 * (1 - (gf - EV.bill + 4) / 16) : 0;
  const circle = interpolate(gf, [EV.bill + 8, EV.bill + 22], [0, 1], clamp);
  const deny = scene("deny");
  const dim = ease(gf, deny.start + 10, 12);
  const refund = gf >= EV.refund;
  const stamp = pop(gf, EV.refund, 9);
  const winS = scene("win");
  const visible = gf < scene("acta").start || (gf >= winS.start && gf < winS.start + winS.dur);
  if (!visible) return null;
  const inWin = gf >= winS.start;
  const y = inWin ? 900 : interpolate(dim, [0, 1], [700, 640]);
  const sc = inWin ? 0.92 : 1 - 0.1 * dim;
  const Row: React.FC<{ l: string; r: string; bold?: boolean; hot?: boolean }> = ({ l, r, bold, hot }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 34, fontWeight: bold ? 800 : 500, color: hot ? "#1a1a1a" : "#333", position: "relative" }}>
      <span>{l}</span>
      <span style={{ textDecoration: hot && refund ? "line-through" : "none" }}>{r}</span>
    </div>
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        right: 230,
        top: y,
        background: "#fbfaf6",
        borderRadius: 18,
        padding: "30px 34px",
        fontFamily: FONT,
        boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        transform: `translateY(${(1 - Math.min(1, a)) * -500}px) translateX(${shake}px) rotate(${3 + shake * 0.2}deg) scale(${sc})`,
        opacity: inWin ? 1 : 1 - 0.35 * dim,
      }}
    >
      <div style={{ fontSize: 24, color: "#777", fontWeight: 700, letterSpacing: 2 }}>FACTURA · MARZO</div>
      <div style={{ height: 2, background: "#ddd", margin: "14px 0 6px" }} />
      <Row l="Cuota fibra" r="29,90 €" />
      <div style={{ position: "relative" }}>
        <Row l="Instalación" r="49,90 €" hot />
        <svg width="560" height="110" style={{ position: "absolute", left: -40, top: -26, overflow: "visible" }}>
          <ellipse cx="280" cy="52" rx="290" ry="46" fill="none" stroke={RED} strokeWidth="6" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - circle} transform="rotate(-2 280 52)" />
        </svg>
      </div>
      <div style={{ height: 2, background: "#ddd", margin: "6px 0" }} />
      <Row l="Total" r={refund ? "29,90 €" : "79,80 €"} bold />
      {refund ? (
        <div
          style={{
            position: "absolute",
            right: -20,
            top: 70,
            transform: `rotate(-14deg) scale(${stamp})`,
            border: `6px solid ${T.call}`,
            color: T.call,
            fontWeight: 900,
            fontSize: 58,
            padding: "4px 22px",
            borderRadius: 12,
            background: "rgba(251,250,246,0.9)",
          }}
        >
          ANULADO
        </div>
      ) : null}
    </div>
  );
};

const DenyBubble: React.FC<{ gf: number }> = ({ gf }) => {
  const s = scene("deny");
  const at = s.start + s.cues[0].at + Math.round(s.cues[0].dur * 0.45);
  if (gf < at - 2 || gf >= s.start + s.dur) return null;
  const a = pop(gf, at, 9);
  const shake = gf < at + 10 ? Math.sin(gf * 2.5) * 8 : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 90,
        right: 170,
        top: 470,
        transform: `scale(${0.6 + 0.4 * a}) translateX(${shake}px) rotate(-2deg)`,
        opacity: Math.min(1, a),
        fontFamily: FONT,
      }}
    >
      <div style={{ background: "#2a1412", border: `3px solid ${RED}`, borderRadius: "34px 34px 34px 6px", padding: "28px 32px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ color: "#ffb4ab", fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Atención al cliente</div>
        <div style={{ color: "#fff", fontSize: 58, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1 }}>«Nosotros nunca le dijimos eso.»</div>
      </div>
    </div>
  );
};

// congelado + desaturado tras el scratch
const freezeFilter = (gf: number) => {
  if (gf >= EV.scratch && gf < EV.drop) {
    const k = ease(gf, EV.scratch, 4);
    return `grayscale(${k}) contrast(${1 + 0.2 * k})`;
  }
  return "none";
};

// ---------- Drop: Acta ----------
const ActaSlam: React.FC<{ f: number; gf: number }> = ({ f, gf }) => {
  const s = pop(f, 0, 8);
  const flash = 1 - ease(f, 0, 8);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
      <AbsoluteFill style={{ background: T.accent, opacity: 0.45 * flash }} />
      <div style={{ transform: `scale(${0.3 + 0.7 * s}) rotate(${(1 - s) * -20}deg)`, marginTop: -260 }}>
        <AppIcon size={340} dotPulse={beatPulse(gf)} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Móvil ----------
const PhoneFrame: React.FC<{ x: number; y: number; scale: number; rot?: number; children: React.ReactNode }> = ({ x, y, scale, rot = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
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

const QUERY = "gratis";
const SearchStory: React.FC<{ f: number; s: Scene; gf: number }> = ({ f, s, gf }) => {
  const [c5, c6, c7] = s.cues;
  const typeStart = c5.at + 6;
  const typed = Math.floor(interpolate(f, [typeStart, typeStart + 22], [0, QUERY.length], clamp));
  const res = ease(f, c6.at - 4, 12);
  const tapAt = c6.at + Math.round(c6.dur * 0.55);
  const sheet = ease(f, tapAt + 3, 12);
  const head = interpolate(f, [tapAt + 10, tapAt + 24], [0.1, 0.39], clamp);
  const playing = f >= c7.at;
  const agentWords = c7.words;
  return (
    <>
      <div style={{ padding: "64px 20px 0" }}>
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 18 }}>Buscar</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface2, borderRadius: 18, padding: "16px 18px", border: `1.5px solid ${typed ? T.accent : T.line}` }}>
          <IcSearch size={26} />
          <div style={{ fontSize: 24, color: typed ? T.ink : T.ink3 }}>
            {typed ? QUERY.slice(0, typed) : "Buscar en lo que se habló"}
            {f < typeStart + 34 && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: T.accent }}>|</span> : null}
          </div>
        </div>
        <div style={{ marginTop: 20, opacity: res, transform: `translateY(${(1 - res) * 20}px)` }}>
          <div style={{ fontSize: 15, color: T.ink3, marginBottom: 12 }}>1 llamada</div>
          <div style={{ background: T.surface, border: `1.5px solid ${T.accent}`, borderRadius: 22, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 23, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcPhone size={24} color={T.accent} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 700 }}>Atención al cliente</div>
                <div style={{ fontSize: 14, color: T.ink3 }}>12 mar · 11:04 · 8:42</div>
              </div>
              <div style={{ fontSize: 17, color: T.onAccent, fontWeight: 800, background: T.accent, borderRadius: 10, padding: "5px 11px" }}>03:27</div>
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.4, color: T.ink2, marginTop: 12 }}>
              «…la instalación es totalmente{" "}
              <span style={{ background: "rgba(124,195,176,0.28)", color: T.accent, borderRadius: 4, padding: "0 3px", fontWeight: 800 }}>gratis</span>, no tendrá
              que pagar nada…»
            </div>
          </div>
        </div>
      </div>
      <Tap f={f} at={tapAt} x={238} y={300} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 520,
          background: T.surface,
          borderTop: `1px solid ${T.line}`,
          borderRadius: "28px 28px 0 0",
          padding: "24px 22px",
          transform: `translateY(${(1 - sheet) * 560}px)`,
        }}
      >
        <div style={{ width: 50, height: 5, borderRadius: 3, background: T.line, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Atención al cliente</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: T.accent, fontVariantNumeric: "tabular-nums" }}>03:27</div>
        </div>
        <div style={{ position: "relative", height: 56, display: "flex", alignItems: "center", gap: 3, marginTop: 16 }}>
          {Array.from({ length: 40 }, (_, i) => {
            const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.3 + 2) * Math.sin(i * 0.5 + 1));
            const live = playing && i / 40 > head - 0.02 && i / 40 < head + 0.06 ? 0.6 + 0.4 * Math.abs(Math.sin(gf * 0.6 + i)) : 1;
            return <div key={i} style={{ flex: 1, height: `${v * live * 100}%`, borderRadius: 2, background: i / 40 < head ? T.accent : T.ink3 }} />;
          })}
          <div style={{ position: "absolute", left: `${head * 100}%`, top: -8, bottom: -8, width: 3, background: T.cream }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 18 }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcPause size={26} />
          </div>
          <div style={{ fontSize: 15, color: T.ink3, fontWeight: 700, letterSpacing: 1 }}>TRANSCRIPCIÓN</div>
        </div>
        <div style={{ fontSize: 24, lineHeight: 1.4, marginTop: 12, fontWeight: 600 }}>
          {agentWords.map((w, i) => {
            const on = f >= w.at;
            const hot = /gratis/.test(w.w);
            return (
              <span key={i} style={{ color: on ? (hot ? T.accent : T.ink) : T.ink3, background: on && hot ? "rgba(124,195,176,0.2)" : "none", borderRadius: 4 }}>
                {w.w}{" "}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};

// Ficha de esa llamada con el resumen de IA
const HowStory: React.FC<{ f: number; s: Scene }> = ({ f, s }) => {
  const c = s.cues[0];
  const word = (k: string) => c.words.find((w) => w.w.toLowerCase().startsWith(k))?.at ?? 0;
  const steps = [
    { k: "graba", label: "Graba" },
    { k: "transcribe", label: "Transcribe" },
    { k: "resume", label: "Resume con IA" },
  ];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "62px 24px 0" }}>
        <Avatar size={56} initials="AC" />
        <div>
          <div style={{ fontSize: 23, fontWeight: 700 }}>Atención al cliente</div>
          <div style={{ fontSize: 16, color: T.ink2 }}>12 mar · 11:04 · 8:42</div>
        </div>
      </div>
      <div style={{ padding: "22px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((st, i) => {
          const a = pop(f, word(st.k) - 2, 12);
          return (
            <div
              key={st.k}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: T.surface,
                border: `1.5px solid ${T.accent}`,
                borderRadius: 18,
                padding: "16px 18px",
                fontSize: 24,
                fontWeight: 700,
                opacity: Math.min(1, a),
                transform: `translateX(${(1 - a) * 60}px)`,
              }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 17, background: T.accent, color: T.onAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 900 }}>
                {i + 1}
              </div>
              {st.label}
              <div style={{ marginLeft: "auto" }}>
                <IcCheck size={28} />
              </div>
            </div>
          );
        })}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 22, padding: 20, opacity: ease(f, word("resume") + 4, 12) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <IcSpark size={20} />
            <div style={{ color: T.ink3, fontSize: 15, fontWeight: 700, letterSpacing: 1.2 }}>RESUMEN</div>
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.42 }}>
            Te confirman la instalación <b style={{ color: T.accent }}>gratis</b>, cuota de 29,90 € al mes y permanencia de 12 meses.
          </div>
          <div style={{ height: 1, background: T.line, margin: "14px 0" }} />
          <div style={{ color: T.ink3, fontSize: 15, fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>TAREAS</div>
          {["Revisar la primera factura", "Guardar el número de incidencia"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", fontSize: 19, fontWeight: 600 }}>
              <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${T.accent}` }} />
              {t}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ---------- Victoria: día, hora, minuto + cargo anulado ----------
const WinStory: React.FC<{ f: number; s: Scene; gf: number }> = ({ f, s, gf }) => {
  const c = s.cues[0];
  const at = (k: string) => c.words.find((w) => w.w.toLowerCase().startsWith(k))?.at ?? 0;
  const chips = [
    { k: "día", t: "12 de marzo" },
    { k: "hora", t: "11:04" },
    { k: "minuto", t: "Minuto 03:27" },
  ];
  const note = pop(gf, EV.refund, 11);
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, fontFamily: FONT }}>
        {chips.map((ch, i) => {
          const a = pop(f, at(ch.k) - 2, 11);
          return (
            <div
              key={ch.k}
              style={{
                background: i === 2 ? T.accent : T.surface,
                color: i === 2 ? T.onAccent : T.ink,
                border: `2px solid ${T.accent}`,
                borderRadius: 22,
                padding: "16px 34px",
                fontSize: 54,
                fontWeight: 900,
                opacity: Math.min(1, a),
                transform: `scale(${0.5 + 0.5 * a}) rotate(${(i - 1) * 2}deg)`,
              }}
            >
              {ch.t}
            </div>
          );
        })}
      </div>
      {gf >= EV.refund - 2 ? (
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 160,
            top: 1300,
            background: T.okSoft,
            border: `2px solid ${T.ok}`,
            borderRadius: 26,
            padding: "20px 24px",
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontFamily: FONT,
            transform: `translateY(${(1 - note) * 120}px)`,
            opacity: Math.min(1, note),
            boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ width: 64, height: 64, borderRadius: 32, background: T.call, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcCheck size={40} color="#fff" />
          </div>
          <div>
            <div style={{ color: T.ink, fontSize: 32, fontWeight: 800 }}>Cargo anulado</div>
            <div style={{ color: T.ok, fontSize: 28, fontWeight: 700 }}>−49,90 € en tu factura</div>
          </div>
        </div>
      ) : null}
    </>
  );
};

// ---------- Cierre ----------
const EndCard: React.FC<{ f: number; gf: number }> = ({ f, gf }) => {
  const s = pop(f, 4, 10);
  const p = beatPulse(gf);
  return (
    <AbsoluteFill style={{ alignItems: "center", fontFamily: FONT }}>
      <div style={{ marginTop: 300, fontSize: 96, fontWeight: 900, color: "#fff", letterSpacing: -3, textAlign: "center", lineHeight: 1, padding: "0 140px 0 60px", opacity: Math.min(1, s), transform: `scale(${0.7 + 0.3 * s})` }}>
        Que no te <span style={{ color: RED }}>la cuelen.</span>
      </div>
      <div style={{ marginTop: 70, transform: `scale(${0.6 + 0.4 * pop(f, 30, 10)})` }}>
        <AppIcon size={210} dotPulse={p} />
      </div>
      <div style={{ fontSize: 130, fontWeight: 800, color: T.ink, letterSpacing: -4, marginTop: 10, opacity: ease(f, 32, 10) }}>Acta</div>
      <div style={{ fontSize: 46, fontWeight: 700, color: T.accent, marginTop: 4, opacity: ease(f, 40, 10) }}>Tus llamadas, con memoria</div>
      <div
        style={{
          marginTop: 50,
          background: T.accent,
          color: T.onAccent,
          fontSize: 42,
          fontWeight: 800,
          padding: "22px 56px",
          borderRadius: 60,
          opacity: ease(f, 55, 10),
          transform: `scale(${1 + 0.04 * p})`,
          boxShadow: `0 0 ${40 + 30 * p}px rgba(124,195,176,0.45)`,
        }}
      >
        Pruébala hoy
      </div>
      <div style={{ position: "absolute", top: 1440, left: 80, right: 150, textAlign: "center", color: T.ink3, fontSize: 23, lineHeight: 1.3, opacity: ease(f, 60, 15) }}>
        Historia dramatizada. Respeta la normativa sobre grabación de llamadas de tu país.
      </div>
    </AbsoluteFill>
  );
};

export const StoryReel: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const sc = SCENES[i];
  const f = gf - sc.start;
  const n = sc.name;
  // móvil visible en búsqueda y en «cómo funciona»
  const phoneScenes = ["search", "how"];
  const inPhone = phoneScenes.includes(n);
  const enter = inPhone ? pop(f, 0, 15) : 0;
  const capY = n === "hook" || n === "deny" ? 1180 : n === "acta" ? 1180 : n === "win" ? 690 : n === "end" ? -9999 : 1330;
  const endFade = interpolate(gf, [STORY_DURATION - 18, STORY_DURATION], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: T.bg, opacity: endFade }}>
      <Audio src={staticFile("acta2/mix.wav")} />
      <AbsoluteFill style={{ filter: freezeFilter(gf) }}>
        <Backdrop gf={gf} />
        {n === "hook" ? <CallCard f={f} /> : null}
        <Bill gf={gf} />
        <DenyBubble gf={gf} />
        {n === "hook" || n === "deny" ? <PovBanner gf={gf} /> : null}
        {n === "acta" ? <ActaSlam f={f} gf={gf} /> : null}
        {inPhone ? (
          <PhoneFrame x={(W - SW - 24) / 2} y={300 + (1 - enter) * 1400} scale={0.98} rot={n === "how" ? 2 : -2}>
            {n === "search" ? <SearchStory f={f} s={sc} gf={gf} /> : <HowStory f={f} s={sc} />}
          </PhoneFrame>
        ) : null}
        {n === "win" ? <WinStory f={f} s={sc} gf={gf} /> : null}
        {n === "end" ? <EndCard f={f} gf={gf} /> : null}
        <Captions gf={gf} y={capY} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
