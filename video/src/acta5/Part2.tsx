import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing2.json";
import { AppIcon, IcCheck, IcFinger, IcLock, IcShield } from "../acta/theme";
import {
  Bg,
  BLUE,
  Captions,
  Chapter,
  clamp,
  cueAt,
  ease,
  FONT,
  GOLD,
  IcCloud,
  IcScale,
  IcTelegram,
  IcX,
  MONO,
  pop,
  RED,
  Scene,
  SP,
  T,
  wa,
} from "./ui";

const SCENES = timing.scenes as unknown as Scene[];
export const TUTORIAL2_DURATION = timing.total;
const CAP = 1250;

const Pill: React.FC<{ f: number; at: number; color: string; bg: string; children: React.ReactNode; rot?: number; size?: number }> = ({ f, at, color, bg, children, rot = 0, size = 40 }) => {
  const a = pop(f, at, 11);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, background: bg, border: `3px solid ${color}`, borderRadius: 26, padding: "16px 26px", fontFamily: FONT, fontSize: size, fontWeight: 900, color: T.ink, opacity: Math.min(1, a), transform: `rotate(${rot}deg) scale(${0.8 + 0.2 * Math.min(1, a)})`, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
      {children}
    </div>
  );
};
const PhoneBig: React.FC<{ children?: React.ReactNode; w?: number }> = ({ children, w = 250 }) => (
  <div style={{ width: w, height: w * 1.8, background: T.bg, border: "6px solid #3a403c", borderRadius: 40, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", boxShadow: "0 40px 90px rgba(0,0,0,0.55), 0 0 60px rgba(124,195,176,0.18)" }}>
    {children}
  </div>
);

// ======================= Gancho =======================
const Hook: React.FC<SP> = ({ f, cues }) => {
  const s = wa(cues, "h2", "seguro");
  const l = wa(cues, "h2", "legal");
  const x = wa(cues, "h2", "explico");
  const logo = pop(f, 4, 10);
  return (
    <>
      <div style={{ position: "absolute", top: 290, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 34, fontFamily: FONT }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * logo})`, opacity: Math.min(1, logo) }}>
          <AppIcon size={130} dotPulse={Math.abs(Math.sin(f / 9))} />
        </div>
        <Pill f={f} at={s - 4} color={T.ok} bg={T.okSoft} rot={-3} size={104}>
          <IcShield size={110} color={T.ok} /> ¿SEGURA?
        </Pill>
        <Pill f={f} at={l - 4} color={GOLD} bg="#33280f" rot={3} size={104}>
          <IcScale size={110} color={GOLD} /> ¿LEGAL?
        </Pill>
        <div style={{ fontSize: 60, fontWeight: 900, color: T.accent, opacity: ease(f, x - 2, 10) }}>Te lo explico</div>
      </div>
      <Captions f={f} cues={cues} y={CAP + 40} />
    </>
  );
};

// ======================= Solo en tu móvil =======================
const Local: React.FC<SP> = ({ f, cues }) => {
  const tPhone = wa(cues, "s1", "movil");
  const items = [
    { t: "audios", at: wa(cues, "s1", "audios") },
    { t: "contactos", at: wa(cues, "s1", "contactos") },
    { t: "llamadas", at: wa(cues, "s1", "llamadas") },
  ];
  const a = pop(f, tPhone - 12, 12);
  return (
    <>
      <Chapter n={1} total={2} label="SEGURIDAD" f={f} />
      <div style={{ position: "absolute", top: 350, left: 50, right: 130, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT }}>
        <div style={{ opacity: Math.min(1, a), transform: `scale(${0.85 + 0.15 * Math.min(1, a)})`, textAlign: "center" }}>
          <PhoneBig w={300}>
            <div style={{ position: "absolute", top: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
              <IcLock size={130} color={T.accent} />
              <div style={{ fontSize: 34, fontWeight: 900, color: T.ink, textAlign: "center", lineHeight: 1.1, padding: "0 10px" }}>Todo se queda aquí</div>
            </div>
          </PhoneBig>
          <div style={{ marginTop: 22, fontSize: 42, fontWeight: 900, color: T.accent }}>Tu móvil</div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22, padding: "0 20px" }}>
          {items.map((it) => {
            const p = pop(f, it.at - 2, 11);
            return (
              <div key={it.t} style={{ display: "flex", alignItems: "center", gap: 14, opacity: Math.min(1, p), transform: `translateX(${(1 - Math.min(1, p)) * 60}px)` }}>
                <div style={{ height: 6, flex: 1, background: `repeating-linear-gradient(90deg, ${RED} 0 14px, transparent 14px 26px)`, borderRadius: 3 }} />
                <IcX size={60} />
                <div style={{ fontSize: 40, fontWeight: 900, color: T.ink, width: 215 }}>{it.t}</div>
              </div>
            );
          })}
        </div>
        <div style={{ opacity: Math.min(1, a), textAlign: "center", width: 190 }}>
          <IcCloud size={150} color={T.ink3} />
          <div style={{ fontSize: 30, fontWeight: 800, color: T.ink2, lineHeight: 1.1 }}>Desarrollador</div>
          <div style={{ fontSize: 30, color: RED, fontWeight: 900 }}>no recibe</div>
        </div>
      </div>
      <Captions f={f} cues={cues} y={CAP} />
    </>
  );
};

// ======================= Cifrado =======================
const GARBLE = "9f#Qx7!Lm@2Zk$Rt8&Vp%3Hc^Wd*";
const Crypto: React.FC<SP> = ({ f, cues }) => {
  const tEnc = wa(cues, "s2", "cifra");
  const tKey = wa(cues, "s2", "clave");
  const tKs = wa(cues, "s2", "almacen");
  const tPc = wa(cues, "s2", "ordenador");
  const tNo = wa(cues, "s2", "escucharlos");
  const enc = interpolate(f, [tEnc + 6, tEnc + 30], [0, 1], clamp);
  const scrambled = enc > 0.5;
  const p = (a: number) => Math.min(1, pop(f, a, 11));
  return (
    <>
      <Chapter n={1} total={2} label="SEGURIDAD" f={f} />
      <div style={{ position: "absolute", top: 350, left: 40, right: 120, fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0, overflow: "hidden", background: T.surface, border: `2px solid ${T.line}`, borderRadius: 24, padding: "24px 20px", height: 250, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ color: T.ink2, fontSize: 30, fontWeight: 800, marginBottom: 10 }}>{scrambled ? "Archivo cifrado" : "Tu llamada"}</div>
            <div style={{ height: 80, display: "flex", alignItems: "center", gap: 3, fontFamily: MONO, color: GOLD, fontSize: 31, overflow: "hidden", whiteSpace: "nowrap" }}>
              {scrambled
                ? GARBLE.repeat(2)
                : Array.from({ length: 22 }, (_, i) => <div key={i} style={{ flex: 1, height: `${25 + 75 * Math.abs(Math.sin(i * 1.3 + f * 0.1) * Math.sin(i * 0.5 + 1))}%`, borderRadius: 2, background: T.accent }} />)}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", margin: "22px 0" }}>
          <Pill f={f} at={tEnc - 2} color={T.accent} bg={T.accentSoft} size={52}>
            <IcLock size={64} /> AES-256-GCM al colgar
          </Pill>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          <div style={{ opacity: p(tKey - 2), transform: `scale(${0.85 + 0.15 * p(tKey - 2)})`, background: T.surface, border: `2px solid ${GOLD}`, borderRadius: 22, padding: "16px 26px", fontSize: 42, fontWeight: 900, color: T.ink }}>
            🗝 Clave solo en tu móvil
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", marginTop: 18, opacity: p(tKs - 2), transform: `scale(${0.85 + 0.15 * p(tKs - 2)})` }}>
          <div style={{ background: T.surface, border: `2px solid ${T.accent}`, borderRadius: 22, padding: "16px 24px", fontSize: 38, fontWeight: 900, color: T.ink, display: "flex", alignItems: "center", gap: 12 }}>
            <IcShield size={52} /> Almacén seguro de Android
          </div>
        </div>
        {f >= tPc - 4 ? (
          <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 18, justifyContent: "center", opacity: p(tPc - 4), transform: `scale(${0.85 + 0.15 * p(tPc - 4)})` }}>
            <div style={{ background: "#0c1210", border: "4px solid #3a403c", borderRadius: 14, padding: "22px 30px", fontFamily: MONO, fontSize: 31, color: "#9fb4ad" }}>
              <div style={{ color: T.accent, fontWeight: 700 }}>$ play llamada.enc</div>
              <div style={{ color: f >= tNo ? RED : "#9fb4ad", fontWeight: 700, marginTop: 6 }}>{f >= tNo ? "✗ ilegible sin la clave" : GARBLE}</div>
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: T.ink, maxWidth: 290, lineHeight: 1.1 }}>Copiado al ordenador</div>
          </div>
        ) : null}
      </div>
      <Captions f={f} cues={cues} y={CAP + 50} />
    </>
  );
};

// ======================= Huella y qué sale del móvil =======================
const Lock: React.FC<SP> = ({ f, cues }) => {
  const tFinger = wa(cues, "s3", "huella");
  const tShots = wa(cues, "s3", "capturas");
  const tOnly = wa(cues, "s3", "unico");
  const tGroq = wa(cues, "s3", "groq");
  const scan = interpolate(f, [tFinger, tFinger + 36], [0, 1], clamp);
  const done = f > tFinger + 40;
  if (f < tOnly - 10)
    return (
      <>
        <Chapter n={1} total={2} label="SEGURIDAD" f={f} />
        <div style={{ position: "absolute", top: 330, left: 60, right: 140, display: "flex", flexDirection: "column", alignItems: "center", gap: 28, fontFamily: FONT }}>
          <div style={{ width: 330, height: 330, borderRadius: 165, background: done ? T.okSoft : T.accentSoft, border: `4px solid ${done ? T.ok : T.accent}`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {done ? <IcCheck size={190} /> : <IcFinger size={220} progress={scan} />}
            {!done && scan > 0 ? <div style={{ position: "absolute", left: 0, right: 0, top: `${scan * 100}%`, height: 4, background: T.accent, boxShadow: `0 0 20px ${T.accent}` }} /> : null}
          </div>
          <div style={{ fontSize: 70, fontWeight: 900, color: T.ink }}>Huella o PIN</div>
          <Pill f={f} at={tShots - 2} color={RED} bg="#2a1412" size={50}>
            <span style={{ fontSize: 60 }}>📵</span> Sin capturas de pantalla
          </Pill>
        </div>
        <Captions f={f} cues={cues} y={CAP + 30} />
      </>
    );
  const a = pop(f, tOnly - 10, 12);
  const arrow = interpolate(f, [tGroq - 14, tGroq + 14], [0, 1], clamp);
  return (
    <>
      <Chapter n={1} total={2} label="SEGURIDAD" f={f} />
      <div style={{ position: "absolute", top: 380, left: 50, right: 130, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT, opacity: Math.min(1, a) }}>
        <div style={{ textAlign: "center" }}>
          <PhoneBig w={250}>
            <IcLock size={110} color={T.accent} />
          </PhoneBig>
          <div style={{ marginTop: 16, fontSize: 38, fontWeight: 900 }}>Tu móvil</div>
        </div>
        <div style={{ flex: 1, padding: "0 16px", textAlign: "center" }}>
          <div style={{ height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${T.accent} ${arrow * 100}%, ${T.line} ${arrow * 100}%)` }} />
          <div style={{ marginTop: 16, fontSize: 38, fontWeight: 900, color: GOLD, lineHeight: 1.1, opacity: arrow }}>Solo el audio que tú analizas</div>
        </div>
        <div style={{ textAlign: "center", opacity: ease(f, tGroq - 10, 12) }}>
          <IcCloud size={190} color={"#f55036"} />
          <div style={{ fontSize: 44, fontWeight: 900, color: "#f55036" }}>Groq</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: 960, left: 70, right: 150, textAlign: "center", fontFamily: FONT, fontSize: 44, color: T.ink2, fontWeight: 700, opacity: ease(f, tGroq + 10, 12), lineHeight: 1.3 }}>
        El resto de tus datos <span style={{ color: T.accent, fontWeight: 900 }}>siguen en el móvil</span>
      </div>
      <Captions f={f} cues={cues} y={CAP + 30} />
    </>
  );
};

