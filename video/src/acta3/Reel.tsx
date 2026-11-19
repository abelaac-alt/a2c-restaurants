import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing.json";
import { SH, SW } from "../acta/screens";
import { AppIcon, Avatar, FONT, IcCheck, IcPause, IcPhone, IcSearch, IcSpark, T, Tap, ease, pop } from "../acta/theme";

type Word = { w: string; at: number };
type Cue = { id: string; at: number; dur: number; text: string; agent: boolean; words: Word[] };
type Scene = { name: string; start: number; dur: number; cues: Cue[] };
const SCENES = timing.scenes as Scene[];
const EV = timing.events;
export const CASERO_DURATION = timing.total;
const W = 1080;
const BEATF = (60 / timing.bpm) * 30; // fotogramas por pulso
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sc = (n: string) => SCENES.find((s) => s.name === n)!;
const RED = "#ff5d4f";
const GOLD = "#ffcf5c";
const eur = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pulse = (gf: number) => Math.exp(-((gf - EV.drop + 1000 * BEATF) % BEATF) / 4);
const wordAt = (s: Scene, id: string, prefix: string) => {
  const c = s.cues.find((x) => x.id === id)!;
  const w = c.words.find((x) => x.w.toLowerCase().replace(/[^\wáéíóúñ€.:]/g, "").startsWith(prefix));
  return s.start + (w ? w.at : c.at);
};

