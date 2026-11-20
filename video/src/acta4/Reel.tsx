import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing.json";
import { SH, SW } from "../acta/screens";
import { AppIcon, FONT, IcCal, IcSpark, T, ease, pop } from "../acta/theme";
import { Pedro } from "./Pedro";

type Word = { w: string; at: number };
type Cue = { id: string; at: number; dur: number; text: string; pedro: boolean; words: Word[] };
type Scene = { name: string; start: number; dur: number; cues: Cue[]; extra_from: number | null };
const SCENES = timing.scenes as Scene[];
const EV = timing.events;
export const PLATOS_DURATION = timing.total;
const W = 1080;
const BEATF = (60 / timing.bpm) * 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const sc = (n: string) => SCENES.find((s) => s.name === n)!;
const RED = "#ff5d4f";
const GOLD = "#ffcf5c";
const pulse = (gf: number) => (gf >= EV.drop ? Math.exp(-((gf - EV.drop) % BEATF) / 4) : 0);
const wordAt = (s: Scene, id: string, prefix: string) => {
  const c = s.cues.find((x) => x.id === id)!;
  const w = c.words.find((x) => x.w.toLowerCase().replace(/[^\wáéíóúñ]/g, "").startsWith(prefix));
  return s.start + (w ? w.at : c.at);
};

// ---------- subtítulos ----------
const HOT: [RegExp, string][] = [
  [/^palabra/, GOLD],
  [/^nunca/, RED],
  [/^amnesia/, RED],
  [/^acta/, T.accent],
  [/^aprobé/, T.ok],
  [/^primera/, T.ok],
  [/^platos/, GOLD],
  [/^30/, T.accent],
  [/^bucle/, T.accent],
  [/^pedro/, GOLD],
  [/^sartén/, GOLD],
  [/^día/, T.accent],
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
            fontSize: c.pedro ? 70 : 86,
            fontWeight: 900,
            fontStyle: c.pedro ? "italic" : "normal",
            lineHeight: 1.04,
            letterSpacing: -1.5,
            transform: `scale(${0.82 + 0.18 * Math.min(1, a)}) rotate(${c.pedro ? -1.5 : 0}deg)`,
            textShadow: "0 6px 0 rgba(0,0,0,0.6), 0 0 34px rgba(0,0,0,0.7)",
            WebkitTextStroke: "2px rgba(0,0,0,0.45)",
          }}
        >
          {c.pedro ? <span style={{ color: "#9fd8ff", fontSize: 40, display: "block", fontStyle: "normal", fontWeight: 800, marginBottom: 6 }}>PEDRO</span> : null}
          {ch.map((w, i) => {
            const on = gf >= s.start + w.at;
            const k = w.w.toLowerCase().replace(/^[«¿¡]/, "");
            const hot = HOT.find(([r]) => r.test(k))?.[1];
            return (
              <span key={i} style={{ color: on ? hot ?? (c.pedro ? "#dff2ff" : "#fff") : "rgba(255,255,255,0.5)", marginRight: 20, display: "inline-block" }}>
                {w.w}
              </span>
            );
          })}
        </div>
      );
    }
  return null;
};