// ======================= Legal: lo que sí =======================
const Legal1: React.FC<SP> = ({ f, cues }) => {
  const tTool = wa(cues, "l1", "herramienta");
  const tEs = wa(cues, "l1", "espana");
  const tProof = wa(cues, "l1", "prueba");
  const a = (x: number) => Math.min(1, pop(f, x, 11));
  return (
    <>
      <Chapter n={2} total={2} label="LEGALIDAD · ESPAÑA" f={f} />
      <div style={{ position: "absolute", top: 340, left: 50, right: 130, display: "flex", flexDirection: "column", gap: 26, fontFamily: FONT }}>
        <div style={{ display: "flex", justifyContent: "center", opacity: a(tTool - 6), transform: `scale(${0.85 + 0.15 * a(tTool - 6)})` }}>
          <div style={{ background: T.surface, border: `2px solid ${T.accent}`, borderRadius: 26, padding: "18px 30px", fontSize: 48, fontWeight: 900, display: "flex", alignItems: "center", gap: 16 }}>
            <AppIcon size={72} /> Acta: herramienta legal
          </div>
        </div>
        <div style={{ opacity: a(tEs - 4), transform: `translateY(${(1 - a(tEs - 4)) * 40}px)`, background: T.okSoft, border: `4px solid ${T.ok}`, borderRadius: 30, padding: "30px 30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <IcCheck size={80} />
            <div style={{ fontSize: 40, fontWeight: 900, color: T.ok, letterSpacing: 2 }}>EN ESPAÑA ES LEGAL</div>
          </div>
          <div style={{ fontSize: 70, fontWeight: 900, color: T.ink, lineHeight: 1.08, marginTop: 14, letterSpacing: -1 }}>Grabar una llamada en la que <span style={{ color: T.ok }}>tú participas</span></div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", opacity: a(tProof - 4), transform: `scale(${0.85 + 0.15 * a(tProof - 4)})` }}>
          <div style={{ background: "#33280f", border: `3px solid ${GOLD}`, borderRadius: 22, padding: "16px 28px", fontSize: 46, fontWeight: 900, display: "flex", alignItems: "center", gap: 14 }}>
            <IcScale size={58} /> Puede servir como prueba
          </div>
        </div>
      </div>
      <Captions f={f} cues={cues} y={CAP + 60} />
    </>
  );
};

// ======================= Legal: lo que no =======================
const Legal2: React.FC<SP> = ({ f, cues }) => {
  const tAj = wa(cues, "l2", "ajenas");
  const tDif = wa(cues, "l2", "difundir");
  const tDel = wa(cues, "l2", "delito");
  const tResp = wa(cues, "l2", "responsabilidad");
  const tAse = wa(cues, "l2", "asesoramiento");
  const tEmg = cueAt(cues, "l3");
  const a = (x: number) => Math.min(1, pop(f, x, 11));
  const Row: React.FC<{ at: number; title: string; sub?: string }> = ({ at, title, sub }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#2a1412", border: `3px solid ${RED}`, borderRadius: 26, padding: "26px 26px", opacity: a(at - 4), transform: `translateX(${(1 - a(at - 4)) * 70}px)` }}>
      <IcX size={76} />
      <div>
        <div style={{ fontSize: 48, fontWeight: 900, color: T.ink, lineHeight: 1.1 }}>{title}</div>
        {sub ? <div style={{ fontSize: 34, color: "#ffb4ab", fontWeight: 800, marginTop: 6 }}>{sub}</div> : null}
      </div>
    </div>
  );
  if (f >= tEmg - 8)
    return (
      <>
        <Chapter n={2} total={2} label="LEGALIDAD · ESPAÑA" f={f} />
        <div style={{ position: "absolute", top: 380, left: 60, right: 140, fontFamily: FONT, opacity: a(tEmg - 6), transform: `scale(${0.85 + 0.15 * a(tEmg - 6)})` }}>
          <div style={{ background: "#33280f", border: `4px solid ${GOLD}`, borderRadius: 32, padding: "34px 30px", textAlign: "center" }}>
            <div style={{ fontSize: 170, fontWeight: 900, color: GOLD, letterSpacing: -5, lineHeight: 1 }}>112</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: T.ink, marginTop: 10 }}>Emergencias</div>
            <div style={{ fontSize: 46, color: T.ink2, fontWeight: 800, marginTop: 12, lineHeight: 1.2 }}>Usa la app de teléfono original</div>
          </div>
        </div>
        <Captions f={f} cues={cues} y={CAP + 30} />
      </>
    );
  return (
    <>
      <Chapter n={2} total={2} label="LEGALIDAD · ESPAÑA" f={f} />
      <div style={{ position: "absolute", top: 330, left: 50, right: 130, display: "flex", flexDirection: "column", gap: 18, fontFamily: FONT }}>
        <Row at={tAj} title="Grabar conversaciones ajenas" sub={f >= tDel - 20 ? "Art. 197 del Código Penal" : undefined} />
        <Row at={tDif} title="Difundir una grabación sin permiso" sub={f >= tDel ? "Puede ser delito" : undefined} />
        <div style={{ display: "flex", alignItems: "center", gap: 18, background: "#33280f", border: `3px solid ${GOLD}`, borderRadius: 26, padding: "26px 26px", opacity: a(tResp - 4), transform: `translateX(${(1 - a(tResp - 4)) * 70}px)` }}>
          <IcScale size={76} />
          <div style={{ fontSize: 48, fontWeight: 900, color: T.ink, lineHeight: 1.1 }}>El uso es siempre responsabilidad tuya</div>
        </div>
        <div style={{ textAlign: "center", fontSize: 40, color: T.ink2, fontWeight: 800, opacity: a(tAse - 4), marginTop: 10 }}>No es asesoramiento jurídico</div>
      </div>
      <Captions f={f} cues={cues} y={CAP + 60} />
    </>
  );
};