// ---------- Subtítulos palabra a palabra ----------
const HOT: [RegExp, string][] = [
  [/^1\.200/, RED],
  [/^nunca/, RED],
  [/^quedo/, RED],
  [/^acta/, T.accent],
  [/^pintar/, T.accent],
  [/^1:42/, T.accent],
  [/^devuelta/, T.ok],
  [/^entera/, T.ok],
  [/^fianza/, GOLD],
  [/^esperaba/, GOLD],
  [/^ya/, T.accent],
  [/^no\.$/, T.accent],
];
const chunks = (ws: Word[]) => {
  const out: Word[][] = [];
  let cur: Word[] = [];
  ws.forEach((w) => {
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
  for (const s of SCENES)
    for (const c of s.cues) {
      const a0 = s.start + c.at;
      if (gf < a0 || gf > a0 + c.dur + 6) continue;
      const cs = chunks(c.words);
      let idx = 0;
      cs.forEach((ch, i) => {
        if (gf >= s.start + ch[0].at) idx = i;
      });
      const ch = cs[idx];
      const a = pop(gf, s.start + ch[0].at, 12);
      return (
        <div
          style={{
            position: "absolute",
            top: y,
            left: 50,
            right: 130,
            textAlign: "center",
            fontFamily: FONT,
            fontSize: c.agent ? 64 : 86,
            fontWeight: 900,
            fontStyle: c.agent ? "italic" : "normal",
            lineHeight: 1.04,
            letterSpacing: -1.5,
            transform: `scale(${0.82 + 0.18 * Math.min(1, a)}) rotate(${c.agent ? -1 : 0}deg)`,
            textShadow: "0 6px 0 rgba(0,0,0,0.6), 0 0 34px rgba(0,0,0,0.7)",
            WebkitTextStroke: "2px rgba(0,0,0,0.45)",
          }}
        >
          {c.agent ? <span style={{ color: "#ffb4ab" }}>{idx === 0 ? "«" : ""}</span> : null}
          {ch.map((w, i) => {
            const on = gf >= s.start + w.at;
            const k = w.w.toLowerCase().replace(/^[«¿¡]/, "");
            const hot = HOT.find(([r]) => r.test(k))?.[1];
            const base = c.agent ? "#ffd9d4" : "#fff";
            return (
              <span key={i} style={{ color: on ? hot ?? base : "rgba(255,255,255,0.5)", marginRight: 20, display: "inline-block" }}>
                {w.w}
              </span>
            );
          })}
          {c.agent && idx === cs.length - 1 ? <span style={{ color: "#ffb4ab" }}>»</span> : null}
        </div>
      );
    }
  return null;
};

// ---------- Fondo según el momento de la historia ----------
const Backdrop: React.FC<{ gf: number; name: string }> = ({ gf, name }) => {
  const green = ease(gf, EV.drop, 5);
  const p = gf >= EV.drop ? pulse(gf) : 0;
  const red = name === "hook" || name === "conflict" ? 0.16 + 0.08 * Math.abs(Math.sin(gf / 9)) : name === "turn" ? 0.08 : 0;
  return (
    <AbsoluteFill style={{ background: T.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 42%, rgba(170,45,35,${red * (1 - green)}) 0%, rgba(0,0,0,0) 70%)` }} />
      {name === "flash" ? <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 50% 45%, rgba(200,150,80,0.22) 0%, rgba(0,0,0,0) 70%)" }} /> : null}
      <div
        style={{
          position: "absolute",
          left: -10,
          top: 420,
          width: 1100,
          height: 1100,
          borderRadius: "50%",
          opacity: green,
          background: `radial-gradient(circle, rgba(124,195,176,${0.2 + 0.14 * p}) 0%, rgba(124,195,176,0) 62%)`,
          transform: `scale(${1 + 0.06 * p})`,
        }}
      />
    </AbsoluteFill>
  );
};

const TopTag: React.FC<{ children: React.ReactNode; bg?: string; color?: string; rot?: number }> = ({ children, bg = "#fff", color = "#0b0b0b", rot = -2 }) => (
  <div style={{ position: "absolute", top: 240, left: 50, right: 130, display: "flex", justifyContent: "center" }}>
    <div style={{ background: bg, color, fontFamily: FONT, fontWeight: 900, fontSize: 50, padding: "14px 30px", borderRadius: 16, transform: `rotate(${rot}deg)`, letterSpacing: 1 }}>
      {children}
    </div>
  </div>
);

// ---------- 1. Gancho: la fianza ----------
const Deposit: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("hook");
  const f = gf - s.start;
  const grab = wordAt(s, "n1", "quedarse");
  const g = ease(gf, grab, 10);
  const stamp = pop(gf, grab + 6, 9);
  const punch = (h: number) => (gf >= h && gf < h + 10 ? 1 - (gf - h) / 10 : 0);
  const k = Math.max(punch(EV.hit1), punch(EV.hit2));
  return (
    <div
      style={{
        position: "absolute",
        left: 140,
        right: 220,
        top: 520,
        transform: `translateX(${g * 40}px) rotate(${-4 + g * 6}deg) scale(${1 + 0.12 * k}) translateY(${Math.sin(gf * 3) * 14 * k}px)`,
        opacity: 1 + 0 * f,
      }}
    >
      <div style={{ background: "#fbfaf6", borderRadius: 20, padding: "30px 34px", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", fontFamily: FONT, color: "#222" }}>
        <div style={{ fontSize: 24, color: "#777", fontWeight: 700, letterSpacing: 2 }}>CONTRATO DE ALQUILER</div>
        <div style={{ height: 2, background: "#ddd", margin: "14px 0" }} />
        <div style={{ fontSize: 34, color: "#555" }}>Fianza depositada</div>
        <div style={{ fontSize: 110, fontWeight: 900, letterSpacing: -4, color: "#111" }}>1.200 €</div>
        <div style={{ fontSize: 26, color: "#777" }}>A devolver al finalizar el contrato</div>
      </div>
      <div
        style={{
          position: "absolute",
          right: -50,
          top: 250,
          transform: `rotate(-12deg) scale(${stamp})`,
          border: `7px solid ${RED}`,
          color: RED,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 62,
          padding: "4px 20px",
          borderRadius: 12,
          background: "rgba(251,250,246,0.92)",
        }}
      >
        RETENIDA
      </div>
    </div>
  );
};
const flashWhite = (gf: number) => {
  const v = (h: number) => (gf >= h && gf < h + 6 ? 1 - (gf - h) / 6 : 0);
  return Math.max(v(EV.hit1), v(EV.hit2), gf >= EV.drop && gf < EV.drop + 8 ? 1 - (gf - EV.drop) / 8 : 0);
};

// ---------- 2. Recuerdo: hace un año ----------
const Flashback: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("flash");
  const f = gf - s.start;
  const n4 = s.cues[1];
  const paint = interpolate(f, [n4.at, n4.at + n4.dur + 10], [0, 1], clamp);
  const card = pop(f, s.cues[0].at + 10, 12);
  return (
    <>
      <TopTag bg={GOLD} rot={2}>
        ◀◀ HACE 1 AÑO
      </TopTag>
      {/* pared del salón que se pinta */}
      <div style={{ position: "absolute", left: 120, right: 200, top: 420, height: 560, borderRadius: 24, overflow: "hidden", background: "#d9cbb2", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${paint * 100}%`, background: "#3f8f7f" }} />
        <div style={{ position: "absolute", left: 60, bottom: 0, width: 200, height: 120, background: "rgba(0,0,0,0.15)", borderRadius: "12px 12px 0 0" }} />
        <div style={{ position: "absolute", right: 70, top: 90, width: 170, height: 120, border: "8px solid rgba(255,255,255,0.7)", borderRadius: 6 }} />
        {paint > 0 && paint < 1 ? (
          <div style={{ position: "absolute", left: `calc(${paint * 100}% - 40px)`, top: 140 + Math.sin(f / 3) * 120, width: 80, height: 170 }}>
            <div style={{ width: 80, height: 46, background: "#2f7466", borderRadius: 10 }} />
            <div style={{ width: 10, height: 120, background: "#ddd", margin: "0 auto" }} />
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 24, top: 18, fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "rgba(0,0,0,0.45)" }}>El salón</div>
      </div>
      {/* la llamada, que Acta grabó */}
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 230,
          top: 900,
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 26,
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: FONT,
          opacity: Math.min(1, card),
          transform: `translateY(${(1 - card) * 60}px)`,
          boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
        }}
      >
        <Avatar size={70} initials="M" bg={T.av2bg} fg={T.av2fg} />
        <div style={{ flex: 1 }}>
          <div style={{ color: T.ink, fontSize: 30, fontWeight: 700 }}>Manolo (casero)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#ffb4ab", fontSize: 22, fontWeight: 700, marginTop: 4 }}>
            <div style={{ width: 11, height: 11, borderRadius: 6, background: T.rec, opacity: 0.4 + 0.6 * Math.abs(Math.cos(f / 8)) }} />
            Acta · grabando
          </div>
        </div>
      </div>
    </>
  );
};

