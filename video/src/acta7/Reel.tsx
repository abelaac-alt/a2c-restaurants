import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing.json";
import { AppIcon, Avatar, IcCheck, IcPhone, IcPlay, IcSearch, IcSpark, T } from "../acta/theme";
import { BLUE, clamp, ease, FONT, GOLD, IcScale, IcTelegram, nz, PhoneFrame, pop, RED, Screen, wa } from "../acta5/ui";

type Word = { w: string; at: number };
type Cue = { id: string; who: "narr" | "marta" | "jorge" | "atn"; at: number; dur: number; text: string; words: Word[] };
type Scene = { name: string; start: number; dur: number; cues: Cue[] };
const SCENES = timing.scenes as unknown as Scene[];
const EV = timing.events;
export const GRATIS_DURATION = timing.total;
const sc = (n: string) => SCENES.find((s) => s.name === n)!;
const GREEN = "#6fd39a";

// ---------- subtítulos con quién habla ----------
const WHO: Record<string, { label?: string; color: string; text: string; italic?: boolean }> = {
  narr: { color: "#fff", text: "#fff" },
  marta: { label: "MARTA", color: T.accent, text: "#d8f3ec" },
  jorge: { label: "JORGE · COMERCIAL", color: GOLD, text: "#fff0c9" },
  atn: { label: "ATENCIÓN AL CLIENTE", color: RED, text: "#ffd6d0" },
};
const HOT: [RegExp, string][] = [
  [/^(312|penalizacion|gratis)/, RED],
  [/^(acta|telegram|siguenos|comparte)/, T.accent],
  [/^(permanencia|promete|prometio|promesa)/, GOLD],
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

const TopTag: React.FC<{ children: React.ReactNode; bg?: string; color?: string; rot?: number; size?: number }> = ({ children, bg = "#fff", color = "#0b0b0b", rot = -1.5, size = 46 }) => (
  <div style={{ position: "absolute", top: 232, left: 40, right: 120, display: "flex", justifyContent: "center" }}>
    <div style={{ background: bg, color, fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, padding: "12px 26px", borderRadius: 16, transform: `rotate(${rot}deg)`, textAlign: "center" }}>{children}</div>
  </div>
);
const buzzShake = (gf: number) => (gf >= 4 && gf < 36 ? Math.sin(gf * 2.7) * 7 : 0);
const eur = (n: number) => n.toFixed(2).replace(".", ",") + " €";

const Backdrop: React.FC<{ gf: number; name: string }> = ({ gf, name }) => {
  const hope = ease(gf, sc("proof").start, 30);
  const angry = name === "complaint" || name === "bill" ? 0.16 : 0;
  return (
    <AbsoluteFill style={{ background: hope > 0.5 ? T.bg : "#05080c" }}>
      <AbsoluteFill style={{ background: `radial-gradient(90% 55% at 50% 42%, rgba(60,95,170,${0.2 * (1 - hope)}) 0%, rgba(0,0,0,0) 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(90% 55% at 50% 42%, rgba(124,195,176,${0.22 * hope}) 0%, rgba(0,0,0,0) 70%)` }} />
      {angry ? <AbsoluteFill style={{ background: `radial-gradient(70% 60% at 50% 45%, rgba(0,0,0,0) 45%, rgba(190,30,30,${angry}) 100%)` }} /> : null}
      <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ======================= 1 · Gancho: el cargo en el móvil =======================
const Notif: React.FC<{ icon: React.ReactNode; title: string; text: string; sub?: string; time: string; red?: boolean; a: number }> = ({ icon, title, text, sub, time, red, a }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(36,42,54,0.92)", border: `1.5px solid ${red ? "#7a2a26" : "#2f3947"}`, borderRadius: 22, padding: "14px 18px", opacity: Math.min(1, a), transform: `translateY(${(1 - Math.min(1, a)) * -40}px) scale(${0.95 + 0.05 * Math.min(1, a)})` }}>
    <div style={{ width: 50, height: 50, borderRadius: 25, background: red ? "#5a1f1c" : "#2b3a52", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 26 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19, color: "#9aa7ba", fontWeight: 700 }}>
        <span>{title}</span>
        <span>{time}</span>
      </div>
      <div style={{ fontSize: 26, color: red ? "#ffb4ab" : "#eaf0f8", fontWeight: 800, marginTop: 2 }}>{text}</div>
      {sub ? <div style={{ fontSize: 19, color: "#9aa7ba", fontWeight: 600, marginTop: 2 }}>{sub}</div> : null}
    </div>
  </div>
);
const Hook: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const m = (a: number) => pop(gf, a, 12);
  const sh = buzzShake(gf);
  const stamp = pop(f, EV.ping1 + 4, 10);
  return (
    <>
      <TopTag>POV: te cobran lo que te juraron gratis</TopTag>
      <div style={{ transform: `translate(${sh}px, ${sh * 0.4}px)` }}>
        <PhoneFrame y={312} rot={-1.2}>
          <Screen bg="linear-gradient(180deg, #0a1020 0%, #16213a 100%)">
            <div style={{ textAlign: "center", marginTop: 96 }}>
              <div style={{ fontSize: 22, color: "#9aa7ba", fontWeight: 700 }}>lunes 3 de noviembre</div>
              <div style={{ fontSize: 132, fontWeight: 300, color: "#f3f6fb", letterSpacing: -4, lineHeight: 1.05 }}>09:14</div>
            </div>
            <div style={{ padding: "26px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              <Notif red icon="🏦" title="Banco" text="Cargo domiciliado −312,40 €" sub="Penalización baja anticipada" time="09:14" a={m(EV.ping1)} />
              <Notif icon="📄" title="Tu compañía" text="Factura final disponible" sub="Permanencia pendiente: 21 meses" time="09:12" a={m(EV.ping2)} />
              <Notif icon="🏦" title="Banco" text="Saldo disponible: 41,17 €" time="09:14" a={m(EV.ping3)} />
            </div>
          </Screen>
        </PhoneFrame>
      </div>
      <div style={{ position: "absolute", top: 430, right: 150, fontFamily: FONT, fontSize: 120, fontWeight: 900, color: "#fff", background: RED, borderRadius: 24, padding: "0 26px", transform: `rotate(7deg) scale(${0.5 + 0.5 * Math.min(1.1, stamp)})`, opacity: Math.min(1, stamp), boxShadow: "0 24px 60px rgba(0,0,0,0.6)", letterSpacing: -4 }}>
        −312 €
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 2 · Contexto: la promesa vs. el papel =======================
const Context: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const tCom = wa(cues, "n2", "comercial");
  const tProm = wa(cues, "n2", "prometio");
  const tNada = wa(cues, "n2", "apunte");
  const paper = pop(f, 4, 12);
  const bub = pop(f, tProm + 2, 12);
  const note = pop(f, tNada, 12);
  const fine = ease(f, tNada + 6, 16);
  return (
    <>
      <TopTag bg="#1b2430" color="#cfe0f7" rot={1}>Hace tres meses</TopTag>
      <div style={{ position: "absolute", top: 340, left: 70, right: 150, fontFamily: FONT }}>
        <div style={{ background: "#e9e4d8", color: "#222", borderRadius: 16, padding: "24px 28px", transform: `rotate(-2deg) scale(${0.85 + 0.15 * Math.min(1, paper)})`, opacity: Math.min(1, paper), boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
          <div style={{ fontSize: 36, fontWeight: 900 }}>CONTRATO · fibra + móvil</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {[100, 92, 96, 80].map((w, i) => (
              <div key={i} style={{ height: 12, width: `${w}%`, background: "#b9b3a3", borderRadius: 6 }} />
            ))}
            <div style={{ fontSize: 13, fontWeight: 700, color: fine > 0.1 ? "#b3261e" : "#7d7868", background: fine > 0.1 ? "rgba(179,38,30,0.14)" : "transparent", borderRadius: 4, padding: "2px 4px", boxShadow: fine > 0.1 ? `0 0 ${20 * fine}px rgba(255,93,79,${0.6 * fine})` : "none" }}>
              …compromiso de permanencia de 24 meses; penalización por baja anticipada…
            </div>
            <div style={{ height: 12, width: "88%", background: "#b9b3a3", borderRadius: 6 }} />
          </div>
        </div>
        {f >= tProm ? (
          <div style={{ marginTop: 40, width: 760, opacity: Math.min(1, bub), transform: `translateY(${(1 - Math.min(1, bub)) * 30}px)` }}>
            <div style={{ color: GOLD, fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Jorge · comercial</div>
            <div style={{ background: "#2a3446", borderRadius: "26px 26px 26px 6px", padding: "20px 26px", fontSize: 46, fontWeight: 800, color: "#fff", lineHeight: 1.15 }}>
              «Tú tranquila, sin letra pequeña» 😉
            </div>
          </div>
        ) : null}
        {f >= tNada ? (
          <div style={{ marginTop: 36, marginLeft: 120, width: 520, opacity: Math.min(1, note), transform: `rotate(2deg) scale(${0.9 + 0.1 * Math.min(1, note)})`, background: "#fff6b8", color: "#4a4320", borderRadius: 10, padding: "16px 22px", fontSize: 30, fontWeight: 800, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            Notas:<span style={{ color: "#9a9360", fontWeight: 600 }}> (en blanco)</span>
          </div>
        ) : null}
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 3 y 5 · Pantalla de llamada con Acta =======================
const CallScreen: React.FC<{ gf: number; f: number; cues: Cue[]; name: string; initials: string; sub: string; start: number; pick?: number; left: { who: string; n: string; c: string }; avBg: string; avFg: string }> = ({ gf, f, cues, name, initials, sub, start, pick, left, avBg, avFg }) => {
  const talking = cues.find((c) => f >= c.at && f < c.at + c.dur)?.who;
  const waiting = pick !== undefined && gf < pick;
  const secs = Math.max(0, Math.floor((gf - (pick ?? start)) / 30));
  const wave = (row: number, i: number) => {
    const act = (row === 0 && talking === left.who) || (row === 1 && talking === "marta");
    const v = Math.abs(Math.sin(gf * 0.5 + i * 0.9 + row * 3) * Math.sin(gf * 0.23 + i * 0.37));
    return act ? 0.2 + 0.8 * v : 0.05 + 0.06 * v;
  };
  return (
    <Screen bg="linear-gradient(180deg, #111a1a 0%, #0a0c0e 70%)">
      <div style={{ textAlign: "center", marginTop: 84, color: "#9fb2ad", fontSize: 20 }}>{sub}</div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <Avatar size={150} initials={initials} bg={avBg} fg={avFg} />
      </div>
      <div style={{ textAlign: "center", fontSize: 36, fontWeight: 800, marginTop: 18 }}>{name}</div>
      <div style={{ textAlign: "center", fontSize: 24, color: waiting ? GOLD : "#9fb2ad", marginTop: 4, fontVariantNumeric: "tabular-nums", fontWeight: waiting ? 800 : 400 }}>
        {waiting ? "♪ En espera… su llamada es importante para nosotros" : `00:${String(secs).padStart(2, "0")}`}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(224,87,74,0.16)", border: `1px solid ${T.rec}`, borderRadius: 30, padding: "9px 18px", fontSize: 18, fontWeight: 800, color: "#ffb4ab" }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: T.rec, opacity: 0.4 + 0.6 * Math.abs(Math.cos(gf / 9)) }} />
          Acta · grabando ambas voces
        </div>
      </div>
      <div style={{ margin: "36px 26px 0", display: "flex", flexDirection: "column", gap: 18 }}>
        {[{ n: left.n, c: left.c }, { n: "Tú", c: T.cream }].map((r, row) => (
          <div key={row} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 70, fontSize: 18, color: "#9fb2ad", fontWeight: 700 }}>{r.n}</div>
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
const Promise_: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const enter = pop(f, 4, 14);
  return (
    <>
      <TopTag bg="#2b2410" color={GOLD} rot={-1}>HACE 3 MESES · LA PROMESA</TopTag>
      <PhoneFrame y={312 + (1 - enter) * 1400} rot={0.8}>
        <CallScreen gf={gf} f={f} cues={cues} name="Jorge (Comercial)" initials="JC" sub="Llamada · 12 de agosto" start={EV.call1_start} left={{ who: "jorge", n: "Jorge", c: GOLD }} avBg="#33280f" avFg={GOLD} />
      </PhoneFrame>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};
const Complaint: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const enter = pop(f, 4, 14);
  const t24 = wa(cues, "e1", "veinticuatro");
  const tNada = wa(cues, "e2", "nada");
  const s24 = pop(f, t24, 11);
  const sNo = pop(f, tNada, 11);
  return (
    <>
      <TopTag bg="#3a1412" color="#ffb4ab" rot={-1}>ESTA SEMANA · LA RECLAMACIÓN</TopTag>
      <PhoneFrame y={312 + (1 - enter) * 1400} rot={-0.8}>
        <CallScreen gf={gf} f={f} cues={cues} name="Atención al cliente" initials="AC" sub="Llamada saliente · lunes" start={EV.call2_start} pick={EV.call2_pick} left={{ who: "atn", n: "Ellos", c: RED }} avBg="#3a1f1c" avFg="#ffb4ab" />
      </PhoneFrame>
      {f >= t24 && f < tNada ? (
        <div style={{ position: "absolute", top: 930, right: 150, fontFamily: FONT, fontSize: 84, fontWeight: 900, color: "#fff", background: RED, borderRadius: 22, padding: "2px 24px", transform: `rotate(6deg) scale(${0.5 + 0.5 * Math.min(1.1, s24)})`, boxShadow: "0 24px 60px rgba(0,0,0,0.6)", letterSpacing: -2 }}>
          24 MESES
        </div>
      ) : null}
      {f >= tNada ? (
        <div style={{ position: "absolute", top: 930, right: 130, fontFamily: FONT, fontSize: 56, fontWeight: 900, color: "#fff", background: "#7a1d17", border: `4px solid ${RED}`, borderRadius: 22, padding: "8px 24px", transform: `rotate(-5deg) scale(${0.5 + 0.5 * Math.min(1.1, sNo)})`, boxShadow: "0 24px 60px rgba(0,0,0,0.6)", textAlign: "center", lineHeight: 1.05 }}>
          «No podemos<br />hacer nada»
        </div>
      ) : null}
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 4 · La factura =======================
const Bill: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const tBaja = wa(cues, "n3", "baja");
  const tFact = wa(cues, "n3", "factura");
  const t312 = wa(cues, "n3", "312");
  const paper = pop(f, tFact - 4, 12);
  const pen = ease(f, t312 - 2, 20);
  const total = 42.9 + 312.4 * pen;
  const stamp = pop(f, t312 + 20, 10);
  return (
    <>
      <TopTag bg="#3a1412" color="#ffb4ab" rot={1}>Una semana después de la baja</TopTag>
      <div style={{ position: "absolute", top: 380, left: 70, right: 150, fontFamily: FONT, opacity: Math.min(1, paper), transform: `translateY(${(1 - Math.min(1, paper)) * 60}px) rotate(-1.5deg)` }}>
        <div style={{ background: T.surface, border: `2px solid ${T.line}`, borderRadius: 30, padding: "30px 32px", boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: T.ink2 }}>FACTURA FINAL</div>
          <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 700, color: T.ink }}>
            <span>Fibra + móvil</span>
            <span>{eur(42.9)}</span>
          </div>
          <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 16, background: pen > 0.02 ? "#2a1412" : "transparent", border: `2px solid ${pen > 0.02 ? RED : "transparent"}`, display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 900, color: pen > 0.02 ? "#ffb4ab" : T.ink3 }}>
            <span>Penalización baja</span>
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{eur(312.4 * pen)}</span>
          </div>
          <div style={{ height: 2, background: T.line, margin: "24px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontWeight: 900, color: "#fff" }}>
            <span style={{ fontSize: 34 }}>TOTAL</span>
            <span style={{ fontSize: 76, color: RED, fontVariantNumeric: "tabular-nums", letterSpacing: -2 }}>{eur(total)}</span>
          </div>
        </div>
        {f >= t312 + 20 ? (
          <div style={{ position: "absolute", right: -30, top: 70, fontSize: 56, fontWeight: 900, color: RED, border: `6px solid ${RED}`, borderRadius: 14, padding: "4px 20px", transform: `rotate(-12deg) scale(${1 + 0.4 * (1 - Math.min(1, stamp))})`, opacity: Math.min(1, stamp), background: "rgba(10,10,10,0.5)" }}>
            «GRATIS»
          </div>
        ) : null}
      </div>
      {f >= tBaja ? null : null}
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 6 · Mi palabra contra la suya =======================
const After: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const tAc = wa(cues, "n4", "acorde");
  const a1 = pop(f, 4, 12);
  const a2 = pop(f, wa(cues, "n4", "suya"), 12);
  const dim = ease(f, tAc - 4, 12);
  const logo = pop(f, tAc + 6, 12);
  return (
    <>
      <div style={{ opacity: 1 - 0.85 * dim }}>
        <div style={{ position: "absolute", top: 360, left: 110, right: 190, fontFamily: FONT, textAlign: "center" }}>
          <div style={{ background: T.surface, border: `3px solid ${T.line}`, borderRadius: 30, padding: "30px 24px", transform: `rotate(-2.5deg) scale(${0.8 + 0.2 * Math.min(1, a1)})`, opacity: Math.min(1, a1), fontSize: 74, fontWeight: 900, color: "#fff" }}>Mi palabra</div>
          <div style={{ fontSize: 60, fontWeight: 900, color: RED, margin: "24px 0", opacity: Math.min(1, a2) }}>CONTRA</div>
          <div style={{ background: "#2a1412", border: `3px solid ${RED}`, borderRadius: 30, padding: "30px 24px", transform: `rotate(2.5deg) scale(${0.8 + 0.2 * Math.min(1, a2)})`, opacity: Math.min(1, a2), fontSize: 74, fontWeight: 900, color: "#ffb4ab" }}>La suya</div>
        </div>
      </div>
      {f >= tAc ? (
        <div style={{ position: "absolute", top: 520, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", opacity: Math.min(1, logo), transform: `scale(${0.6 + 0.4 * Math.min(1.1, logo)})` }}>
          <div style={{ fontSize: 120 }}>💡</div>
          <AppIcon size={230} dotPulse={Math.abs(Math.sin(gf / 9))} />
        </div>
      ) : null}
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 7 · Búsqueda: «permanencia» =======================
const Search: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const enter = pop(f, 2, 12);
  const tType = wa(cues, "n5", "permanencia");
  const tAhi = wa(cues, "n5", "ahi");
  const word = "permanencia";
  const typed = word.slice(0, Math.floor(interpolate(f, [tType - 6, tType + 12], [0, word.length], clamp)));
  const hit = pop(f, tAhi - 4, 11);
  return (
    <>
      <PhoneFrame y={312 + (1 - enter) * 1400} rot={-0.6}>
        <Screen>
          <div style={{ padding: "68px 20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.surface2, borderRadius: 18, padding: "14px 16px", border: `1.5px solid ${typed ? T.accent : T.line}` }}>
              <IcSearch size={26} />
              <div style={{ fontSize: 26 }}>{typed || <span style={{ color: T.ink3 }}>Buscar en lo que se habló</span>}</div>
            </div>
            {f >= tAhi - 8 ? (
              <div style={{ marginTop: 16, display: "flex", alignItems: "baseline", gap: 10, opacity: Math.min(1, ease(f, tAhi - 8, 8)) }}>
                <div style={{ fontSize: 64, fontWeight: 900, color: T.accent, lineHeight: 1 }}>1</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.ink2 }}>resultado</div>
              </div>
            ) : null}
            {f >= tAhi - 4 ? (
              <div style={{ marginTop: 12, background: T.surface, border: `2px solid ${T.accent}`, borderRadius: 22, padding: "16px 18px", opacity: Math.min(1, hit), transform: `scale(${0.92 + 0.08 * Math.min(1, hit)})` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar size={46} initials="JC" bg="#33280f" fg={GOLD} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>Jorge (Comercial)</div>
                    <div style={{ fontSize: 16, color: T.ink3 }}>12 ago · 01:48</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, fontSize: 21, color: T.ink2, lineHeight: 1.3 }}>
                  …Segurísimo. Sin <span style={{ background: "rgba(255,207,92,0.28)", color: GOLD, fontWeight: 900, borderRadius: 4, padding: "0 3px" }}>permanencia</span> y sin penalización. Te lo digo yo…
                </div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, background: T.accentSoft, borderRadius: 14, padding: "10px 12px", fontSize: 18, fontWeight: 800, color: T.accent }}>
                  <IcSpark size={22} /> Resumen IA: «Promete que no hay permanencia ni penalización»
                </div>
              </div>
            ) : null}
          </div>
        </Screen>
      </PhoneFrame>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 8 · Escuchar la prueba =======================
const Proof: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const c = cues[0];
  const prog = interpolate(f, [c.at, c.at + c.dur], [0, 1], clamp);
  const enter = pop(f, 2, 12);
  return (
    <>
      <TopTag bg={T.accentSoft} color={T.accent} rot={1}>Lo tenía grabado</TopTag>
      <PhoneFrame y={312 + (1 - enter) * 1400} rot={0.6}>
        <Screen>
          <div style={{ padding: "70px 22px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar size={52} initials="JC" bg="#33280f" fg={GOLD} />
              <div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>Jorge (Comercial)</div>
                <div style={{ fontSize: 16, color: T.ink3 }}>12 ago · 01:48 · reproduciendo</div>
              </div>
            </div>
            <div style={{ marginTop: 22, height: 80, display: "flex", alignItems: "center", gap: 3 }}>
              {Array.from({ length: 40 }, (_, i) => {
                const v = 0.2 + 0.8 * Math.abs(Math.sin(i * 1.3 + 1) * Math.sin(i * 0.5 + 2));
                return <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: 3, background: i / 40 < prog ? T.accent : "#33415a" }} />;
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><IcPlay size={28} /></div>
              <div style={{ fontSize: 18, color: T.ink2, fontVariantNumeric: "tabular-nums" }}>00:{String(40 + Math.floor(prog * 3)).padStart(2, "0")} / 01:48</div>
            </div>
            <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: T.surface, borderRadius: 16, padding: "12px 14px", fontSize: 20, color: T.ink3 }}><b style={{ color: T.ink2 }}>Marta:</b> ¿Seguro que no hay permanencia?</div>
              <div style={{ background: T.accentSoft, border: `2px solid ${T.accent}`, borderRadius: 16, padding: "14px 16px", fontSize: 24, fontWeight: 800, lineHeight: 1.25, whiteSpace: "normal", overflowWrap: "break-word" }}>
                <b style={{ color: GOLD }}>Jorge: </b>
                {c.words.map((w, i) => (
                  <span key={i} style={{ color: f >= w.at ? "#fff" : "rgba(255,255,255,0.35)", marginRight: 6 }}>{w.w}</span>
                ))}
              </div>
            </div>
          </div>
        </Screen>
      </PhoneFrame>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 9 · Devolución =======================
const Win: React.FC<{ f: number; cues: Cue[] }> = ({ f, cues }) => {
  const tEnv = wa(cues, "n6", "envie");
  const tDev = wa(cues, "n6", "devolvieron");
  const mail = pop(f, tEnv + 2, 12);
  const bank = pop(f, tDev, 12);
  const amt = interpolate(f, [tDev, tDev + 22], [0, 312.4], clamp);
  return (
    <>
      <TopTag bg="#143324" color={GREEN} rot={1}>Dos días después</TopTag>
      <div style={{ position: "absolute", top: 380, left: 70, right: 150, fontFamily: FONT, display: "flex", flexDirection: "column", gap: 34 }}>
        <div style={{ background: T.surface, border: `2px solid ${T.line}`, borderRadius: 28, padding: "24px 28px", opacity: Math.min(1, mail), transform: `translateY(${(1 - Math.min(1, mail)) * 50}px) rotate(-1.2deg)` }}>
          <div style={{ fontSize: 24, color: T.ink3, fontWeight: 700 }}>Atención al cliente · Re: Reclamación</div>
          <div style={{ marginTop: 10, fontSize: 36, fontWeight: 800, color: T.ink, lineHeight: 1.2 }}>
            «Revisada la grabación aportada, hemos <span style={{ color: GREEN }}>anulado el cargo</span>.»
          </div>
          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 10, background: T.accentSoft, borderRadius: 14, padding: "8px 16px", fontSize: 22, fontWeight: 800, color: T.accent }}>
            🎧 grabacion_jorge.m4a
          </div>
        </div>
        {f >= tDev ? (
          <div style={{ background: "#12301f", border: `3px solid ${GREEN}`, borderRadius: 30, padding: "26px 30px", opacity: Math.min(1, bank), transform: `scale(${0.8 + 0.2 * Math.min(1.08, bank)}) rotate(1.2deg)`, boxShadow: "0 0 80px rgba(111,211,154,0.3)" }}>
            <div style={{ fontSize: 24, color: "#9fd9b5", fontWeight: 800 }}>🏦 Banco · Devolución recibida</div>
            <div style={{ fontSize: 110, fontWeight: 900, color: GREEN, letterSpacing: -4, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>+{eur(amt)}</div>
          </div>
        ) : null}
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

// ======================= 10 · Cierre: seguir y compartir =======================
const ShareIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 3L2 10.5l7 3 3 7z" />
    <path d="M22 3L9 13.5" />
  </svg>
);
const End: React.FC<{ gf: number; f: number; cues: Cue[] }> = ({ gf, f, cues }) => {
  const a = pop(f, 4, 11);
  const tSig = wa(cues, "n7", "siguenos");
  const tCom = wa(cues, "n7", "comparte");
  const fol = pop(f, tSig, 11);
  const sha = pop(f, tCom, 11);
  const wob = Math.sin(gf / 6) * 2;
  return (
    <>
      <div style={{ position: "absolute", top: 270, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a) }}>
          <AppIcon size={120} dotPulse={Math.abs(Math.sin(gf / 9))} />
          <div style={{ fontSize: 96, fontWeight: 900, color: T.ink, letterSpacing: -3 }}>Acta</div>
        </div>
        <div style={{ marginTop: 6, fontSize: 38, fontWeight: 800, color: T.accent, opacity: Math.min(1, a) }}>Tus llamadas, con memoria</div>

        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 18, background: T.accent, color: T.onAccent, fontWeight: 900, fontSize: 70, padding: "20px 54px", borderRadius: 60, opacity: Math.min(1, fol), transform: `scale(${0.8 + 0.2 * Math.min(1.08, fol)}) translateY(${wob}px)`, boxShadow: "0 24px 60px rgba(124,195,176,0.35)" }}>
          <span style={{ fontSize: 84, lineHeight: 0.8 }}>+</span> Síguenos
        </div>

        <div style={{ marginTop: 40, width: 820, display: "flex", alignItems: "center", gap: 24, background: T.surface, border: `3px solid ${GOLD}`, borderRadius: 32, padding: "26px 30px", opacity: Math.min(1, sha), transform: `scale(${0.85 + 0.15 * Math.min(1.08, sha)}) rotate(-1.5deg)` }}>
          <ShareIcon size={96} color={GOLD} />
          <div style={{ fontSize: 44, fontWeight: 900, color: T.ink, lineHeight: 1.12 }}>
            Compártelo con quien esté peleándose con su compañía
          </div>
        </div>

        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 14, background: BLUE, color: "#07202f", fontWeight: 900, fontSize: 46, padding: "12px 28px", borderRadius: 20, opacity: ease(f, tCom + 14, 12) }}>
          <IcTelegram size={44} color="#07202f" /> t.me/actaapp
        </div>
        <div style={{ marginTop: 28, fontSize: 24, color: T.ink3, textAlign: "center", lineHeight: 1.4, padding: "0 60px", opacity: ease(f, 40, 14) }}>
          Historia dramatizada. Graba solo conversaciones en las que participas.
          <br />
          Información general, no es asesoramiento jurídico.
        </div>
      </div>
      <Captions f={f} cues={cues} y={1330} />
    </>
  );
};

export const GratisReel: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const s = SCENES[i];
  const f = gf - s.start;
  const n = s.name;
  const fadeIn = interpolate(f, [0, 10], [0, 1], clamp);
  const endFade = interpolate(gf, [GRATIS_DURATION - 22, GRATIS_DURATION], [1, 0], clamp);
  const amp = n === "complaint" ? 1.6 : n === "hook" ? 1.2 : 0.6;
  const dx = Math.sin(gf * 0.13) * amp + Math.sin(gf * 0.41) * amp * 0.4;
  const dy = Math.cos(gf * 0.11) * amp;
  const Cmp: Record<string, React.ReactNode> = {
    hook: <Hook gf={gf} f={f} cues={s.cues} />,
    context: <Context f={f} cues={s.cues} />,
    promise: <Promise_ gf={gf} f={f} cues={s.cues} />,
    bill: <Bill f={f} cues={s.cues} />,
    complaint: <Complaint gf={gf} f={f} cues={s.cues} />,
    after: <After gf={gf} f={f} cues={s.cues} />,
    search: <Search f={f} cues={s.cues} />,
    proof: <Proof f={f} cues={s.cues} />,
    win: <Win f={f} cues={s.cues} />,
    end: <End gf={gf} f={f} cues={s.cues} />,
  };
  return (
    <AbsoluteFill style={{ background: "#05080c", opacity: endFade }}>
      <Audio src={staticFile("acta7/mix.wav")} />
      <Backdrop gf={gf} name={n} />
      <AbsoluteFill style={{ opacity: fadeIn, transform: `translate(${dx}px, ${dy}px)` }}>{Cmp[n]}</AbsoluteFill>
    </AbsoluteFill>
  );
};