// ---------- piezas comunes ----------
const Backdrop: React.FC<{ gf: number; name: string }> = ({ gf, name }) => {
  const green = ease(gf, EV.drop, 5);
  const p = pulse(gf);
  const warm = name === "hook" || name === "bet" ? 0.16 : name === "amnesia" ? 0.05 : 0;
  return (
    <AbsoluteFill style={{ background: name === "amnesia" ? "#0b0d10" : T.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 42%, rgba(255,170,60,${warm * (1 - green)}) 0%, rgba(0,0,0,0) 70%)` }} />
      {name === "pass" ? <AbsoluteFill style={{ background: "radial-gradient(90% 60% at 50% 42%, rgba(111,211,154,0.25) 0%, rgba(0,0,0,0) 70%)" }} /> : null}
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
const TopTag: React.FC<{ children: React.ReactNode; bg?: string; color?: string; rot?: number; size?: number }> = ({ children, bg = "#fff", color = "#0b0b0b", rot = -2, size = 50 }) => (
  <div style={{ position: "absolute", top: 240, left: 50, right: 130, display: "flex", justifyContent: "center" }}>
    <div style={{ background: bg, color, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, padding: "14px 28px", borderRadius: 16, transform: `rotate(${rot}deg)`, textAlign: "center" }}>{children}</div>
  </div>
);
const Heart: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block", verticalAlign: "middle" }}>
    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 5.3 3.2 1.7-2 3.2-3.2 5.3-3.2 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill={RED} />
  </svg>
);
const Confetti: React.FC<{ gf: number; at: number; y?: number }> = ({ gf, at, y = 900 }) => {
  const f = gf - at;
  if (f < 0 || f > 70) return null;
  const cols = [T.accent, GOLD, T.ok, "#fff", RED];
  return (
    <>
      {Array.from({ length: 80 }, (_, i) => {
        const ang = (i * 137.5 * Math.PI) / 180;
        const v = 14 + (i % 7) * 3;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: 520 + Math.cos(ang) * v * f, top: y + Math.sin(ang) * v * f * 0.8 + 0.45 * f * f, width: 16, height: 26, background: cols[i % 5], transform: `rotate(${f * 12 + i * 30}deg)`, opacity: 1 - f / 70, borderRadius: 3 }}
          />
        );
      })}
    </>
  );
};
// pila de platos
const Dishes: React.FC<{ n: number; gf: number; shake?: number }> = ({ n, gf, shake = 0 }) => (
  <div style={{ position: "relative", width: 520, height: 520 }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 150, background: "#3d4a52", borderRadius: "20px 20px 60px 60px", boxShadow: "inset 0 14px 0 #56656e" }} />
    {Array.from({ length: n }, (_, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: 90 + Math.sin(i * 1.7) * 18 + Math.sin(gf * 0.9 + i) * shake * (i / n) * 14,
          bottom: 100 + i * 26,
          width: 340,
          height: 34,
          borderRadius: "50%",
          background: i % 3 === 0 ? "#f4f1e8" : "#e6e1d3",
          border: "3px solid #c9c2b0",
          transform: `rotate(${Math.sin(i * 2.3) * 5 + Math.sin(gf * 0.7 + i) * shake * 3}deg)`,
        }}
      >
        {i % 2 === 0 ? <div style={{ position: "absolute", left: 120, top: 8, width: 50, height: 12, borderRadius: 6, background: "#b98a4e", opacity: 0.6 }} /> : null}
      </div>
    ))}
  </div>
);

// ---------- escenas ----------
const Hook: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("hook");
  const inn = pop(gf, wordAt(s, "n2", "nunca") - 4, 11);
  return (
    <>
      <TopTag size={48}>POV: tu novio jura que nunca dijo eso</TopTag>
      <div style={{ position: "absolute", left: 220, top: 400 }}>
        <Dishes n={14} gf={gf} shake={0.6} />
      </div>
      <div style={{ position: "absolute", left: 120, top: 520, transform: "rotate(-10deg)", fontFamily: FONT, fontWeight: 900, fontSize: 70, color: GOLD, border: `6px solid ${GOLD}`, borderRadius: 14, padding: "0 18px", background: "rgba(15,18,17,0.8)" }}>
        30 DÍAS
      </div>
      <div style={{ position: "absolute", right: 140, top: 760, transform: `scale(${Math.min(1, inn)}) rotate(${Math.sin(gf / 8) * 4}deg)`, opacity: Math.min(1, inn) }}>
        <Pedro size={280} mood="innocent" gf={gf} />
      </div>
    </>
  );
};

const Bet: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("bet");
  const f = gf - s.start;
  const card = pop(f, 0, 12);
  const talking = gf >= EV.b1 && gf < EV.b1_end;
  const pal = pop(gf, EV.palabra, 8);
  return (
    <>
      <TopTag bg={GOLD}>LA APUESTA</TopTag>
      <div
        style={{
          position: "absolute",
          left: 130,
          right: 210,
          top: 380,
          background: T.surface,
          border: `2px solid ${T.line}`,
          borderRadius: 34,
          padding: "28px 26px",
          textAlign: "center",
          fontFamily: FONT,
          opacity: Math.min(1, card),
          transform: `scale(${0.85 + 0.15 * card})`,
          boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ color: T.ink2, fontSize: 26 }}>En llamada</div>
        <div style={{ display: "flex", justifyContent: "center", margin: "12px 0", transform: `translateY(${talking ? Math.sin(gf * 0.8) * 4 : 0}px)` }}>
          <Pedro size={220} mood="cocky" gf={gf} />
        </div>
        <div style={{ color: T.ink, fontSize: 44, fontWeight: 800 }}>
          Pedro <Heart size={40} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, color: "#ffb4ab", fontSize: 24, fontWeight: 700, marginTop: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: T.rec, opacity: 0.4 + 0.6 * Math.abs(Math.cos(f / 8)) }} />
          Acta · grabando
        </div>
      </div>
      {gf >= EV.palabra - 1 ? (
        <div style={{ position: "absolute", left: 0, right: 80, top: 930, display: "flex", justifyContent: "center" }}>
          <div style={{ background: GOLD, color: "#111", fontFamily: FONT, fontWeight: 900, fontSize: 96, padding: "6px 34px", borderRadius: 20, transform: `rotate(-6deg) scale(${pal})`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>«PALABRA.»</div>
        </div>
      ) : null}
    </>
  );
};

const Pass: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("pass");
  const f = gf - s.start;
  const card = pop(f, 0, 12);
  const apto = pop(gf, EV.aprobe + 2, 8);
  const horn = EV.aprobe + 27;
  return (
    <>
      <div style={{ position: "absolute", left: 150, right: 230, top: 470, transform: `rotate(-4deg) scale(${0.8 + 0.2 * card})`, opacity: Math.min(1, card) }}>
        <div style={{ background: "linear-gradient(135deg, #f6d9e4, #d9e6f6)", borderRadius: 24, padding: "28px 30px", fontFamily: FONT, color: "#1b2b44", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 2 }}>PERMISO DE CONDUCCIÓN</div>
          <div style={{ display: "flex", gap: 22, marginTop: 18, alignItems: "center" }}>
            <div style={{ width: 150, height: 180, borderRadius: 12, background: "#b9c7d8", display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
              <div style={{ width: 90, height: 90, borderRadius: 45, background: "#8a6a55", marginBottom: -20 }} />
            </div>
            <div style={{ fontSize: 30, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 800 }}>Clase B</div>
              <div>1.er intento</div>
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", right: -30, bottom: -40, transform: `rotate(-14deg) scale(${apto})`, border: `8px solid ${T.call}`, color: T.call, fontFamily: FONT, fontWeight: 900, fontSize: 90, padding: "0 26px", borderRadius: 14, background: "rgba(255,255,255,0.92)" }}>APTO</div>
      </div>
      <Confetti gf={gf} at={horn} y={700} />
    </>
  );
};

const Amnesia: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("amnesia");
  const f = gf - s.start;
  const face = pop(gf, EV.amnesia, 10);
  const cri = gf > EV.amnesia + 8;
  const busted = gf >= EV.b2_end;
  const zoom = busted ? 1 + 0.25 * ease(gf, EV.b2_end, 6) : 1;
  return (
    <>
      <TopTag bg="#22303a" color="#9fd8ff" rot={1}>
        MODO AMNESIA: ACTIVADO
      </TopTag>
      <div style={{ position: "absolute", left: 0, right: 80, top: 420, display: "flex", justifyContent: "center", transform: `scale(${(0.6 + 0.4 * face) * zoom}) rotate(${busted ? 0 : Math.sin(f / 10) * 3}deg)`, opacity: Math.min(1, face) }}>
        <Pedro size={460} mood={busted ? "busted" : "innocent"} gf={gf} />
      </div>
      {cri ? (
        <>
          <div style={{ position: "absolute", left: 120, top: 980 + Math.sin(gf / 6) * 8, fontFamily: FONT, fontStyle: "italic", color: "#6b7a86", fontSize: 44, opacity: 0.8 }}>cri, cri…</div>
          <div style={{ position: "absolute", right: 200, top: 400 + Math.cos(gf / 7) * 8, fontFamily: FONT, fontStyle: "italic", color: "#6b7a86", fontSize: 38, opacity: 0.7 }}>cri…</div>
        </>
      ) : null}
    </>
  );
};

const Turn: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("turn");
  const pre = ease(gf, s.start + 8, 20);
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

const PhoneFrame: React.FC<{ y: number; rot?: number; children: React.ReactNode }> = ({ y, rot = 0, children }) => (
  <div style={{ position: "absolute", left: (W - SW - 24) / 2 - 20, top: y, width: SW + 24, height: SH + 24, transform: `scale(0.98) rotate(${rot}deg)`, transformOrigin: "top center", borderRadius: 64, background: "#050605", border: "3px solid #3a403c", boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,195,176,0.15)" }}>
    <div style={{ position: "absolute", left: 12, top: 12, width: SW, height: SH, borderRadius: 52, overflow: "hidden", background: T.bg, fontFamily: FONT, color: T.ink }}>
      {children}
      <div style={{ position: "absolute", top: 14, left: SW / 2 - 14, width: 28, height: 28, borderRadius: 14, background: "#000" }} />
    </div>
  </div>
);

const TasksScreen: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("tasks");
  const sum = ease(gf, s.start + s.cues[0].at + 20, 14);
  const task = pop(gf, EV.task - 2, 11);
  const days = wordAt(s, "n8", "30");
  const cal = interpolate(gf, [days, days + 30], [0, 30], clamp);
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "62px 24px 0" }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, overflow: "hidden", background: T.surface2 }}>
          <Pedro size={56} mood="cocky" gf={gf} />
        </div>
        <div>
          <div style={{ fontSize: 23, fontWeight: 700 }}>
            Pedro <Heart size={20} />
          </div>
          <div style={{ fontSize: 16, color: T.ink2 }}>Hace 2 meses · 4:12</div>
        </div>
      </div>
      <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 22, padding: 18, opacity: sum }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <IcSpark size={20} />
            <div style={{ color: T.ink3, fontSize: 15, fontWeight: 700, letterSpacing: 1.2 }}>RESUMEN</div>
          </div>
          <div style={{ fontSize: 20, lineHeight: 1.4 }}>Pedro apuesta que, si apruebas el carnet a la primera, friega los platos un mes entero. Dice «palabra».</div>
        </div>
        <div style={{ background: T.surface, border: `2px solid ${T.accent}`, borderRadius: 22, padding: 18, opacity: Math.min(1, task), transform: `scale(${0.85 + 0.15 * task})` }}>
          <div style={{ color: T.ink3, fontSize: 15, fontWeight: 700, letterSpacing: 1.2, marginBottom: 10 }}>TAREAS ACORDADAS</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, border: `2.5px solid ${T.accent}` }} />
            <div style={{ flex: 1, fontSize: 23, fontWeight: 800 }}>Pedro friega los platos</div>
            <div style={{ fontSize: 16, color: "#111", background: GOLD, borderRadius: 10, padding: "5px 10px", fontWeight: 900 }}>30 días</div>
          </div>
        </div>
        <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 22, padding: 16, opacity: ease(gf, days - 4, 10) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, color: T.ok, fontSize: 18, fontWeight: 800 }}>
            <IcCal size={22} color={T.ok} /> Añadido al calendario
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {Array.from({ length: 35 }, (_, i) => {
              const on = i < cal && i < 30;
              return (
                <div key={i} style={{ height: 40, borderRadius: 8, background: on ? T.accentSoft : T.surface2, border: on ? `1.5px solid ${T.accent}` : "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: on ? T.accent : T.ink3, fontWeight: 700 }}>
                  {i < 30 ? i + 1 : ""}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

const Remix: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("remix");
  const PATTERN = ["PA", "PA", "PALABRA", null, "PA", "PA", "PA", "PA", "PALABRA", null, "PA", "PA", "¡PALABRA!", null, "PA", "PALABRA"];
  const half = BEATF / 2;
  const idx = Math.floor((gf - EV.remix) / half);
  let word: string | null = null;
  let since = 0;
  for (let i = Math.min(idx, PATTERN.length - 1); i >= 0; i--) {
    if (PATTERN[i]) {
      word = PATTERN[i];
      since = gf - (EV.remix + i * half);
      break;
    }
  }
  const inRemix = gf >= EV.remix;
  const bounce = Math.exp(-((gf - EV.remix + 100 * half) % half) / 3);
  const loop = pop(gf, s.start + s.cues[0].at + 10, 10);
  return (
    <>
      <TopTag bg={T.accent} color={T.onAccent}>
        EN BUCLE
      </TopTag>
      <div style={{ position: "absolute", left: 0, right: 80, top: 380, display: "flex", justifyContent: "center", transform: `scale(${(0.7 + 0.3 * Math.min(1, loop)) * (inRemix ? 1 + 0.08 * bounce : 1)}) rotate(${inRemix ? Math.sin(gf / 2) * 5 : 0}deg)` }}>
        <Pedro size={380} mood="cocky" gf={gf} />
      </div>
      <div style={{ position: "absolute", left: 120, right: 200, top: 820, height: 120, display: "flex", alignItems: "center", gap: 8 }}>
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} style={{ flex: 1, height: `${15 + 85 * (inRemix ? bounce * Math.abs(Math.sin(i * 0.9 + gf * 0.3)) : 0.1)}%`, background: i % 2 ? T.accent : GOLD, borderRadius: 4 }} />
        ))}
      </div>
      {inRemix && word ? (
        <div style={{ position: "absolute", left: 0, right: 80, top: 1010, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: word.length > 2 ? 150 : 190, color: word.startsWith("¡") ? RED : GOLD, letterSpacing: -4, transform: `scale(${1 + 0.3 * Math.exp(-since / 3)}) rotate(${(idx % 3) - 1}deg)`, textShadow: "0 10px 0 rgba(0,0,0,0.5)" }}>
          {word}
        </div>
      ) : null}
    </>
  );
};

const Montage: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("montage");
  const f = gf - s.start;
  const day = Math.max(1, Math.min(12, Math.floor(interpolate(f, [0, 40], [1, 12], clamp))));
  const sarten = wordAt(s, "n10", "sartén");
  return (
    <>
      <div style={{ position: "absolute", top: 260, left: 0, right: 80, textAlign: "center", fontFamily: FONT }}>
        <span style={{ background: GOLD, color: "#111", fontWeight: 900, fontSize: 64, padding: "8px 30px", borderRadius: 16, display: "inline-block", transform: "rotate(-2deg)" }}>DÍA {day} / 30</span>
      </div>
      <div style={{ position: "absolute", left: 300, top: 470 }}>
        <Dishes n={Math.max(2, 14 - day)} gf={gf} />
      </div>
      {Array.from({ length: 12 }, (_, i) => {
        const y = 980 - ((f * 4 + i * 60) % 520);
        return <div key={i} style={{ position: "absolute", left: 330 + ((i * 97) % 420), top: y, width: 30 + (i % 3) * 14, height: 30 + (i % 3) * 14, borderRadius: "50%", border: "3px solid rgba(200,230,255,0.6)", background: "rgba(200,230,255,0.12)" }} />;
      })}
      <div style={{ position: "absolute", left: 80, top: 640, transform: `rotate(${Math.sin(f / 5) * 6}deg)` }}>
        <Pedro size={260} mood="sad" gf={gf} gloves />
      </div>
      {gf >= sarten - 2 ? (
        <div style={{ position: "absolute", right: 150, top: 560, transform: `rotate(${-20 + Math.sin(gf / 3) * 8}deg) scale(${pop(gf, sarten - 2, 10)})` }}>
          <div style={{ width: 170, height: 170, borderRadius: "50%", background: "#2b2b2b", border: "10px solid #444" }} />
          <div style={{ width: 160, height: 28, background: "#3a2a20", borderRadius: 14, marginTop: -100, marginLeft: 160 }} />
        </div>
      ) : null}
    </>
  );
};

const End: React.FC<{ gf: number }> = ({ gf }) => {
  const s = sc("end");
  const c = s.cues[0];
  const line1 = "Las promesas se las lleva el viento.".split(" ");
  const blowAt = s.start + (c.words.find((w) => w.w.startsWith("viento"))?.at ?? c.at + 40) + 6;
  const platos = s.start + (c.words.find((w) => w.w.toLowerCase().startsWith("platos"))?.at ?? c.at + 90);
  const pedroA = pop(gf, EV.pedro_end - 2, 9);
  const logo = pop(gf, EV.end_hit, 10);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
      <div style={{ marginTop: 290, padding: "0 140px 0 60px", textAlign: "center", fontSize: 74, fontWeight: 900, lineHeight: 1.08, letterSpacing: -2, height: 170 }}>
        {line1.map((w, i) => {
          const a = pop(gf, s.start + (c.words[i]?.at ?? 0), 12);
          const blow = Math.max(0, gf - blowAt - i * 2);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 16, color: "#fff", opacity: Math.min(1, a) * Math.max(0, 1 - blow / 22), transform: `translate(${blow * blow * 0.9}px, ${-blow * 2.5}px) rotate(${blow * 3}deg)`, filter: `blur(${blow * 0.4}px)` }}>
              {w}
            </span>
          );
        })}
      </div>
      <div style={{ fontSize: 84, fontWeight: 900, letterSpacing: -2, color: "#fff", opacity: ease(gf, platos - 4, 8), marginTop: -150 }}>
        Y los platos…
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 20, opacity: Math.min(1, pedroA), transform: `scale(${0.5 + 0.5 * pedroA})` }}>
        <Pedro size={230} mood="sad" gf={gf} gloves />
        <div style={{ fontSize: 120, fontWeight: 900, color: GOLD, letterSpacing: -4 }}>Pedro.</div>
      </div>
      <div style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 22, opacity: Math.min(1, logo), transform: `scale(${0.7 + 0.3 * logo})` }}>
        <AppIcon size={130} dotPulse={pulse(gf)} />
        <div>
          <div style={{ fontSize: 96, fontWeight: 800, color: T.ink, letterSpacing: -4, lineHeight: 1 }}>Acta</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: T.ink2 }}>Tus llamadas, con memoria</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 1450, left: 80, right: 150, textAlign: "center", color: T.ink3, fontSize: 23, lineHeight: 1.3, opacity: ease(gf, EV.end_hit + 6, 15) }}>
        Historia dramatizada. Respeta la normativa sobre grabación de llamadas de tu país.
      </div>
    </AbsoluteFill>
  );
};

export const PlatosReel: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const s = SCENES[i];
  const f = gf - s.start;
  const n = s.name;
  const enter = n === "tasks" ? pop(f, 0, 15) : 0;
  const capY: Record<string, number> = { hook: 1240, bet: 1180, pass: 1140, amnesia: 1180, turn: 1180, tasks: 1340, remix: 1180, montage: 1220, end: -9999 };
  const flash = Math.max(gf >= EV.drop && gf < EV.drop + 8 ? 1 - (gf - EV.drop) / 8 : 0, gf >= EV.b2_end && gf < EV.b2_end + 5 ? 1 - (gf - EV.b2_end) / 5 : 0);
  const endFade = interpolate(gf, [PLATOS_DURATION - 18, PLATOS_DURATION], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: T.bg, opacity: endFade }}>
      <Audio src={staticFile("acta4/mix.wav")} />
      <AbsoluteFill>
        <Backdrop gf={gf} name={n} />
        {n === "hook" ? <Hook gf={gf} /> : null}
        {n === "bet" ? <Bet gf={gf} /> : null}
        {n === "pass" ? <Pass gf={gf} /> : null}
        {n === "amnesia" ? <Amnesia gf={gf} /> : null}
        {n === "turn" ? <Turn gf={gf} /> : null}
        {n === "tasks" ? (
          <PhoneFrame y={300 + (1 - enter) * 1400} rot={-2}>
            <TasksScreen gf={gf} />
          </PhoneFrame>
        ) : null}
        {n === "remix" ? <Remix gf={gf} /> : null}
        {n === "montage" ? <Montage gf={gf} /> : null}
        {n === "end" ? <End gf={gf} /> : null}
        <Captions gf={gf} y={capY[n]} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: 0.7 * flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