// ---------- 3. Conflicto ----------
const Conflict: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("conflict");
  const f = gf - s.start;
  const [c5, l1, c6] = s.cues;
  const ring = f < l1.at;
  const callIn = pop(f, c5.at + Math.round(c5.dur * 0.6), 12);
  const inCall = gf >= EV.l1 && gf < EV.l1_end + 6;
  const showMoney = f >= c6.at - 2;
  const zero = wordAt(s, "n6", "sin");
  const vs = wordAt(s, "n6", "su");
  const amount = Math.round(interpolate(gf, [zero, zero + 14], [1200, 0], clamp));
  const vsA = pop(gf, vs, 11);
  if (showMoney)
    return (
      <>
        <div style={{ position: "absolute", top: 380, left: 0, right: 80, textAlign: "center", fontFamily: FONT }}>
          <div style={{ fontSize: 40, color: T.ink2, fontWeight: 700 }}>Tu fianza</div>
          <div style={{ fontSize: 190, fontWeight: 900, letterSpacing: -8, color: amount === 0 ? RED : "#fff", fontVariantNumeric: "tabular-nums", transform: `scale(${amount === 0 ? 1 + 0.05 * Math.sin(gf / 3) : 1})` }}>
            {eur(amount)} €
          </div>
        </div>
        <div style={{ position: "absolute", top: 760, left: 90, right: 170, display: "flex", justifyContent: "space-between", alignItems: "center", opacity: Math.min(1, vsA), transform: `scale(${0.7 + 0.3 * vsA})` }}>
          <div style={{ textAlign: "center", fontFamily: FONT }}>
            <Avatar size={150} initials="M" bg={T.av2bg} fg={T.av2fg} />
            <div style={{ color: T.ink, fontSize: 32, fontWeight: 700, marginTop: 10 }}>Su palabra</div>
          </div>
          <div style={{ color: RED, fontFamily: FONT, fontSize: 90, fontWeight: 900 }}>VS</div>
          <div style={{ textAlign: "center", fontFamily: FONT }}>
            <Avatar size={150} initials="TÚ" />
            <div style={{ color: T.ink, fontSize: 32, fontWeight: 700, marginTop: 10 }}>La tuya</div>
          </div>
        </div>
      </>
    );
  return (
    <>
      <TopTag>UN AÑO DESPUÉS…</TopTag>
      <div
        style={{
          position: "absolute",
          left: 150,
          right: 230,
          top: 420,
          background: inCall ? "#2a1412" : T.surface,
          border: `2px solid ${inCall ? RED : T.line}`,
          borderRadius: 34,
          padding: "34px 30px",
          textAlign: "center",
          fontFamily: FONT,
          opacity: Math.min(1, callIn),
          transform: `scale(${0.8 + 0.2 * callIn}) rotate(${ring ? Math.sin(f * 1.6) * 2 : 0}deg)`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ color: T.ink2, fontSize: 26 }}>{inCall ? "En llamada" : "Llamada entrante"}</div>
        <div style={{ display: "flex", justifyContent: "center", margin: "22px 0" }}>
          <Avatar size={170} initials="M" bg={T.av2bg} fg={T.av2fg} />
        </div>
        <div style={{ color: T.ink, fontSize: 44, fontWeight: 800 }}>Manolo (casero)</div>
        <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {Array.from({ length: 22 }, (_, i) => (
            <div key={i} style={{ width: 9, height: `${(inCall ? 20 + 80 * Math.abs(Math.sin(gf * 0.5 + i * 0.8) * Math.sin(gf * 0.23 + i)) : 10)}%`, background: inCall ? RED : T.ink3, borderRadius: 4 }} />
          ))}
        </div>
      </div>
    </>
  );
};

