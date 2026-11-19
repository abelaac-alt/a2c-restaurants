import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing.json";
import { ContextScreen, Cue, PrivacyScreen, RecordScreen, SH, SW, SearchScreen, SummaryScreen } from "./screens";
import { AppIcon, FONT, IcPhone, T, beatPulse, ease, pop } from "./theme";

type Scene = { name: string; start: number; dur: number; cues: Cue[] };
const SCENES = timing.scenes as Scene[];
export const ACTA_DURATION = timing.total;
const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const byName = (n: string) => SCENES.findIndex((s) => s.name === n);

// ---------- Fondo: degradado con halos que laten con la música ----------
const Backdrop: React.FC<{ f: number }> = ({ f }) => {
  const drop = SCENES[byName("logo")].start;
  const on = f >= drop ? 1 : 0.35;
  const p = beatPulse(f) * on;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 80% at 50% 0%, #1a2a26 0%, ${T.bg} 60%)` }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 520 + Math.sin(f / 70) * 80,
          top: 520 + Math.cos(f / 90) * 60,
          width: 1040,
          height: 1040,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(124,195,176,${0.16 + 0.1 * p}) 0%, rgba(124,195,176,0) 65%)`,
          transform: `scale(${1 + 0.04 * p})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 620 + Math.cos(f / 60) * 70,
          top: 150 + Math.sin(f / 80) * 50,
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(224,87,74,${0.1 + 0.08 * p}) 0%, rgba(224,87,74,0) 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// ---------- Titular animado palabra a palabra ----------
const Headline: React.FC<{ f: number; dur: number; top: string; bottom?: string; at?: number }> = ({ f, dur, top, bottom, at = 0 }) => {
  const out = ease(f, dur - 8, 8);
  const words = top.split(" ");
  return (
    <div style={{ position: "absolute", top: 230, left: 70, right: 150, fontFamily: FONT, opacity: 1 - out, transform: `translateY(${-30 * out}px)` }}>
      <div style={{ fontSize: 76, fontWeight: 800, color: T.ink, letterSpacing: -2, lineHeight: 1.02 }}>
        {words.map((w, i) => {
          const a = pop(f, at + i * 3, 14);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 18, opacity: Math.min(1, a), transform: `translateY(${(1 - a) * 40}px)` }}>
              {w}
            </span>
          );
        })}
      </div>
      {bottom ? (
        <div style={{ fontSize: 44, fontWeight: 700, color: T.accent, marginTop: 12, opacity: ease(f, at + words.length * 3 + 6, 10) }}>{bottom}</div>
      ) : null}
    </div>
  );
};

// ---------- Móvil ----------
const PHONE = { w: SW + 24, h: SH + 24, x: (W - SW - 24) / 2, y: 560 };
const SCREENS: Record<string, React.FC<{ f: number; cues: Cue[] }>> = {
  record: RecordScreen,
  summary: SummaryScreen,
  search: SearchScreen,
  context: ContextScreen,
  privacy: PrivacyScreen,
};
const PHONE_SCENES = ["record", "summary", "search", "context", "privacy"];

const Phone: React.FC<{ f: number }> = ({ f }) => {
  const first = SCENES[byName("record")];
  const end = SCENES[byName("end")];
  if (f < first.start || f >= end.start + 20) return null;
  const enter = pop(f, first.start, 16);
  const exit = ease(f, end.start, 16);
  const y = PHONE.y + (1 - enter) * 1300 + exit * 1400;
  const idx = PHONE_SCENES.findIndex((n) => {
    const s = SCENES[byName(n)];
    return f >= s.start && f < s.start + s.dur;
  });
  const cur = idx < 0 ? PHONE_SCENES.length - 1 : idx;
  const sc = SCENES[byName(PHONE_SCENES[cur])];
  const lf = f - sc.start;
  const slide = cur > 0 ? ease(lf, 0, 14) : 1;
  const prev = cur > 0 ? SCENES[byName(PHONE_SCENES[cur - 1])] : null;
  const Cur = SCREENS[PHONE_SCENES[cur]];
  const Prev = prev ? SCREENS[prev.name] : null;
  const tilt = Math.sin(f / 50) * 1.2;
  return (
    <div
      style={{
        position: "absolute",
        left: PHONE.x,
        top: y,
        width: PHONE.w,
        height: PHONE.h,
        borderRadius: 64,
        background: "#050605",
        border: "3px solid #3a403c",
        boxShadow: "0 60px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,195,176,0.15)",
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div style={{ position: "absolute", left: 12, top: 12, width: SW, height: SH, borderRadius: 52, overflow: "hidden" }}>
        {Prev && slide < 1 ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${-slide * 40}%)`, opacity: 1 - slide }}>
            <Prev f={f - prev!.start} cues={prev!.cues} />
          </div>
        ) : null}
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - slide) * 100}%)` }}>
          <Cur f={lf} cues={sc.cues} />
        </div>
        {/* barra de estado y cámara */}
        <div style={{ position: "absolute", top: 14, left: 30, right: 30, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: 17, fontWeight: 600, color: T.ink }}>
          <span>10:44</span>
          <span style={{ letterSpacing: 2 }}>▮▮▮ 5G</span>
        </div>
        <div style={{ position: "absolute", top: 14, left: SW / 2 - 14, width: 28, height: 28, borderRadius: 14, background: "#000" }} />
      </div>
    </div>
  );
};

