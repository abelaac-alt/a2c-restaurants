import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing.json";
import { AppIcon, Avatar, IcCheck, IcPhone, IcSearch, T } from "../acta/theme";
import { BLUE, clamp, ease, FONT, GOLD, IcFolder, IcScale, IcTelegram, nz, PhoneFrame, pop, RED, Screen, wa } from "../acta5/ui";

type Word = { w: string; at: number };
type Cue = { id: string; who: "narr" | "boss" | "lucia" | "ana"; at: number; dur: number; text: string; words: Word[] };
type Scene = { name: string; start: number; dur: number; cues: Cue[] };
const SCENES = timing.scenes as unknown as Scene[];
const EV = timing.events;
export const ACOSO_DURATION = timing.total;
const sc = (n: string) => SCENES.find((s) => s.name === n)!;

// ---------- subtítulos con quién habla ----------
const WHO: Record<string, { label?: string; color: string; text: string; italic?: boolean }> = {
  narr: { color: "#fff", text: "#fff" },
  boss: { label: "ANDRÉS", color: RED, text: "#ffd6d0" },
  lucia: { label: "LUCÍA", color: T.accent, text: "#d8f3ec" },
  ana: { label: "ANA", color: GOLD, text: "#fff0c9" },
};
const HOT: [RegExp, string][] = [
  [/^(paro|puesto|nunca)/, RED],
  [/^(acta|telegram)/, T.accent],
  [/^(pruebas?|palabra|suya)/, GOLD],
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
  if (out.length > 1 && out[out.length - 1].length === 1) {
    const last = out.pop()!;
    out[out.length - 1].push(...last);
  }
  return out;
};
const Captions: React.FC<{ f: number; cues: Cue[]; y: number }> = ({ f, cues, y }) => {
  const c = cues.find((x) => f >= x.at && f <= x.at + x.dur + 8);
  if (!c) return null;
  const cs = chunks(c.words);
  let idx = 0;
  cs.forEach((ch, i) => {
    if (f >= ch[0].at) idx = i;
  });
  const ch = cs[idx];
  const a = pop(f, ch[0].at, 12);
  const w = WHO[c.who];
  return (
    <div style={{ position: "absolute", top: y, left: 40, right: 120, display: "flex", justifyContent: "center" }}>
      <div style={{ textAlign: "center", fontFamily: FONT, background: "rgba(3,6,9,0.82)", borderRadius: 30, padding: "12px 28px 16px", maxWidth: 920, transform: `scale(${0.9 + 0.1 * Math.min(1, a)})` }}>
        {w.label ? <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: 3, color: w.color, marginBottom: 2 }}>{w.label}</div> : null}
        <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.06, letterSpacing: -1, fontStyle: c.who === "narr" ? "normal" : "italic" }}>
          {ch.map((x, i) => {
            const on = f >= x.at;
            const hot = HOT.find(([r]) => r.test(nz(x.w)))?.[1];
            return (
              <span key={i} style={{ color: on ? hot ?? w.text : "rgba(255,255,255,0.42)", marginRight: 16, display: "inline-block" }}>
                {x.w}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---------- latido y temblor ----------
const beats: number[] = (() => {
  const out: number[] = [];
  let t = EV.call_start / 30 + 0.5;
  let bpm = 74;
  const end = EV.call_end / 30 - 0.6;
  while (t < end) {
    out.push(t * 30);
    t += 60 / bpm;
    bpm = Math.min(112, bpm + 1.4);
  }
  return out;
})();
const heart = (gf: number) => {
  let last = -999;
  for (const b of beats) if (b <= gf) last = b;
  return gf - last < 24 ? Math.exp(-(gf - last) / 5) : 0;
};
const BUZZ: [number, number][] = [[4, 37], [51, 73], [84, 106]];
const buzzShake = (gf: number) => (BUZZ.some(([a, b]) => gf >= a && gf < b) ? Math.sin(gf * 2.7) * 7 : 0);

// ---------- fondo: azul de noche → cálido de esperanza ----------
const Backdrop: React.FC<{ gf: number; name: string }> = ({ gf, name }) => {
  const hope = ease(gf, sc("turn").start, 40);
  const pulse = name === "call" ? heart(gf) : 0;
  return (
    <AbsoluteFill style={{ background: hope > 0.5 ? T.bg : "#04070a" }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 55% at 50% 42%, rgba(60,95,170,${0.2 * (1 - hope)}) 0%, rgba(0,0,0,0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(90% 55% at 50% 42%, rgba(124,195,176,${0.2 * hope}) 0%, rgba(0,0,0,0) 70%)` }} />
      {name === "call" ? <AbsoluteFill style={{ background: `radial-gradient(70% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(190,30,30,${0.1 + 0.4 * pulse}) 100%)` }} /> : null}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};
const TopTag: React.FC<{ children: React.ReactNode; bg?: string; color?: string; rot?: number; size?: number }> = ({ children, bg = "#fff", color = "#0b0b0b", rot = -1.5, size = 46 }) => (
  <div style={{ position: "absolute", top: 232, left: 40, right: 120, display: "flex", justifyContent: "center" }}>
    <div style={{ background: bg, color, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, padding: "12px 26px", borderRadius: 16, transform: `rotate(${rot}deg)`, textAlign: "center" }}>{children}</div>
  </div>
);

// ======================= 1 · Gancho: pantalla de bloqueo =======================
const Notif: React.FC<{ icon?: React.ReactNode; title: string; text: string; time: string; red?: boolean; a: number }> = ({ icon, title, text, time, red, a }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(36,42,54,0.92)", border: `1.5px solid ${red ? "#7a2a26" : "#2f3947"}`, borderRadius: 22, padding: "14px 18px", opacity: Math.min(1, a), transform: `translateY(${(1 - Math.min(1, a)) * -40}px) scale(${0.95 + 0.05 * Math.min(1, a)})` }}>
    <div style={{ width: 50, height: 50, borderRadius: 25, background: red ? "#5a1f1c" : "#2b3a52", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon ?? <IcPhone size={26} color={red ? "#ff8b80" : "#9db6e0"} />}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19, color: "#9aa7ba", fontWeight: 700 }}>
        <span>{title}</span>
        <span>{time}</span>
      </div>
      <div style={{ fontSize: 24, color: red ? "#ffb4ab" : "#eaf0f8", fontWeight: 800, marginTop: 2 }}>{text}</div>
    </div>
  </div>
);
const LockScreen: React.FC<{ gf: number; calm?: boolean }> = ({ gf, calm }) => {
  const m = (a: number) => pop(gf, a, 12);
  return (
    <Screen bg="linear-gradient(180deg, #0a1020 0%, #16213a 100%)">
      <div style={{ textAlign: "center", marginTop: 96 }}>
        <div style={{ fontSize: 22, color: "#9aa7ba", fontWeight: 700 }}>martes 14 de octubre</div>
        <div style={{ fontSize: 132, fontWeight: 300, color: "#f3f6fb", letterSpacing: -4, lineHeight: 1.05 }}>23:47</div>
      </div>
      <div style={{ padding: "26px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {calm ? (
          <div style={{ textAlign: "center", color: "#7f93b0", fontSize: 24, fontWeight: 700, marginTop: 70, lineHeight: 1.5 }}>
            <div style={{ fontSize: 80 }}>🔕</div>
            Sin notificaciones
            <div style={{ fontSize: 20, marginTop: 8, color: "#5e7090" }}>Modo silencio · 0 llamadas perdidas</div>
          </div>
        ) : (
          <>
            <Notif red title="Teléfono" text="14 llamadas perdidas · Andrés (Jefe)" time="23:47" a={m(6)} />
            <Notif icon={<span style={{ fontSize: 24 }}>💬</span>} title="Andrés (Jefe)" text="¿Dónde estás?" time="23:41" a={m(EV.msg1)} />
            <Notif icon={<span style={{ fontSize: 24 }}>💬</span>} title="Andrés (Jefe)" text="Coge el teléfono" time="23:44" a={m(EV.msg2)} />
            <Notif icon={<span style={{ fontSize: 24 }}>💬</span>} title="Andrés (Jefe)" text="Mañana a las 8 el informe. Sin excusas." time="23:46" a={m(EV.msg3)} />
          </>
        )}
      </div>
    </Screen>
  );
};
const Hook: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const sh = buzzShake(gf);
  return (
    <>
      <TopTag>POV: tu jefe te llama a las 23:47</TopTag>
      <div style={{ transform: `translate(${sh}px, ${sh * 0.4}px)` }}>
        <PhoneFrame y={312} rot={-1.2}>
          <LockScreen gf={gf} />
        </PhoneFrame>
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 2 · Contexto: fines de semana =======================
const Context: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const tWeek = wa(cues, "n2", "fin");
  const tFail = wa(cues, "n2", "fallado");
  const tNext = wa(cues, "n2", "siguiente");
  const reds = Math.floor(interpolate(f, [tWeek, tWeek + 60], [0, 24], clamp));
  const bubble = pop(f, tNext + 4, 12);
  const zero = pop(f, tWeek + 70, 11);
  return (
    <>
      <TopTag bg="#1b2430" color="#cfe0f7" rot={1}>
        Últimos 3 meses
      </TopTag>
      <div style={{ position: "absolute", top: 340, left: 60, right: 140, fontFamily: FONT }}>
        <div style={{ background: "rgba(20,26,36,0.9)", border: "2px solid #2b3647", borderRadius: 30, padding: "26px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
            {Array.from({ length: 24 }, (_, i) => {
              const sat = i % 2 === 0;
              const on = i < reds;
              return (
                <div key={i} style={{ height: 78, borderRadius: 16, background: on ? "#5a1f1c" : "#202a38", border: `2px solid ${on ? RED : "#2e3a4d"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, color: on ? "#ffb4ab" : "#6f8099" }}>
                  <div>{sat ? "SÁB" : "DOM"}</div>
                  {on ? <div style={{ fontSize: 16, color: "#ff8b80" }}>trabajo</div> : null}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 26, textAlign: "center", fontSize: 44, fontWeight: 900, color: "#fff", opacity: Math.min(1, zero), transform: `scale(${0.8 + 0.2 * Math.min(1, zero)})` }}>
            <span style={{ color: RED, fontSize: 72 }}>0</span> fines de semana libres
          </div>
        </div>
        {f >= tNext ? (
          <div style={{ marginTop: 34, marginLeft: 8, width: 700, opacity: Math.min(1, bubble), transform: `translateY(${(1 - Math.min(1, bubble)) * 30}px)` }}>
            <div style={{ color: "#8da2c0", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Andrés (Jefe) · mañana, 09:10</div>
            <div style={{ background: "#2a3446", borderRadius: "26px 26px 26px 6px", padding: "20px 26px", fontSize: 42, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>
              Esperaba más de ti, Lucía.
              {f >= tFail ? <span style={{ display: "block", fontSize: 22, color: "#8da2c0", fontWeight: 700, marginTop: 8 }}>Leído · 09:11</span> : null}
            </div>
          </div>
        ) : null}
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 3 · La llamada (Acta grabando) =======================
const CallScreen: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const talking = cues.find((c) => f >= c.at && f < c.at + c.dur)?.who;
  const secs = Math.max(0, Math.floor((gf - EV.call_start) / 30));
  const wave = (row: number, i: number) => {
    const act = (row === 0 && talking === "boss") || (row === 1 && talking === "lucia");
    const v = Math.abs(Math.sin(gf * 0.5 + i * 0.9 + row * 3) * Math.sin(gf * 0.23 + i * 0.37));
    return act ? 0.2 + 0.8 * v : 0.05 + 0.06 * v;
  };
  return (
    <Screen bg="linear-gradient(180deg, #1a0f10 0%, #0a0c0e 70%)">
      <div style={{ textAlign: "center", marginTop: 84, color: "#b89a98", fontSize: 20 }}>Llamada entrante · 23:47</div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <Avatar size={150} initials="AJ" bg="#3a1f1c" fg="#ffb4ab" />
      </div>
      <div style={{ textAlign: "center", fontSize: 38, fontWeight: 800, marginTop: 18 }}>Andrés (Jefe)</div>
      <div style={{ textAlign: "center", fontSize: 24, color: "#b89a98", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
        00:{String(secs).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(224,87,74,0.16)", border: `1px solid ${T.rec}`, borderRadius: 30, padding: "9px 18px", fontSize: 18, fontWeight: 800, color: "#ffb4ab" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: T.rec, opacity: 0.4 + 0.6 * Math.abs(Math.cos(gf / 9)) }} />
          Acta · grabando ambas voces
        </div>
      </div>
      <div style={{ margin: "36px 26px 0", display: "flex", flexDirection: "column", gap: 18 }}>
        {[{ n: "Andrés", c: RED }, { n: "Tú", c: T.cream }].map((r, row) => (
          <div key={row} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 70, fontSize: 18, color: "#b89a98", fontWeight: 700 }}>{r.n}</div>
            <div style={{ flex: 1, height: 58, display: "flex", alignItems: "center", gap: 3 }}>
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: `${wave(row, i) * 100}%`, background: r.c, borderRadius: 3 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
};
const Call: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const enter = pop(f, 4, 14);
  const sh = Math.sin(gf * 0.9) * 1.6 * heart(gf);
  return (
    <>
      <TopTag bg="#3a1412" color="#ffb4ab" rot={-1}>
        23:47 · LA LLAMADA
      </TopTag>
      <div style={{ transform: `translate(${sh}px, ${sh}px) scale(${1 + 0.012 * heart(gf)})` }}>
        <PhoneFrame y={312 + (1 - enter) * 1400} rot={0.8}>
          <CallScreen gf={gf} f={f} cues={cues} />
        </PhoneFrame>
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 4 · Después de colgar =======================
const After: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const tBano = wa(cues, "n3", "bano");
  const tProb = wa(cues, "n3", "problema");
  const card = ease(f, 2, 10) * (1 - ease(f, tBano - 14, 10));
  const dark = ease(f, tBano - 12, 14);
  const drop = (k: number) => ((f - tBano - k * 22) % 66) / 66;
  return (
    <>
      <AbsoluteFill style={{ opacity: dark }}>
        <div style={{ position: "absolute", left: 120, top: 300, width: 560, height: 6, background: "linear-gradient(90deg, rgba(255,230,180,0), rgba(255,230,180,0.7), rgba(255,230,180,0))", filter: "blur(2px)" }} />
        <svg width="1080" height="1920" style={{ position: "absolute", inset: 0 }}>
          {[0, 1, 2].map((k) => {
            const p = ((drop(k) % 1) + 1) % 1;
            return <ellipse key={k} cx={470} cy={900} rx={20 + 260 * p} ry={8 + 70 * p} fill="none" stroke="rgba(160,190,230,0.5)" strokeWidth="3" opacity={f > tBano ? 1 - p : 0} />;
          })}
        </svg>
        {f >= tProb - 8 ? (
          <div style={{ position: "absolute", top: 560, left: 80, right: 160, textAlign: "center", fontFamily: FONT, fontSize: 66, fontWeight: 800, fontStyle: "italic", color: "#aebdd3", opacity: ease(f, tProb - 8, 20), lineHeight: 1.15 }}>
            «El problema era yo.»
          </div>
        ) : null}
      </AbsoluteFill>
      <div style={{ opacity: card }}>
        <PhoneFrame y={380} rot={-0.8}>
          <Screen bg="#0b0e12">
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 220, gap: 16 }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, background: "#3a1f1c", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(135deg)" }}>
                <IcPhone size={60} color="#ff8b80" />
              </div>
              <div style={{ fontSize: 34, fontWeight: 800 }}>Llamada finalizada</div>
              <div style={{ fontSize: 24, color: T.ink2 }}>Andrés (Jefe) · 00:41</div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, background: T.accentSoft, border: `1px solid ${T.accent}`, borderRadius: 18, padding: "10px 18px", fontSize: 20, fontWeight: 800, color: T.accent }}>
                <IcCheck size={24} color={T.accent} /> Grabación guardada
              </div>
            </div>
          </Screen>
        </PhoneFrame>
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 5 · Ana: nota de voz =======================
const Sister: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const c = cues[0];
  const prog = interpolate(f, [c.at, c.at + c.dur], [0, 1], clamp);
  const enter = pop(f, 4, 14);
  return (
    <>
      <PhoneFrame y={312 + (1 - enter) * 1400} rot={-1}>
        <Screen bg="#0f1419">
          <div style={{ height: 120, background: "#171e26", display: "flex", alignItems: "flex-end", gap: 14, padding: "0 18px 14px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
              <path d="M15 5l-7 7 7 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Avatar size={58} initials="A" bg="#352c1c" fg="#e2c690" />
            <div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>Ana (hermana)</div>
              <div style={{ fontSize: 16, color: "#7d93aa" }}>escribiendo…</div>
            </div>
          </div>
          <div style={{ padding: "26px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ alignSelf: "flex-end", background: "#244a43", borderRadius: "22px 22px 6px 22px", padding: "14px 20px", fontSize: 22, fontWeight: 600, maxWidth: 330 }}>Ana, necesito contarte algo…</div>
            <div style={{ alignSelf: "flex-start", background: "#1d2733", borderRadius: "22px 22px 22px 6px", padding: "16px 18px", width: 400 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: 27, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24">
                    <rect x="6.5" y="5" width="4" height="14" rx="1" fill="#111" />
                    <rect x="13.5" y="5" width="4" height="14" rx="1" fill="#111" />
                  </svg>
                </div>
                <div style={{ flex: 1, height: 40, display: "flex", alignItems: "center", gap: 3 }}>
                  {Array.from({ length: 26 }, (_, i) => {
                    const v = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + 1) * Math.sin(i * 0.6 + 2));
                    return <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: 2, background: i / 26 < prog ? GOLD : "#55657a" }} />;
                  })}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "#7d93aa", marginTop: 8 }}>
                <span>0:0{Math.min(9, Math.floor(prog * 9))}</span>
                <span>08:12</span>
              </div>
            </div>
          </div>
        </Screen>
      </PhoneFrame>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 6 · Giro: Acta llevaba tres semanas grabando =======================
const CALLS = [
  ["14 oct · 23:47", "00:41"],
  ["12 oct · 20:15", "02:10"],
  ["11 oct · 22:40", "01:32"],
  ["10 oct · 23:05", "03:05"],
  ["08 oct · 22:50", "00:58"],
  ["05 oct · 19:30", "01:47"],
  ["04 oct · 21:15", "02:21"],
  ["02 oct · 23:20", "01:09"],
  ["30 sep · 22:10", "00:36"],
];
const Turn: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const enter = pop(f, 4, 14);
  const rec = pop(f, wa(cues, "n4", "acta") - 6, 12);
  return (
    <>
      <PhoneFrame y={312 + (1 - enter) * 1400} rot={-1}>
        <Screen>
          <div style={{ padding: "70px 22px 0" }}>
            <div style={{ fontSize: 32, fontWeight: 900 }}>Recientes</div>
            <div style={{ marginTop: 16, background: T.accentSoft, border: `2px solid ${T.accent}`, borderRadius: 22, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, rec), transform: `scale(${0.9 + 0.1 * Math.min(1, rec)})` }}>
              <AppIcon size={54} dotPulse={Math.abs(Math.sin(f / 9))} />
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: T.accent }}>Acta graba tus llamadas</div>
                <div style={{ fontSize: 17, color: T.ink2 }}>Desde hace 3 semanas</div>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {CALLS.slice(0, 5).map(([d, dur], i) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 14, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 18, padding: "12px 16px", opacity: ease(f, 14 + i * 8, 10) }}>
                  <Avatar size={46} initials="AJ" bg="#3a1f1c" fg="#ffb4ab" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 20, fontWeight: 800 }}>Andrés (Jefe)</div>
                    <div style={{ fontSize: 15, color: T.ink3 }}>{d}</div>
                  </div>
                  <div style={{ fontSize: 16, color: T.ink2, fontVariantNumeric: "tabular-nums" }}>{dur}</div>
                </div>
              ))}
            </div>
          </div>
        </Screen>
      </PhoneFrame>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 7 · Búsqueda: «paro» =======================
const Search: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const tType = wa(cues, "n5", "paro") + 2;
  const tNine = wa(cues, "n5", "nueve");
  const typed = "paro".slice(0, Math.floor(interpolate(f, [tType - 8, tType + 10], [0, 4], clamp)));
  const SNIP = ["…hay mucha gente en el paro que querría tu puesto…", "…si no te gusta, ya sabes dónde está el paro…", "…a este paso te vas al paro, Lucía…"];
  const tChips = wa(cues, "n5", "fechas");
  return (
    <>
      <PhoneFrame y={312} rot={-0.6}>
        <Screen>
          <div style={{ padding: "68px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface2, borderRadius: 18, padding: "14px 16px", border: `1.5px solid ${typed ? T.accent : T.line}` }}>
              <IcSearch size={26} />
              <div style={{ fontSize: 24 }}>{typed || <span style={{ color: T.ink3 }}>Buscar en lo que se habló</span>}</div>
            </div>
            {f >= tNine - 6 ? (
              <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 10, opacity: ease(f, tNine - 6, 8) }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: T.accent, lineHeight: 1 }}>9</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.ink2 }}>llamadas con «paro»</div>
              </div>
            ) : null}
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {CALLS.map(([d, dur], i) => {
                const a = ease(f, tNine + 2 + i * 6, 8);
                return (
                  <div key={d} style={{ background: T.surface, border: `1px solid ${i === 0 ? T.accent : T.line}`, borderRadius: 16, padding: "9px 14px", opacity: a, transform: `translateX(${(1 - a) * 40}px)` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1, fontSize: 18, fontWeight: 800 }}>Andrés (Jefe) · <span style={{ color: T.ink2, fontWeight: 600 }}>{d}</span></div>
                      <div style={{ fontSize: 14, color: T.onAccent, background: T.accent, borderRadius: 8, padding: "2px 8px", fontWeight: 800 }}>{dur}</div>
                    </div>
                    {i < 3 ? <div style={{ fontSize: 15, color: T.ink2, marginTop: 3 }}>{SNIP[i]}</div> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </Screen>
      </PhoneFrame>
      {f >= tChips ? (
        <div style={{ position: "absolute", top: 1190, left: 0, right: 80, display: "flex", justifyContent: "center", gap: 12, fontFamily: FONT }}>
          {["Fechas", "Horas", "Sus palabras"].map((c, i) => {
            const a = pop(f, tChips + i * 14, 11);
            return (
              <div key={c} style={{ background: "#33280f", border: `2px solid ${GOLD}`, borderRadius: 18, padding: "8px 20px", fontSize: 30, fontWeight: 900, color: GOLD, opacity: Math.min(1, a), transform: `scale(${0.8 + 0.2 * Math.min(1, a)})` }}>
                {c}
              </div>
            );
          })}
        </div>
      ) : null}
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 8 · Calma =======================
const Calm: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const tAb = wa(cues, "n6", "abogada");
  const tSil = wa(cues, "n6", "silencio");
  const a = pop(f, tAb - 4, 12);
  const showLock = f >= tSil - 20;
  return (
    <>
      <TopTag bg={T.accentSoft} color={T.accent} rot={1}>
        Esta noche
      </TopTag>
      {!showLock ? (
        <div style={{ position: "absolute", top: 420, left: 60, right: 140, opacity: Math.min(1, a), transform: `translateY(${(1 - Math.min(1, a)) * 40}px)`, fontFamily: FONT, color: T.ink }}>
          <div style={{ background: T.surface, border: `2px solid ${T.accent}`, borderRadius: 30, padding: "28px 30px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <IcScale size={64} color={GOLD} />
              <div>
                <div style={{ fontSize: 38, fontWeight: 900 }}>Abogada laboral</div>
                <div style={{ fontSize: 26, color: T.ink2 }}>Jueves · 17:00</div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12, background: T.accentSoft, borderRadius: 18, padding: "14px 18px", fontSize: 28, fontWeight: 800, color: T.accent }}>
              <IcFolder size={40} /> 9 grabaciones adjuntas
            </div>
          </div>
        </div>
      ) : (
        <div style={{ opacity: ease(f, tSil - 20, 14) }}>
          <PhoneFrame y={312} rot={0.6}>
            <LockScreen gf={gf} calm />
          </PhoneFrame>
        </div>
      )}
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 9 · Recursos =======================
const Help: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const head = pop(f, 6, 12);
  const items = [
    { k: "sindicato", t: "Tu sindicato", icon: <span style={{ fontSize: 56 }}>🤝</span> },
    { k: "abogado", t: "Un abogado laboral", icon: <IcScale size={64} color={GOLD} /> },
    { k: "inspeccion", t: "La Inspección de Trabajo", icon: <IcCheck size={64} /> },
  ];
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 50, right: 130, textAlign: "center", fontFamily: FONT, color: T.ink, fontSize: 96, fontWeight: 900, lineHeight: 1, letterSpacing: -3, opacity: Math.min(1, head), transform: `scale(${0.85 + 0.15 * Math.min(1, head)})` }}>
        <span style={{ color: T.accent }}>No estás</span>
        <br />
        exagerando.
      </div>
      <div style={{ position: "absolute", top: 640, left: 70, right: 150, display: "flex", flexDirection: "column", gap: 20, fontFamily: FONT }}>
        {items.map((it) => {
          const a = pop(f, wa(cues, "n7", it.k) - 4, 12);
          return (
            <div key={it.k} style={{ display: "flex", alignItems: "center", gap: 22, background: T.surface, border: `2px solid ${T.line}`, borderRadius: 28, padding: "22px 28px", opacity: Math.min(1, a), transform: `translateX(${(1 - Math.min(1, a)) * 80}px)` }}>
              {it.icon}
              <div style={{ fontSize: 46, fontWeight: 900, color: T.ink }}>{it.t}</div>
            </div>
          );
        })}
      </div>
      <Captions f={f} cues={cues} y={1300} />
    </>
  );
};

// ======================= 10 · Cierre =======================
const End: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const a = pop(f, 6, 11);
  const url = pop(f, wa(cues, "n8", "telegram"), 11);
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a) }}>
          <AppIcon size={210} dotPulse={Math.abs(Math.sin(gf / 9))} />
        </div>
        <div style={{ fontSize: 118, fontWeight: 900, color: T.ink, letterSpacing: -4, marginTop: 14, opacity: Math.min(1, a) }}>Acta</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: T.accent, opacity: Math.min(1, a) }}>Tus llamadas, con memoria</div>
        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 14, background: BLUE, color: "#07202f", fontWeight: 900, fontSize: 56, padding: "14px 30px", borderRadius: 22, opacity: Math.min(1, url), transform: `scale(${0.85 + 0.15 * Math.min(1, url)})` }}>
          <IcTelegram size={54} color="#07202f" /> t.me/actaapp
        </div>
        <div style={{ marginTop: 40, fontSize: 28, color: T.ink3, textAlign: "center", lineHeight: 1.4, padding: "0 60px", opacity: ease(f, 40, 14) }}>
          Historia dramatizada. Graba solo conversaciones en las que participas.
          <br />
          Información general, no es asesoramiento jurídico.
          <br />
          Si lo estás pasando mal, habla con alguien de confianza.
        </div>
      </div>
      <Captions f={f} cues={cues} y={1290} />
    </>
  );
};