// ======================= Cierre =======================
const End: React.FC<SP> = ({ f, cues }) => {
  const a = pop(f, 6, 11);
  const url = pop(f, wa(cues, "e1", "actaapp"), 11);
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a) }}>
          <AppIcon size={220} dotPulse={Math.abs(Math.sin(f / 9))} />
        </div>
        <div style={{ fontSize: 124, fontWeight: 900, color: T.ink, letterSpacing: -4, marginTop: 16, opacity: Math.min(1, a) }}>Acta</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: T.accent, opacity: Math.min(1, a) }}>Tus llamadas, con memoria</div>
        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 14, background: BLUE, color: "#07202f", fontWeight: 900, fontSize: 58, padding: "14px 32px", borderRadius: 22, opacity: Math.min(1, url), transform: `scale(${0.85 + 0.15 * Math.min(1, url)})` }}>
          <IcTelegram size={56} color="#07202f" /> t.me/actaapp
        </div>
        <div style={{ marginTop: 40, fontSize: 28, color: T.ink3, textAlign: "center", lineHeight: 1.35, padding: "0 70px", opacity: ease(f, 40, 14) }}>
          Información general, no es asesoramiento jurídico.
          <br />
          Respeta la ley de tu país al grabar llamadas.
        </div>
      </div>
      <Captions f={f} cues={cues} y={CAP + 150} />
    </>
  );
};

const MAP: Record<string, React.FC<SP>> = { hook: Hook, local: Local, crypto: Crypto, lock: Lock, legal1: Legal1, legal2: Legal2, end: End };

export const Tutorial2: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const s = SCENES[i];
  const f = gf - s.start;
  const Cmp = MAP[s.name];
  const legal = s.name.startsWith("legal");
  const fadeIn = interpolate(f, [0, 8], [0, 1], clamp);
  const endFade = interpolate(gf, [TUTORIAL2_DURATION - 18, TUTORIAL2_DURATION], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: T.bg, opacity: endFade }}>
      <Audio src={staticFile("acta5/mix2.wav")} />
      <Bg glow={legal ? "rgba(255,207,92,0.12)" : "rgba(124,195,176,0.16)"} />
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <Cmp f={f} cues={s.cues} dur={s.dur} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