// ---------- 4. Giro: Acta ----------
const Turn: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("turn");
  const pre = ease(gf, s.start + 10, 20);
  const slam = pop(gf, EV.drop, 8);
  const after = gf >= EV.drop;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ marginTop: -300, transform: after ? `scale(${0.4 + 0.75 * slam}) rotate(${(1 - slam) * -25}deg)` : `scale(${0.4 + 0.15 * pre})`, opacity: after ? 1 : 0.85 * pre, filter: after ? "none" : "grayscale(1)" }}>
        <AppIcon size={360} dotPulse={after ? pulse(gf) : 0} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Móvil ----------
const PhoneFrame: React.FC<{ y: number; rot?: number; children: React.ReactNode }> = ({ y, rot = 0, children }) => (
  <div
    style={{
      position: "absolute",
      left: (W - SW - 24) / 2 - 20,
      top: y,
      width: SW + 24,
      height: SH + 24,
      transform: `scale(0.98) rotate(${rot}deg)`,
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

const QUERY = "pintar";
const SearchScreen: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("search");
  const f = gf - s.start;
  const [c8, l2] = s.cues;
  const typeStart = c8.at + 4;
  const typed = Math.floor(interpolate(f, [typeStart, typeStart + 18], [0, QUERY.length], clamp));
  const res = ease(f, typeStart + 22, 12);
  const tapAt = c8.at + Math.round(c8.dur * 0.62);
  const sheet = ease(f, tapAt + 3, 12);
  const head = interpolate(f, [tapAt + 8, tapAt + 22], [0.1, 0.33], clamp);
  const playing = f >= l2.at;
  return (
    <>
      <div style={{ padding: "64px 20px 0" }}>
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 18 }}>Buscar</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface2, borderRadius: 18, padding: "16px 18px", border: `1.5px solid ${typed ? T.accent : T.line}` }}>
          <IcSearch size={26} />
          <div style={{ fontSize: 24, color: typed ? T.ink : T.ink3 }}>
            {typed ? QUERY.slice(0, typed) : "Buscar en lo que se habló"}
            {f < typeStart + 30 && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: T.accent }}>|</span> : null}
          </div>
        </div>
        <div style={{ marginTop: 20, opacity: res, transform: `translateY(${(1 - res) * 20}px)` }}>
          <div style={{ fontSize: 15, color: T.ink3, marginBottom: 12 }}>1 llamada · hace 1 año</div>
          <div style={{ background: T.surface, border: `1.5px solid ${T.accent}`, borderRadius: 22, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar size={46} initials="M" bg={T.av2bg} fg={T.av2fg} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 19, fontWeight: 700 }}>Manolo (casero)</div>
                <div style={{ fontSize: 14, color: T.ink3 }}>14 mar 2025 · 19:12 · 3:05</div>
              </div>
              <div style={{ fontSize: 17, color: T.onAccent, fontWeight: 800, background: T.accent, borderRadius: 10, padding: "5px 11px" }}>01:42</div>
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.4, color: T.ink2, marginTop: 12 }}>
              «Sí, mujer,{" "}
              <span style={{ background: "rgba(124,195,176,0.28)", color: T.accent, borderRadius: 4, padding: "0 3px", fontWeight: 800 }}>pinta</span> el salón del color que
              quieras…»
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
          height: 540,
          background: T.surface,
          borderTop: `1px solid ${T.line}`,
          borderRadius: "28px 28px 0 0",
          padding: "24px 22px",
          transform: `translateY(${(1 - sheet) * 580}px)`,
        }}
      >
        <div style={{ width: 50, height: 5, borderRadius: 3, background: T.line, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Manolo (casero)</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: T.accent, fontVariantNumeric: "tabular-nums" }}>01:42</div>
        </div>
        <div style={{ position: "relative", height: 56, display: "flex", alignItems: "center", gap: 3, marginTop: 16 }}>
          {Array.from({ length: 40 }, (_, i) => {
            const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.3 + 2) * Math.sin(i * 0.5 + 1));
            const live = playing && Math.abs(i / 40 - head - 0.02) < 0.05 ? 0.6 + 0.4 * Math.abs(Math.sin(gf * 0.6 + i)) : 1;
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
        <div style={{ fontSize: 25, lineHeight: 1.4, marginTop: 12, fontWeight: 600 }}>
          {l2.words.map((w, i) => {
            const on = f >= w.at;
            const hot = /pinta/i.test(w.w);
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

const HowScreen: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("how");
  const at = (p: string) => wordAt(s, "n10", p);
  const steps = [
    { k: "graba", label: "Graba la llamada" },
    { k: "transcribe", label: "La transcribe" },
    { k: "resume", label: "Resume lo acordado" },
  ];
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "62px 24px 0" }}>
        <Avatar size={56} initials="M" bg={T.av2bg} fg={T.av2fg} />
        <div>
          <div style={{ fontSize: 23, fontWeight: 700 }}>Manolo (casero)</div>
          <div style={{ fontSize: 16, color: T.ink2 }}>14 mar 2025 · 19:12 · 3:05</div>
        </div>
      </div>
      <div style={{ padding: "22px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        {steps.map((st, i) => {
          const a = pop(gf, at(st.k) - 2, 12);
          return (
            <div
              key={st.k}
              style={{ display: "flex", alignItems: "center", gap: 14, background: T.surface, border: `1.5px solid ${T.accent}`, borderRadius: 18, padding: "16px 18px", fontSize: 24, fontWeight: 700, opacity: Math.min(1, a), transform: `translateX(${(1 - a) * 60}px)` }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 17, background: T.accent, color: T.onAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 900 }}>{i + 1}</div>
              {st.label}
              <div style={{ marginLeft: "auto" }}>
                <IcCheck size={28} />
              </div>
            </div>
          );
        })}
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 22, padding: 20, opacity: ease(gf, at("resume") + 4, 12) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <IcSpark size={20} />
            <div style={{ color: T.ink3, fontSize: 15, fontWeight: 700, letterSpacing: 1.2 }}>RESUMEN</div>
          </div>
          <div style={{ fontSize: 21, lineHeight: 1.42 }}>
            Manolo autoriza <b style={{ color: T.accent }}>pintar el salón</b> del color que quieras, sin coste ni condiciones.
          </div>
          <div style={{ height: 1, background: T.line, margin: "14px 0" }} />
          <div style={{ color: T.ink3, fontSize: 15, fontWeight: 700, letterSpacing: 1.2, marginBottom: 8 }}>TAREAS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 19, fontWeight: 600 }}>
            <div style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${T.accent}` }} />
            Comprar pintura
          </div>
        </div>
      </div>
    </>
  );
};

// ---------- 6. Victoria ----------
const Confetti: React.FC<{ gf: number; at: number }> = ({ gf, at }) => {
  const f = gf - at;
  if (f < 0 || f > 70) return null;
  const cols = [T.accent, GOLD, T.ok, "#fff", RED];
  return (
    <>
      {Array.from({ length: 70 }, (_, i) => {
        const ang = (i * 137.5 * Math.PI) / 180;
        const v = 14 + (i % 7) * 3;
        const x = 540 + Math.cos(ang) * v * f;
        const y = 1000 + Math.sin(ang) * v * f * 0.8 + 0.45 * f * f;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 16, height: 26, background: cols[i % 5], transform: `rotate(${f * 12 + i * 30}deg)`, opacity: 1 - f / 70, borderRadius: 3 }} />;
      })}
    </>
  );
};
const Win: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("win");
  const sent = wordAt(s, "n9", "mando");
  const later = wordAt(s, "n9", "dos");
  const sentA = pop(gf, sent - 2, 12);
  const laterA = ease(gf, later, 8);
  const note = pop(gf, EV.refund - 2, 10);
  const amount = Math.round(interpolate(gf, [EV.refund, EV.refund + 16], [0, 1200], clamp));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 120,
          right: 200,
          top: 380,
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 26,
          padding: "20px 24px",
          fontFamily: FONT,
          opacity: Math.min(1, sentA) * (1 - 0.5 * laterA),
          transform: `translateY(${(1 - sentA) * 50}px) scale(${1 - 0.08 * laterA})`,
        }}
      >
        <div style={{ color: T.ink2, fontSize: 22 }}>Compartir grabación · 01:42</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
          <Avatar size={56} initials="M" bg={T.av2bg} fg={T.av2fg} />
          <div style={{ flex: 1, color: T.ink, fontSize: 28, fontWeight: 700 }}>Enviado a Manolo</div>
          <IcCheck size={36} />
        </div>
      </div>
      <div style={{ position: "absolute", top: 640, left: 0, right: 80, textAlign: "center", fontFamily: FONT, opacity: laterA }}>
        <div style={{ display: "inline-block", background: GOLD, color: "#111", fontWeight: 900, fontSize: 46, padding: "10px 26px", borderRadius: 14, transform: "rotate(-2deg)" }}>2 HORAS DESPUÉS…</div>
      </div>
      {gf >= EV.refund - 2 ? (
        <>
          <div
            style={{
              position: "absolute",
              left: 90,
              right: 170,
              top: 780,
              background: T.okSoft,
              border: `3px solid ${T.ok}`,
              borderRadius: 30,
              padding: "26px 28px",
              fontFamily: FONT,
              transform: `translateY(${(1 - note) * 120}px) scale(${0.85 + 0.15 * note})`,
              opacity: Math.min(1, note),
              boxShadow: "0 30px 80px rgba(0,0,0,0.55), 0 0 60px rgba(111,211,154,0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 70, height: 70, borderRadius: 35, background: T.call, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IcCheck size={44} color="#fff" />
              </div>
              <div>
                <div style={{ color: T.ink, fontSize: 32, fontWeight: 800 }}>Transferencia recibida</div>
                <div style={{ color: T.ink2, fontSize: 24 }}>Concepto: devolución fianza</div>
              </div>
            </div>
            <div style={{ color: T.ok, fontSize: 120, fontWeight: 900, letterSpacing: -5, marginTop: 10, fontVariantNumeric: "tabular-nums" }}>+{eur(amount)} €</div>
          </div>
          <Confetti gf={gf} at={EV.refund + 2} />
        </>
      ) : null}
    </>
  );
};

// ---------- 8. Cierre ----------
const End: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("end");
  const f = gf - s.start;
  const c = s.cues[0];
  const blowAt = s.start + (c.words.find((w) => w.w.startsWith("viento"))?.at ?? c.at + 40) + 4;
  const line1 = "Las palabras se las lleva el viento.".split(" ");
  const yaAt = s.start + (c.words.find((w) => w.w.toLowerCase().startsWith("tuyas"))?.at ?? 60);
  const t2 = pop(gf, yaAt - 2, 11);
  const logo = pop(gf, s.start + c.at + c.dur + 4, 10);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
      <div style={{ marginTop: 300, padding: "0 140px 0 60px", textAlign: "center", fontSize: 74, fontWeight: 900, lineHeight: 1.08, letterSpacing: -2 }}>
        {line1.map((w, i) => {
          const wa = s.start + (c.words[i]?.at ?? 0);
          const a = pop(gf, wa, 12);
          const blow = Math.max(0, gf - blowAt - i * 2);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 16,
                color: "#fff",
                opacity: Math.min(1, a) * Math.max(0, 1 - blow / 22),
                transform: `translate(${blow * blow * 0.9}px, ${-blow * 2.5}px) rotate(${blow * 3}deg)`,
                filter: `blur(${blow * 0.4}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: -90, fontSize: 104, fontWeight: 900, letterSpacing: -4, color: T.accent, opacity: Math.min(1, t2), transform: `scale(${0.6 + 0.4 * t2})`, textShadow: "0 0 40px rgba(124,195,176,0.4)" }}>
        Las tuyas, ya no.
      </div>
      <div style={{ marginTop: 80, display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, logo), transform: `scale(${0.7 + 0.3 * logo})` }}>
        <AppIcon size={150} dotPulse={pulse(gf)} />
        <div>
          <div style={{ fontSize: 110, fontWeight: 800, color: T.ink, letterSpacing: -4, lineHeight: 1 }}>Acta</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: T.ink2 }}>Tus llamadas, con memoria</div>
        </div>
      </div>
      <div
        style={{
          marginTop: 56,
          background: T.accent,
          color: T.onAccent,
          fontSize: 44,
          fontWeight: 800,
          padding: "22px 56px",
          borderRadius: 60,
          opacity: ease(f, c.at + c.dur + 14, 10),
          transform: `scale(${1 + 0.04 * pulse(gf)})`,
          boxShadow: `0 0 ${40 + 30 * pulse(gf)}px rgba(124,195,176,0.45)`,
        }}
      >
        Pruébala hoy
      </div>
      <div style={{ position: "absolute", top: 1450, left: 80, right: 150, textAlign: "center", color: T.ink3, fontSize: 23, lineHeight: 1.3, opacity: ease(f, c.at + c.dur + 20, 15) }}>
        Historia dramatizada. Respeta la normativa sobre grabación de llamadas de tu país.
      </div>
    </AbsoluteFill>
  );
};