export const AcosoReel: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const s = SCENES[i];
  const f = gf - s.start;
  const n = s.name;
  const fadeIn = interpolate(f, [0, 10], [0, 1], clamp);
  const endFade = interpolate(gf, [ACOSO_DURATION - 22, ACOSO_DURATION], [1, 0], clamp);
  // cámara en mano: temblor leve, más fuerte en la llamada
  const amp = n === "call" ? 2.2 : n === "hook" ? 1.2 : 0.6;
  const dx = Math.sin(gf * 0.13) * amp + Math.sin(gf * 0.41) * amp * 0.4;
  const dy = Math.cos(gf * 0.11) * amp;
  const Cmp: Record<string, React.ReactNode> = {
    hook: <Hook gf={gf} f={f} cues={s.cues} />,
    context: <Context f={f} cues={s.cues} />,
    call: <Call gf={gf} f={f} cues={s.cues} />,
    after: <After f={f} cues={s.cues} />,
    sister: <Sister f={f} cues={s.cues} />,
    turn: <Turn f={f} cues={s.cues} />,
    search: <Search f={f} cues={s.cues} />,
    calm: <Calm gf={gf} f={f} cues={s.cues} />,
    help: <Help f={f} cues={s.cues} />,
    end: <End gf={gf} f={f} cues={s.cues} />,
  };
  return (
    <AbsoluteFill style={{ background: "#04070a", opacity: endFade }}>
      <Audio src={staticFile("acta6/mix.wav")} />
      <Backdrop gf={gf} name={n} />
      <AbsoluteFill style={{ opacity: fadeIn, transform: `translate(${dx}px, ${dy}px)` }}>{Cmp[n]}</AbsoluteFill>
    </AbsoluteFill>
  );
};