// ---------- Gancho inicial ----------
const FRAGMENTS = [
  { t: "¿El viernes?", x: 120, y: 760, d: 0 },
  { t: "4.800 €… ¿o 4.500?", x: 520, y: 900, d: 10 },
  { t: "¿Quién enviaba el contrato?", x: 150, y: 1060, d: 22 },
  { t: "¿Era el lunes?", x: 600, y: 1190, d: 34 },
];
const Hook: React.FC<{ f: number; sc: Scene }> = ({ f, sc }) => {
  const card = pop(f, 2, 12);
  const out = ease(f, sc.dur - 6, 6);
  const words = "¿Qué acordasteis en esa llamada?".split(" ");
  return (
    <AbsoluteFill style={{ fontFamily: FONT, opacity: 1 - out }}>
      <div
        style={{
          position: "absolute",
          left: 190,
          right: 190,
          top: 400,
          background: T.surface,
          border: `1px solid ${T.line}`,
          borderRadius: 28,
          padding: "22px 26px",
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: Math.min(1, card),
          transform: `translateY(${(1 - card) * -60}px) rotate(${Math.sin(f / 3) * (f < 20 ? 2 : 0)}deg)`,
        }}
      >
        <div style={{ width: 64, height: 64, borderRadius: 32, background: "#3a1f1c", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(135deg)" }}>
          <IcPhone size={34} color={T.danger} />
        </div>
        <div>
          <div style={{ color: T.ink, fontSize: 30, fontWeight: 700 }}>Llamada finalizada</div>
          <div style={{ color: T.ink2, fontSize: 24 }}>Laura Gómez · 6:12</div>
        </div>
      </div>
      {FRAGMENTS.map((fr, i) => {
        const a = ease(f, 18 + fr.d, 12) * (1 - ease(f, 18 + fr.d + 50, 20));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: fr.x,
              top: fr.y - (f - fr.d) * 0.6,
              color: T.ink2,
              fontSize: 40,
              fontWeight: 600,
              fontStyle: "italic",
              opacity: a * 0.85,
              filter: `blur(${(1 - a) * 6 + Math.max(0, f - fr.d - 50) * 0.08}px)`,
            }}
          >
            {fr.t}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 70, right: 150, top: 1330, fontSize: 84, fontWeight: 800, color: T.ink, letterSpacing: -2, lineHeight: 1.02 }}>
        {words.map((w, i) => {
          const a = pop(f, 30 + i * 6, 13);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 20, opacity: Math.min(1, a), transform: `translateY(${(1 - a) * 50}px)`, color: i === 1 ? T.accent : T.ink }}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Logo en el drop ----------
const Logo: React.FC<{ f: number; sc: Scene; gf: number }> = ({ f, sc, gf }) => {
  const s = pop(f, 0, 9);
  const flash = 1 - ease(f, 0, 10);
  const out = ease(f, sc.dur - 8, 8);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center", justifyContent: "center", opacity: 1 - out }}>
      <div style={{ position: "absolute", inset: 0, background: T.accent, opacity: 0.35 * flash }} />
      <div style={{ transform: `scale(${0.4 + 0.6 * s})`, marginTop: -120 }}>
        <AppIcon size={300} dotPulse={beatPulse(gf)} />
      </div>
      <div style={{ fontSize: 170, fontWeight: 800, color: T.ink, letterSpacing: -6, marginTop: 30, transform: `translateY(${(1 - s) * 60}px)`, opacity: Math.min(1, s) }}>
        Acta
      </div>
      <div style={{ fontSize: 46, fontWeight: 600, color: T.accent, marginTop: 6, opacity: ease(f, 14, 12) }}>Tus llamadas, con memoria</div>
    </AbsoluteFill>
  );
};

// ---------- Cierre ----------
const End: React.FC<{ f: number; gf: number }> = ({ f, gf }) => {
  const s = pop(f, 10, 11);
  const words = "Tus llamadas, por fin con memoria.".split(" ");
  const p = beatPulse(gf);
  return (
    <AbsoluteFill style={{ fontFamily: FONT, alignItems: "center" }}>
      <div style={{ marginTop: 420, transform: `scale(${0.5 + 0.5 * s})`, opacity: Math.min(1, s) }}>
        <AppIcon size={240} dotPulse={p} />
      </div>
      <div style={{ fontSize: 150, fontWeight: 800, color: T.ink, letterSpacing: -5, marginTop: 20, opacity: Math.min(1, s) }}>Acta</div>
      <div style={{ fontSize: 60, fontWeight: 800, color: T.ink, textAlign: "center", lineHeight: 1.08, padding: "0 120px 0 90px", marginTop: 20, letterSpacing: -1 }}>
        {words.map((w, i) => {
          const a = pop(f, 22 + i * 4, 14);
          return (
            <span key={i} style={{ display: "inline-block", marginRight: 16, opacity: Math.min(1, a), color: i >= 3 ? T.accent : T.ink }}>
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 60,
          background: T.accent,
          color: T.onAccent,
          fontSize: 44,
          fontWeight: 800,
          padding: "24px 60px",
          borderRadius: 60,
          opacity: ease(f, 50, 12),
          transform: `scale(${(0.9 + 0.1 * ease(f, 50, 12)) * (1 + 0.04 * p)})`,
          boxShadow: `0 0 ${40 + 30 * p}px rgba(124,195,176,0.45)`,
        }}
      >
        Pruébala hoy
      </div>
      <div style={{ position: "absolute", top: 1440, left: 90, right: 150, textAlign: "center", color: T.ink3, fontSize: 24, opacity: ease(f, 60, 15) }}>
        Respeta la normativa sobre grabación de llamadas de tu país.
      </div>
    </AbsoluteFill>
  );
};

const HEADLINES: Record<string, { top: string; bottom: string; second?: { top: string; bottom: string } }> = {
  record: { top: "Graba cada llamada", bottom: "con las dos voces" },
  summary: {
    top: "Resumen y tareas",
    bottom: "al colgar, con IA",
    second: { top: "Directo a tu calendario", bottom: "con un solo toque" },
  },
  search: { top: "Busca lo que se dijo", bottom: "y salta al momento exacto" },
  context: { top: "Recuerda de qué hablasteis", bottom: "antes de contestar" },
  privacy: { top: "Privado de verdad", bottom: "cifrado y con tu huella" },
};

export const ActaReel: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const sc = SCENES[i];
  const f = gf - sc.start;
  const h = HEADLINES[sc.name];
  let headline: React.ReactNode = null;
  if (h) {
    if (h.second && sc.cues[1]) {
      const switchAt = sc.cues[1].at - 4;
      headline =
        f < switchAt ? (
          <Headline f={f} dur={switchAt} top={h.top} bottom={h.bottom} />
        ) : (
          <Headline f={f - switchAt} dur={sc.dur - switchAt} top={h.second.top} bottom={h.second.bottom} />
        );
    } else headline = <Headline f={f} dur={sc.dur} top={h.top} bottom={h.bottom} />;
  }
  const endFade = interpolate(gf, [ACTA_DURATION - 20, ACTA_DURATION], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: T.bg, opacity: endFade }}>
      <Audio src={staticFile("acta/mix.wav")} />
      <Backdrop f={gf} />
      {sc.name === "hook" ? <Hook f={f} sc={sc} /> : null}
      {sc.name === "logo" ? <Logo f={f} sc={sc} gf={gf} /> : null}
      <Phone f={gf} />
      {headline}
      {sc.name === "end" ? <End f={f} gf={gf} /> : null}
    </AbsoluteFill>
  );
};