export const CaseroReel: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const s = SCENES[i];
  const f = gf - s.start;
  const n = s.name;
  const phone = n === "search" || n === "how";
  const enter = phone ? pop(f, 0, 15) : 0;
  const capY: Record<string, number> = { hook: 1180, flash: 1150, conflict: 1180, turn: 1180, search: 1340, win: 1250, how: 1340, end: -9999 };
  const zoom = n === "hook" ? 1 + 0.03 * (f / s.dur) : 1;
  const endFade = interpolate(gf, [CASERO_DURATION - 18, CASERO_DURATION], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: T.bg, opacity: endFade }}>
      <Audio src={staticFile("acta3/mix.wav")} />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: n === "flash" ? "sepia(0.55) saturate(0.8)" : "none" }}>
        <Backdrop gf={gf} name={n} />
        {n === "hook" ? (
          <>
            <TopTag>STORYTIME</TopTag>
            <Deposit gf={gf} />
          </>
        ) : null}
        {n === "flash" ? <Flashback gf={gf} /> : null}
        {n === "conflict" ? <Conflict gf={gf} /> : null}
        {n === "turn" ? <Turn gf={gf} /> : null}
        {phone ? (
          <PhoneFrame y={300 + (1 - enter) * 1400} rot={n === "how" ? 2 : -2}>
            {n === "search" ? <SearchScreen gf={gf} /> : <HowScreen gf={gf} />}
          </PhoneFrame>
        ) : null}
        {n === "win" ? <Win gf={gf} /> : null}
        {n === "end" ? <End gf={gf} /> : null}
        <Captions gf={gf} y={capY[n]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: 0.7 * flashWhite(gf), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
