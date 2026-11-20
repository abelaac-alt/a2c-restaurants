import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame } from "remotion";
import timing from "./timing1.json";
import { AppIcon, IcCheck, IcShield, Tap } from "../acta/theme";
import {
  AppBar,
  Bg,
  BLUE,
  Btn,
  Captions,
  Chapter,
  Chip,
  clamp,
  cueAt,
  cueEnd,
  Dialog,
  ease,
  FONT,
  GOLD,
  IcDown,
  IcFile,
  IcFolder,
  IcPlug,
  IcTelegram,
  IcTerm,
  IcX,
  IcZip,
  MONO,
  PhoneFrame,
  PhoneIn,
  pop,
  RED,
  Scene,
  Screen,
  SP,
  SW,
  T,
  Toggle,
  typed,
  wa,
  WindowFrame,
} from "./ui";

const SCENES = timing.scenes as unknown as Scene[];
export const TUTORIAL1_DURATION = timing.total;
const CAP_PHONE = 1330;
const CAP_FREE = 1250;

// ======================= 0 · Introducción =======================
const Intro: React.FC<SP> = ({ f }) => {
  const logo = pop(f, 4, 10);
  const steps = [
    ["1", "Descarga por Telegram"],
    ["2", "Instala la APK"],
    ["3", "Concede los permisos"],
    ["4", "Graba las dos voces (ADB)"],
    ["5", "Conecta Groq: IA gratis"],
  ];
  return (
    <>
      <div style={{ position: "absolute", top: 270, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
        <div style={{ transform: `scale(${0.5 + 0.5 * logo}) rotate(${(1 - logo) * -15}deg)`, opacity: Math.min(1, logo) }}>
          <AppIcon size={190} dotPulse={Math.abs(Math.sin(f / 10))} />
        </div>
        <div style={{ fontSize: 104, fontWeight: 900, color: T.ink, letterSpacing: -4, lineHeight: 1, marginTop: 24, opacity: ease(f, 12, 10) }}>Instala Acta</div>
        <div style={{ fontSize: 84, fontWeight: 900, color: T.accent, letterSpacing: -3, lineHeight: 1.05, opacity: ease(f, 20, 10) }}>en 5 minutos</div>
      </div>
      <div style={{ position: "absolute", top: 760, left: 90, right: 170, display: "flex", flexDirection: "column", gap: 16, fontFamily: FONT }}>
        {steps.map(([n, t], i) => {
          const a = pop(f, 50 + i * 24, 12);
          return (
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 20, background: T.surface, border: `1.5px solid ${T.line}`, borderRadius: 22, padding: "16px 24px", opacity: Math.min(1, a), transform: `translateX(${(1 - a) * 80}px)` }}>
              <div style={{ width: 54, height: 54, borderRadius: 27, background: T.accent, color: T.onAccent, fontSize: 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: T.ink }}>{t}</div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ======================= 1 · Descarga por Telegram =======================
const TG = { bg: "#0e1621", bar: "#17212b", bubble: "#182533", blue: "#3390ec" };
const TelegramChat: React.FC<{ progress: number; done: boolean; pressed?: boolean }> = ({ progress, done, pressed }) => {
  const R = 30;
  const C = 2 * Math.PI * R;
  return (
    <Screen bg={TG.bg}>
      <div style={{ height: 124, background: TG.bar, display: "flex", alignItems: "flex-end", gap: 14, padding: "0 18px 14px" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" style={{ marginBottom: 12 }}>
          <path d="M15 5l-7 7 7 7" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ width: 62, height: 62, borderRadius: 31, background: T.accent, color: T.onAccent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900 }}>A</div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>Acta</div>
          <div style={{ fontSize: 17, color: "#7f91a4" }}>canal · t.me/actaapp</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 20, right: 40, top: 330 }}>
        <div style={{ background: TG.bubble, borderRadius: "22px 22px 22px 6px", padding: "18px 20px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0, transform: `scale(${pressed ? 0.9 : 1})` }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 38, background: done ? "#2fa86a" : TG.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {done ? <IcFile size={38} /> : progress > 0 ? <IcX size={30} color="#fff" /> : <IcDown size={38} />}
              </div>
              {progress > 0 && !done ? (
                <svg width="76" height="76" viewBox="0 0 76 76" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="38" cy="38" r={R} fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} />
                </svg>
              ) : null}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>Acta-4.7.1.apk</div>
              <div style={{ fontSize: 18, color: "#7f91a4", marginTop: 4 }}>{done ? "530 KB" : `${Math.round(530 * progress)} KB / 530 KB`}</div>
            </div>
          </div>
          <div style={{ fontSize: 21, color: "#e8eef5", marginTop: 14 }}>Acta 4.7.1 · última versión</div>
          <div style={{ textAlign: "right", fontSize: 15, color: "#6a7c8e", marginTop: 6 }}>10:12</div>
        </div>
      </div>
    </Screen>
  );
};

const Download: React.FC<SP> = ({ f, cues }) => {
  const tap = wa(cues, "d1", "descargar");
  const url = wa(cues, "d1", "actaapp");
  const p = interpolate(f, [tap + 4, cueEnd(cues, "d2") - 14], [0, 1], clamp);
  const done = f >= cueEnd(cues, "d2") - 14;
  const badge = pop(f, url - 6, 10);
  const secure = pop(f, cueAt(cues, "d2") + 8, 11);
  return (
    <>
      <Chapter n={1} total={5} label="DESCARGA" f={f} />
      <PhoneIn f={f} at={4}>
        <TelegramChat progress={f >= tap + 4 ? p : 0} done={done} pressed={f >= tap && f < tap + 5} />
        <Tap f={f} at={tap} x={78} y={370} color="rgba(51,144,236,0.55)" />
      </PhoneIn>
      {f >= url - 6 ? (
        <div style={{ position: "absolute", left: 40, top: 930, transform: `rotate(-5deg) scale(${Math.min(1, badge)})`, background: BLUE, color: "#07202f", fontFamily: FONT, fontWeight: 900, fontSize: 50, padding: "12px 26px", borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.55)", display: "flex", alignItems: "center", gap: 14 }}>
          <IcTelegram size={50} color="#07202f" /> t.me/actaapp
        </div>
      ) : null}
      {f >= cueAt(cues, "d2") + 8 ? (
        <div style={{ position: "absolute", left: 540, top: 1060, width: 330, transform: `rotate(5deg) scale(${Math.min(1, secure)})`, background: T.okSoft, border: `3px solid ${T.ok}`, color: T.ok, fontFamily: FONT, fontWeight: 900, fontSize: 36, lineHeight: 1.1, padding: "14px 20px", borderRadius: 20, boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}>
          <IcCheck size={34} /> Solo del canal oficial
        </div>
      ) : null}
      <Captions f={f} cues={cues} y={CAP_PHONE} />
    </>
  );
};

// ======================= 2 · Instalar =======================
const Install: React.FC<SP> = ({ f, cues }) => {
  const tFile = wa(cues, "in1", "archivo");
  const tDialog = wa(cues, "in1", "android");
  const tSet = wa(cues, "in1", "activalo");
  const tToggle = tSet + 14;
  const tBack = wa(cues, "in1", "atras");
  const tInstall = wa(cues, "in1", "instalar", 1);
  const tPP = wa(cues, "in2", "play") - 4;
  const tPPend = wa(cues, "in2", "dejale") + 8;
  const tDone = tPPend + 4;
  const stage = f < tDialog ? 0 : f < tSet ? 1 : f < tBack ? 2 : f < tPP ? 3 : f < tPPend ? 4 : f < tDone ? 3 : 5;
  const set = pop(f, tSet, 12);
  return (
    <>
      <Chapter n={2} total={5} label="INSTALAR" f={f} />
      <PhoneFrame y={312} rot={-1.5}>
        {stage === 2 ? (
          <Screen bg="#121413">
            <AppBar title="Instalar apps desconocidas" />
            <div style={{ padding: "10px 24px", opacity: Math.min(1, set), transform: `translateY(${(1 - set) * 40}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18, background: T.surface, borderRadius: 22, padding: "20px 22px" }}>
                <div style={{ width: 62, height: 62, borderRadius: 31, background: TG.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IcTelegram size={34} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 26, fontWeight: 800 }}>Telegram</div>
                  <div style={{ fontSize: 18, color: T.ink2 }}>{f >= tToggle ? "Permitida" : "No permitida"}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24, padding: "10px 6px" }}>
                <div style={{ flex: 1, fontSize: 24, fontWeight: 700 }}>Permitir desde esta fuente</div>
                <Toggle on={f >= tToggle} />
              </div>
              <div style={{ fontSize: 18, color: T.ink2, lineHeight: 1.4, marginTop: 10 }}>Instalar apps de esta fuente puede poner en riesgo tu dispositivo. Instala solo apps de fuentes de confianza.</div>
            </div>
            <Tap f={f} at={tToggle - 4} x={SW - 70} y={420} />
          </Screen>
        ) : (
          <>
            <TelegramChat progress={1} done pressed={f >= tFile && f < tFile + 5} />
            {stage === 0 ? <Tap f={f} at={tFile} x={78} y={370} color="rgba(51,144,236,0.55)" /> : null}
          </>
        )}
        {stage === 1 ? (
          <Dialog
            title="Por tu seguridad, el teléfono no puede instalar apps desconocidas de esta fuente"
            buttons={
              <>
                <Btn kind="ghost" label="Cancelar" />
                <Btn label="Ajustes" pressed={f >= tSet - 6} />
              </>
            }
          />
        ) : null}
        {stage === 3 || stage === 4 ? (
          <Dialog
            icon={<AppIcon size={86} />}
            title="Acta"
            body="¿Quieres instalar esta aplicación?"
            buttons={
              <>
                <Btn kind="ghost" label="Cancelar" />
                <Btn label="Instalar" pressed={f >= tInstall - 2} />
              </>
            }
          />
        ) : null}
        {stage === 4 ? (
          <Dialog
            icon={<IcShield size={86} />}
            title="Play Protect"
            body="¿Analizar la app antes de instalarla?"
            buttons={
              <>
                <Btn kind="ghost" label="Cancelar" />
                <Btn label="Analizar app" pressed={f >= tPPend - 6} />
              </>
            }
          />
        ) : null}
        {stage === 5 ? (
          <Dialog
            icon={<AppIcon size={86} />}
            title="App instalada"
            buttons={
              <>
                <Btn kind="ghost" label="Listo" />
                <Btn label="Abrir" />
              </>
            }
          >
            <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
              <Chip on label="Acta instalada" />
            </div>
          </Dialog>
        ) : null}
        {stage === 1 ? <Tap f={f} at={tSet - 4} x={SW - 120} y={620} /> : null}
        {stage === 3 && f >= tInstall - 4 ? <Tap f={f} at={tInstall - 4} x={SW - 90} y={640} /> : null}
      </PhoneFrame>
      <Captions f={f} cues={cues} y={CAP_PHONE} />
    </>
  );
};

// ======================= 3 · Permisos =======================
const Perms: React.FC<SP> = ({ f, cues }) => {
  const perm = [
    ["Teléfono", wa(cues, "p1", "telefono")],
    ["Contactos", wa(cues, "p1", "contactos")],
    ["Registro de llamadas", wa(cues, "p1", "registro")],
    ["Micrófono", wa(cues, "p1", "microfono")],
    ["Notificaciones", wa(cues, "p1", "notificaciones")],
  ] as const;
  const tDef = wa(cues, "p2", "pulsa");
  const tDefOk = wa(cues, "p2", "acepta") + 6;
  const tBat = wa(cues, "p2", "bateria");
  const tBatOk = wa(cues, "p2", "restricciones") + 8;
  const sec = (a: number) => pop(f, a, 12);
  const Card: React.FC<{ at: number; children: React.ReactNode; accent?: boolean }> = ({ at, children, accent }) => (
    <div style={{ background: T.surface, border: `1.5px solid ${accent ? T.accent : T.line}`, borderRadius: 24, padding: "18px 20px", opacity: Math.min(1, sec(at)), transform: `translateY(${(1 - sec(at)) * 30}px)` }}>{children}</div>
  );
  return (
    <>
      <Chapter n={3} total={5} label="PERMISOS" f={f} />
      <PhoneIn f={f} at={4}>
        <Screen>
          <div style={{ padding: "64px 22px 0" }}>
            <div style={{ fontSize: 30, fontWeight: 900 }}>Asistente de configuración</div>
            <div style={{ fontSize: 17, color: T.ink2, marginTop: 6, lineHeight: 1.35 }}>Te guío paso a paso. Son unos 5 minutos y solo hay que hacerlo una vez.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
              <Card at={8}>
                <div style={{ color: T.ink3, fontSize: 15, fontWeight: 800, letterSpacing: 1.3, marginBottom: 6 }}>1 · PERMISOS</div>
                {perm.map(([n, at], i) => (
                  <div key={n} style={{ display: "flex", alignItems: "center", padding: "9px 0", borderTop: i ? `1px solid ${T.line}` : "none" }}>
                    <div style={{ flex: 1, fontSize: 21, fontWeight: 700 }}>{n}</div>
                    <Chip on={f >= at + 6} label={f >= at + 6 ? "Permitido" : "Permitir"} />
                  </div>
                ))}
              </Card>
              <Card at={tDef - 30} accent={f >= tDef - 30 && f < tDefOk}>
                <div style={{ color: T.ink3, fontSize: 15, fontWeight: 800, letterSpacing: 1.3, marginBottom: 6 }}>2 · APP DE TELÉFONO</div>
                <div style={{ fontSize: 18, color: T.ink2, lineHeight: 1.35, marginBottom: 10 }}>Acta tiene que ser tu app de teléfono para poder grabar.</div>
                {f >= tDefOk ? <Btn kind="ok" label="Acta ya es tu app de teléfono" size={20} /> : <Btn label="Poner Acta como app de teléfono" pressed={f >= tDef + 14 && f < tDefOk} size={20} />}
              </Card>
              <Card at={tBat - 24} accent={f >= tBat - 24 && f < tBatOk}>
                <div style={{ color: T.ink3, fontSize: 15, fontWeight: 800, letterSpacing: 1.3, marginBottom: 6 }}>3 · BATERÍA</div>
                <div style={{ fontSize: 18, color: T.ink2, lineHeight: 1.35, marginBottom: 10 }}>Para que el sistema no interrumpa las llamadas ni la grabación.</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, fontSize: 21, fontWeight: 700 }}>Uso de batería</div>
                  <Chip on={f >= tBatOk} label={f >= tBatOk ? "Sin restricciones" : "Optimizado"} />
                </div>
              </Card>
            </div>
          </div>
          <Tap f={f} at={tDef + 14} x={238} y={650} />
        </Screen>
      </PhoneIn>
      <Captions f={f} cues={cues} y={CAP_PHONE} />
    </>
  );
};

// ======================= 4a · ADB: por qué y opciones de desarrollador =======================
const Laptop: React.FC<{ w?: number; label?: string; glow?: boolean }> = ({ w = 300, label, glow }) => (
  <div style={{ width: w, textAlign: "center", fontFamily: FONT }}>
    <div style={{ height: w * 0.62, background: "#0c1210", border: "5px solid #3a403c", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: glow ? `0 0 50px rgba(124,195,176,0.4)` : "none" }}>
      <IcTerm size={w * 0.3} />
    </div>
    <div style={{ height: 16, background: "#3a403c", borderRadius: "0 0 18px 18px", width: w * 1.12, marginLeft: -w * 0.06 }} />
    {label ? <div style={{ marginTop: 14, fontSize: 28, fontWeight: 800, color: T.ink }}>{label}</div> : null}
  </div>
);
const MiniPhone: React.FC<{ w?: number; label?: string; children?: React.ReactNode }> = ({ w = 170, label, children }) => (
  <div style={{ width: w, textAlign: "center", fontFamily: FONT }}>
    <div style={{ height: w * 1.75, background: T.bg, border: "5px solid #3a403c", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      {children ?? <AppIcon size={w * 0.55} />}
    </div>
    {label ? <div style={{ marginTop: 14, fontSize: 28, fontWeight: 800, color: T.ink }}>{label}</div> : null}
  </div>
);
const Cable: React.FC<{ f: number; w: number }> = ({ f, w }) => {
  const bez = (u: number) => {
    const x = 3 * (1 - u) ** 2 * u * (w * 0.3) + 3 * (1 - u) * u ** 2 * (w * 0.7) + u ** 3 * w;
    const y = (1 - u) ** 3 * 30 + 3 * (1 - u) ** 2 * u * 0 + 3 * (1 - u) * u ** 2 * 60 + u ** 3 * 30;
    return [x, y];
  };
  return (
    <svg width={w} height="70" style={{ overflow: "visible" }}>
      <path d={`M0 30 C ${w * 0.3} 0, ${w * 0.7} 60, ${w} 30`} fill="none" stroke="#6b7a73" strokeWidth="8" strokeLinecap="round" />
      {[0, 1, 2].map((i) => {
        const [x, y] = bez((f * 0.02 + i / 3) % 1);
        return <circle key={i} cx={x} cy={y} r="9" fill={T.accent} />;
      })}
    </svg>
  );
};

const AdbIntro: React.FC<SP> = ({ f, cues }) => {
  const tB = cueAt(cues, "a2") - 8;
  const tAbout = wa(cues, "a2", "ajustes");
  const tTap = wa(cues, "a2", "siete");
  const tDev = wa(cues, "a2", "opciones") - 6;
  const tUsb = wa(cues, "a2", "depuracion");
  const taps = Math.min(7, Math.max(0, Math.floor((f - tTap) / 8)));
  const dev = f >= tDev;
  const appear = (a: number) => pop(f, a, 12);
  if (f < tB)
    return (
      <>
        <Chapter n={4} total={5} label="GRABAR LAS DOS VOCES" f={f} />
        <div style={{ position: "absolute", top: 360, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 36, fontFamily: FONT }}>
          <div style={{ background: GOLD, color: "#111", fontSize: 56, fontWeight: 900, padding: "8px 30px", borderRadius: 16, transform: `rotate(-2deg) scale(${Math.min(1, appear(10))})` }}>UNA SOLA VEZ</div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, opacity: ease(f, 24, 12) }}>
            <MiniPhone w={210} label="Tu móvil" />
            <div style={{ margin: "-40px -6px 0" }}>
              <Cable f={f} w={200} />
            </div>
            <Laptop w={380} label="Un ordenador" glow />
          </div>
          <div style={{ width: 880, display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { ok: false, t: "Apps normales: solo tu voz", at: wa(cues, "a1", "android") },
              { ok: true, t: "ADB propio de Acta: las dos voces", at: wa(cues, "a1", "asi") },
            ].map((r) => {
              const a = appear(r.at);
              return (
                <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 18, background: r.ok ? T.okSoft : "#2a1412", border: `2px solid ${r.ok ? T.ok : RED}`, borderRadius: 22, padding: "16px 24px", opacity: Math.min(1, a), transform: `translateX(${(1 - a) * 60}px)` }}>
                  {r.ok ? <IcCheck size={40} /> : <IcX size={40} />}
                  <div style={{ fontSize: 36, fontWeight: 800, color: T.ink }}>{r.t}</div>
                </div>
              );
            })}
          </div>
        </div>
        <Captions f={f} cues={cues} y={CAP_FREE} />
      </>
    );
  return (
    <>
      <Chapter n={4} total={5} label="GRABAR LAS DOS VOCES" f={f} />
      <PhoneIn f={f} at={tB}>
        {!dev ? (
          <Screen>
            <AppBar title="Acerca del teléfono" />
            <div style={{ padding: "0 22px", opacity: ease(f, tAbout, 10) }}>
              {[
                ["Nombre del dispositivo", "Mi móvil"],
                ["Versión de HyperOS / MIUI", "OS1.0.4"],
                ["Versión de Android", "14"],
                ["Número de compilación", "UP1A.231005"],
              ].map(([k, v], i) => {
                const hot = i === 1;
                return (
                  <div key={k} style={{ padding: "18px 14px", borderRadius: 18, background: hot && taps > 0 ? T.accentSoft : "transparent", border: hot && f >= tAbout ? `2px solid ${T.accent}` : "2px solid transparent", marginBottom: 6 }}>
                    <div style={{ fontSize: 23, fontWeight: 700 }}>{k}</div>
                    <div style={{ fontSize: 18, color: T.ink2, marginTop: 2 }}>{v}</div>
                  </div>
                );
              })}
            </div>
            {taps > 0 ? (
              <div style={{ position: "absolute", left: 24, right: 24, bottom: 120, background: "#2a2d2b", borderRadius: 18, padding: "16px 20px", fontSize: 24, fontWeight: 800, textAlign: "center", color: taps >= 7 ? T.ok : T.ink }}>
                {taps >= 7 ? "¡Ya eres desarrollador!" : `Faltan ${7 - taps} toques`}
              </div>
            ) : null}
            <div style={{ position: "absolute", top: 330, right: 40, background: T.accent, color: T.onAccent, fontWeight: 900, fontSize: 46, width: 74, height: 74, borderRadius: 37, display: "flex", alignItems: "center", justifyContent: "center", opacity: taps > 0 ? 1 : 0, transform: `scale(${1 + 0.15 * Math.sin(f)})` }}>
              {taps}
            </div>
            <Tap f={f} at={tTap + taps * 8} x={200} y={345} />
          </Screen>
        ) : (
          <Screen>
            <AppBar title="Opciones de desarrollador" />
            <div style={{ padding: "0 22px" }}>
              <div style={{ display: "flex", alignItems: "center", background: T.surface, borderRadius: 20, padding: "18px 20px" }}>
                <div style={{ flex: 1, fontSize: 24, fontWeight: 800 }}>Opciones de desarrollador</div>
                <Toggle on />
              </div>
              <div style={{ display: "flex", alignItems: "center", marginTop: 22, padding: "18px 20px", background: f >= tUsb ? T.accentSoft : T.surface, border: `2px solid ${f >= tUsb ? T.accent : T.line}`, borderRadius: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>Depuración USB</div>
                  <div style={{ fontSize: 17, color: T.ink2, marginTop: 4 }}>Modo de depuración con el cable USB conectado</div>
                </div>
                <Toggle on={f >= tUsb + 14} />
              </div>
            </div>
            <Tap f={f} at={tUsb + 10} x={SW - 70} y={290} />
          </Screen>
        )}
      </PhoneIn>
      <Captions f={f} cues={cues} y={CAP_PHONE} />
    </>
  );
};

// ======================= 4b · ADB: ordenador y comandos =======================
const AdbPc: React.FC<SP> = ({ f, cues }) => {
  const tA4 = cueAt(cues, "a4") - 10;
  const s1 = wa(cues, "a3", "descarga");
  const s2 = wa(cues, "a3", "descomprimelas");
  const s3 = wa(cues, "a3", "consola");
  const tCable = wa(cues, "a3", "conecta");
  const tOk = wa(cues, "a3", "acepta");
  const appear = (a: number) => pop(f, a, 12);
  if (f < tA4) {
    const cards = [
      { at: s1, icon: <IcZip size={92} />, t: "Descarga", sub: "Platform Tools" },
      { at: s2, icon: <IcFolder size={92} />, t: "Descomprime", sub: "platform-tools" },
      { at: s3, icon: <IcTerm size={92} />, t: "Abre la consola", sub: "dentro de la carpeta" },
    ];
    return (
      <>
        <Chapter n={4} total={5} label="GRABAR LAS DOS VOCES" f={f} />
        <div style={{ position: "absolute", top: 340, left: 40, right: 120, display: "flex", gap: 16, fontFamily: FONT }}>
          {cards.map((c, i) => {
            const a = appear(c.at - 2);
            return (
              <div key={c.t} style={{ flex: 1, background: T.surface, border: `2px solid ${T.accent}`, borderRadius: 26, padding: "22px 8px", textAlign: "center", opacity: Math.min(1, a), transform: `translateY(${(1 - a) * 60}px) scale(${0.9 + 0.1 * Math.min(1, a)})` }}>
                <div style={{ color: T.accent, fontSize: 28, fontWeight: 900 }}>{i + 1}</div>
                <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>{c.icon}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color: T.ink }}>{c.t}</div>
                <div style={{ fontSize: 20, color: T.ink2, marginTop: 4 }}>{c.sub}</div>
              </div>
            );
          })}
        </div>
        {f >= s1 ? (
          <div style={{ position: "absolute", top: 740, left: 40, right: 120, textAlign: "center", fontFamily: FONT, fontSize: 28, color: T.ink2, opacity: ease(f, s1, 12) }}>
            developer.android.com · SDK Platform-Tools
          </div>
        ) : null}
        {f >= tCable - 6 ? (
          <div style={{ position: "absolute", top: 830, left: 0, right: 80, display: "flex", justifyContent: "center", alignItems: "center", fontFamily: FONT, opacity: ease(f, tCable - 6, 12) }}>
            <Laptop w={230} />
            <div style={{ margin: "-30px -4px 0" }}>
              <Cable f={f} w={150} />
            </div>
            <MiniPhone w={130}>
              {f >= tOk - 18 ? (
                <div style={{ position: "absolute", inset: 8, background: "#2a2d2b", borderRadius: 14, padding: 10, display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: 16, fontWeight: 800, textAlign: "left", color: T.ink }}>
                  <div>¿Permitir depuración USB?</div>
                  <div style={{ background: f >= tOk ? T.accent : "transparent", color: f >= tOk ? T.onAccent : T.accent, borderRadius: 8, padding: "6px 0", textAlign: "center", fontSize: 18 }}>Permitir</div>
                </div>
              ) : (
                <AppIcon size={70} />
              )}
            </MiniPhone>
          </div>
        ) : null}
        <Captions f={f} cues={cues} y={CAP_FREE + 30} />
      </>
    );
  }
  // --- terminal ---
  const c1 = wa(cues, "a4", "adb", 0);
  const o1 = wa(cues, "a4", "device", 1) - 2;
  const c2 = wa(cues, "a4", "adb", 1);
  const o2 = wa(cues, "a4", "restarting") - 4;
  const cmd1 = typed("adb devices", f, c1, 22);
  const cmd2 = typed("adb tcpip 5555", f, c2, 28);
  const win = wa(cues, "a4", "windows");
  const mac = wa(cues, "a4", "mac");
  const Prompt = () => <span style={{ color: T.accent }}>platform-tools $ </span>;
  return (
    <>
      <Chapter n={4} total={5} label="GRABAR LAS DOS VOCES" f={f} />
      <WindowFrame x={50} y={340} w={900} h={560} title="platform-tools — bash">
        <div style={{ padding: "26px 28px", fontFamily: MONO, fontSize: 35, lineHeight: 1.7, color: "#d7e3de" }}>
          <div>
            <Prompt />
            {cmd1}
            {f < o1 && Math.floor(f / 8) % 2 === 0 ? "▍" : ""}
          </div>
          {f >= o1 ? (
            <div style={{ color: "#9fb4ad" }}>
              List of devices attached
              <br />
              <span style={{ color: T.ok, fontWeight: 700 }}>a1b2c3d4 &nbsp;&nbsp; device</span>
            </div>
          ) : null}
          {f >= c2 - 6 ? (
            <div style={{ marginTop: 14 }}>
              <Prompt />
              {cmd2}
              {f < o2 && Math.floor(f / 8) % 2 === 0 ? "▍" : ""}
            </div>
          ) : null}
          {f >= o2 ? <div style={{ color: T.ok, fontWeight: 700 }}>restarting in TCP mode port: 5555</div> : null}
        </div>
      </WindowFrame>
      <div style={{ position: "absolute", top: 940, left: 50, width: 900, display: "flex", gap: 18, fontFamily: FONT }}>
        {[
          { at: win, os: "Windows", cmd: ".\\adb devices" },
          { at: mac, os: "Mac / Linux", cmd: "./adb devices" },
        ].map((o) => {
          const a = appear(o.at - 2);
          return (
            <div key={o.os} style={{ flex: 1, background: T.surface, border: `2px solid ${T.accent}`, borderRadius: 22, padding: "16px 20px", opacity: Math.min(1, a), transform: `scale(${0.85 + 0.15 * Math.min(1, a)})` }}>
              <div style={{ fontSize: 24, color: T.ink2, fontWeight: 800 }}>{o.os}</div>
              <div style={{ fontFamily: MONO, fontSize: 32, fontWeight: 700, color: GOLD, marginTop: 6 }}>{o.cmd}</div>
            </div>
          );
        })}
      </div>
      <Captions f={f} cues={cues} y={CAP_FREE + 20} />
    </>
  );
};

// ======================= 4c · ADB: conectar en Acta =======================
const AdbConnect: React.FC<SP> = ({ f, cues }) => {
  const tConn = wa(cues, "a5", "conectar");
  const tAuth = tConn + 40;
  const tCheck = wa(cues, "a5", "permitir", 0) + 6;
  const tAllow = wa(cues, "a5", "permitir", 0) + 28;
  const tTest = wa(cues, "a5", "graba");
  const tOkMsg = wa(cues, "a5", "correcto") - 6;
  const tCable = wa(cues, "a5", "cable");
  const tWarn = cueAt(cues, "a6");
  const prog = interpolate(f, [tTest + 10, tOkMsg - 6], [0, 1], clamp);
  const connected = f >= tAllow + 6;
  const phase = f < tAuth ? 0 : f < tAllow + 6 ? 1 : f < tTest ? 2 : f < tOkMsg ? 3 : 4;
  return (
    <>
      <Chapter n={4} total={5} label="GRABAR LAS DOS VOCES" f={f} />
      <PhoneIn f={f} at={4}>
        <Screen>
          <AppBar title="Grabación de las dos voces" />
          <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: T.surface, border: `1.5px solid ${T.line}`, borderRadius: 24, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IcPlug size={36} />
                <div style={{ flex: 1, fontSize: 24, fontWeight: 800 }}>ADB propio</div>
                <Chip on={connected} label={connected ? "Conectado" : "Sin conectar"} />
              </div>
              <div style={{ fontSize: 17, color: T.ink2, lineHeight: 1.35, margin: "12px 0" }}>
                Una vez hecho desde el ordenador el comando «adb tcpip 5555» con el cable, pulsa Conectar.
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 2, background: T.surface2, borderRadius: 12, padding: "10px 14px", fontFamily: MONO, fontSize: 20 }}>127.0.0.1</div>
                <div style={{ flex: 1, background: T.surface2, borderRadius: 12, padding: "10px 14px", fontFamily: MONO, fontSize: 20 }}>5555</div>
              </div>
              <Btn label={connected ? "Reconectar" : "Conectar grabación completa"} pressed={f >= tConn && f < tConn + 6} size={21} />
            </div>
            {phase >= 3 ? (
              <div style={{ background: T.surface, border: `1.5px solid ${phase === 4 ? T.ok : T.accent}`, borderRadius: 24, padding: 20, opacity: ease(f, tTest, 10) }}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{phase === 4 ? "Prueba de grabación" : "Probando grabación por ADB…"}</div>
                <div style={{ position: "relative", height: 64, display: "flex", alignItems: "center", gap: 3 }}>
                  {Array.from({ length: 32 }, (_, i) => {
                    const on = i / 32 < prog;
                    const cut = i / 32 > 0.48 && i / 32 < 0.56;
                    return <div key={i} style={{ flex: 1, height: `${(cut ? 6 : 25 + 75 * Math.abs(Math.sin(i * 1.3) * Math.sin(i * 0.5 + 1))) * (phase === 4 ? 1 : 1)}%`, borderRadius: 2, background: cut ? RED : on ? T.accent : T.ink3 }} />;
                  })}
                </div>
                <div style={{ fontSize: 16, color: T.ink2, marginTop: 8 }}>{prog > 0.5 ? "✂ conexión cortada a mitad…" : "grabando 5 s…"}</div>
                {phase === 4 ? (
                  <div style={{ marginTop: 12, background: T.okSoft, border: `1.5px solid ${T.ok}`, borderRadius: 16, padding: "12px 14px", fontSize: 20, fontWeight: 800, color: T.ok, display: "flex", gap: 10, alignItems: "center" }}>
                    <IcCheck size={26} /> Todo correcto: la grabación sigue aunque se corte la conexión.
                  </div>
                ) : null}
              </div>
            ) : null}
            {f >= tWarn ? (
              <div style={{ background: "#33280f", border: `2px solid ${T.warn}`, borderRadius: 22, padding: "14px 18px", transform: `scale(${Math.min(1, pop(f, tWarn, 11))})` }}>
                <div style={{ color: T.warn, fontSize: 22, fontWeight: 900 }}>Si reinicias el móvil</div>
                <div style={{ fontSize: 18, color: T.ink, lineHeight: 1.35, marginTop: 4 }}>El puerto ADB se cierra. Repite en el ordenador:</div>
                <div style={{ fontFamily: MONO, fontSize: 20, color: GOLD, marginTop: 6 }}>adb devices · adb tcpip 5555</div>
              </div>
            ) : null}
            {f >= tCable && f < tWarn ? (
              <div style={{ background: T.okSoft, border: `2px solid ${T.ok}`, borderRadius: 22, padding: "16px 20px", fontSize: 26, fontWeight: 900, color: T.ok, textAlign: "center", transform: `scale(${Math.min(1, pop(f, tCable, 10))})` }}>
                ¡Listo! Ya puedes desconectar el cable.
              </div>
            ) : null}
          </div>
          <Tap f={f} at={tConn} x={238} y={470} />
          {phase === 1 ? (
            <Dialog
              title="¿Permitir depuración USB?"
              body="La huella digital de la clave RSA del equipo es: 4C:9E:A1:…"
              buttons={
                <>
                  <Btn kind="ghost" label="Cancelar" />
                  <Btn label="Permitir" pressed={f >= tAllow - 4} />
                </>
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, fontSize: 20, fontWeight: 700 }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, border: `3px solid ${T.accent}`, background: f >= tCheck ? T.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {f >= tCheck ? <IcCheck size={24} color={T.onAccent} /> : null}
                </div>
                Permitir siempre desde este ordenador
              </div>
            </Dialog>
          ) : null}
        </Screen>
      </PhoneIn>
      <Captions f={f} cues={cues} y={CAP_PHONE} />
    </>
  );
};

// ======================= 5a · Groq: crear la clave =======================
const GroqWeb: React.FC<SP> = ({ f, cues }) => {
  const tUrl = wa(cues, "g1", "entra");
  const tAcc = wa(cues, "g1", "cuenta");
  const tKeys = wa(cues, "g1", "keys");
  const tCreate = wa(cues, "g1", "create");
  const dash = f >= tKeys - 14;
  const modal = f >= tCreate + 6;
  return (
    <>
      <Chapter n={5} total={5} label="GROQ · IA GRATIS" f={f} />
      <WindowFrame x={40} y={330} w={920} h={760} title="" dark={false}>
        <div style={{ position: "absolute", top: -42, left: 120, right: 120, height: 34, borderRadius: 17, background: "#fff", border: "1px solid #d4d4d4", display: "flex", alignItems: "center", padding: "0 18px", fontFamily: FONT, fontSize: 22, color: "#333" }}>
          🔒 {typed("console.groq.com", f, tUrl, 22)}
        </div>
        {!dash ? (
          <div style={{ padding: "70px 120px", textAlign: "center", fontFamily: FONT, color: "#111" }}>
            <div style={{ fontSize: 46, fontWeight: 900 }}>Crea tu cuenta gratis</div>
            <div style={{ fontSize: 24, color: "#666", margin: "10px 0 40px" }}>Sin tarjeta · límite gratuito generoso</div>
            {[{ t: "Continuar con Google", at: tAcc }, { t: "Continuar con tu correo", at: tAcc + 14 }].map((b) => {
              const a = pop(f, b.at, 11);
              return (
                <div key={b.t} style={{ margin: "16px auto", width: 520, border: "2px solid #bbb", borderRadius: 14, padding: "20px 0", fontSize: 28, fontWeight: 800, opacity: Math.min(1, a), transform: `scale(${0.85 + 0.15 * Math.min(1, a)})` }}>
                  {b.t}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", height: "100%", fontFamily: FONT, color: "#111" }}>
            <div style={{ width: 240, background: "#f3f3f3", padding: "26px 20px", fontSize: 26, fontWeight: 700 }}>
              {["Playground", "API Keys", "Docs", "Ajustes"].map((m) => {
                const hot = m === "API Keys";
                return (
                  <div key={m} style={{ padding: "14px 16px", borderRadius: 12, marginBottom: 8, background: hot && f >= tKeys ? "#ffe9d6" : "transparent", border: hot && f >= tKeys ? "2px solid #f55036" : "2px solid transparent", color: hot && f >= tKeys ? "#c93a22" : "#444" }}>
                    {m}
                  </div>
                );
              })}
            </div>
            <div style={{ flex: 1, padding: "34px 36px" }}>
              <div style={{ fontSize: 40, fontWeight: 900 }}>API Keys</div>
              <div style={{ fontSize: 22, color: "#666", margin: "8px 0 34px" }}>Gestiona tus claves de API</div>
              <div style={{ display: "inline-block", background: "#f55036", color: "#fff", fontSize: 28, fontWeight: 900, padding: "18px 34px", borderRadius: 14, transform: `scale(${f >= tCreate && f < tCreate + 6 ? 0.94 : 1})` }}>+ Create API Key</div>
            </div>
          </div>
        )}
        {modal ? (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 520, background: "#fff", borderRadius: 20, padding: "30px 32px", fontFamily: FONT, color: "#111", transform: `scale(${Math.min(1, pop(f, tCreate + 6, 11))})` }}>
              <div style={{ fontSize: 32, fontWeight: 900 }}>Create API Key</div>
              <div style={{ fontSize: 20, color: "#666", margin: "14px 0 6px" }}>Display name</div>
              <div style={{ border: "2px solid #bbb", borderRadius: 12, padding: "14px 16px", fontSize: 26 }}>{typed("acta", f, tCreate + 14, 12)}</div>
              <div style={{ marginTop: 22, background: "#f55036", color: "#fff", textAlign: "center", borderRadius: 12, padding: "16px 0", fontSize: 26, fontWeight: 900 }}>Submit</div>
            </div>
          </div>
        ) : null}
      </WindowFrame>
      <Tap f={f} at={tAcc + 24} x={500} y={640} color="rgba(0,0,0,0.25)" />
      <Captions f={f} cues={cues} y={CAP_FREE + 60} />
    </>
  );
};

// ======================= 5b · Groq: pegar la clave en Acta =======================
const GroqApp: React.FC<SP> = ({ f, cues }) => {
  const tAct = wa(cues, "g2", "acta");
  const tPaste = wa(cues, "g2", "pegala");
  const tSave = wa(cues, "g2", "guardar");
  const tAuto = wa(cues, "g2", "automatico");
  const saved = f >= tSave + 8;
  const a = pop(f, 6, 12);
  if (f < tAct - 6)
    return (
      <>
        <Chapter n={5} total={5} label="GROQ · IA GRATIS" f={f} />
        <div style={{ position: "absolute", top: 400, left: 60, right: 140, fontFamily: FONT, opacity: Math.min(1, a), transform: `scale(${0.85 + 0.15 * Math.min(1, a)})` }}>
          <div style={{ background: T.surface, border: `3px solid ${GOLD}`, borderRadius: 30, padding: "30px 32px" }}>
            <div style={{ fontSize: 28, color: T.ink2, fontWeight: 800 }}>Tu clave de API</div>
            <div style={{ fontFamily: MONO, fontSize: 40, fontWeight: 800, color: GOLD, margin: "14px 0", wordBreak: "break-all" }}>gsk_9fA3k2LmQ7xZ…</div>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ background: T.accent, color: T.onAccent, fontWeight: 900, fontSize: 28, borderRadius: 14, padding: "12px 26px" }}>Copiar</div>
              <div style={{ fontSize: 26, color: "#ffb4ab", fontWeight: 800 }}>Solo se muestra una vez</div>
            </div>
          </div>
          <div style={{ marginTop: 30, display: "flex", gap: 20, transform: "scale(1.5)", transformOrigin: "left top" }}>
            <Chip label="Empieza por gsk_" on />
            <Chip label="Cópala ya" on />
          </div>
        </div>
        <Captions f={f} cues={cues} y={CAP_FREE} />
      </>
    );
  return (
    <>
      <Chapter n={5} total={5} label="GROQ · IA GRATIS" f={f} />
      <PhoneIn f={f} at={tAct - 6}>
        <Screen>
          <AppBar title="Ajustes" />
          <div style={{ padding: "0 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: T.surface, border: `1.5px solid ${saved ? T.ok : T.accent}`, borderRadius: 24, padding: 20 }}>
              <div style={{ fontSize: 24, fontWeight: 800 }}>Análisis con IA</div>
              <div style={{ fontSize: 17, color: T.ink2, margin: "8px 0 14px" }}>Clave de Groq (gratis en console.groq.com)</div>
              <div style={{ background: T.surface2, borderRadius: 14, padding: "14px 16px", fontFamily: MONO, fontSize: 20, color: f >= tPaste ? T.ink : T.ink3, border: `1.5px solid ${f >= tPaste ? T.accent : T.line}` }}>
                {f >= tPaste ? "gsk_9fA3k2LmQ7xZ…" : "Pega aquí tu clave (gsk_...)"}
              </div>
              <div style={{ marginTop: 14 }}>{saved ? <Btn kind="ok" label="Clave guardada" size={20} /> : <Btn label="Guardar" pressed={f >= tSave && f < tSave + 6} size={20} />}</div>
            </div>
            <div style={{ background: T.surface, border: `1.5px solid ${f >= tAuto + 10 ? T.accent : T.line}`, borderRadius: 24, padding: "18px 20px", display: "flex", alignItems: "center", gap: 14, opacity: ease(f, tAuto - 20, 10) }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 22, fontWeight: 800 }}>Análisis automático al colgar</div>
                <div style={{ fontSize: 16, color: T.ink2, marginTop: 4 }}>Las tareas aparecen solas tras cada llamada.</div>
              </div>
              <Toggle on={f >= tAuto + 10} />
            </div>
            {saved && f >= tAuto + 20 ? (
              <div style={{ background: T.accentSoft, border: `1.5px solid ${T.accent}`, borderRadius: 22, padding: "14px 18px", fontSize: 20, lineHeight: 1.35, transform: `scale(${Math.min(1, pop(f, tAuto + 20, 11))})` }}>
                <b style={{ color: T.accent }}>Resumen y tareas</b> de cada llamada, al colgar.
              </div>
            ) : null}
          </div>
          <Tap f={f} at={tSave} x={238} y={470} />
        </Screen>
      </PhoneIn>
      <Captions f={f} cues={cues} y={CAP_PHONE} />
    </>
  );
};

// ======================= Cierre de la parte 1 =======================
const End: React.FC<SP> = ({ f, cues }) => {
  const a = pop(f, 6, 11);
  const b = pop(f, wa(cues, "ee1", "parte"), 11);
  const c = pop(f, wa(cues, "ee1", "enlace"), 11);
  return (
    <>
      <div style={{ position: "absolute", top: 300, left: 0, right: 80, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT }}>
        <div style={{ transform: `scale(${0.6 + 0.4 * a})`, opacity: Math.min(1, a) }}>
          <AppIcon size={210} dotPulse={Math.abs(Math.sin(f / 9))} />
        </div>
        <div style={{ fontSize: 120, fontWeight: 900, color: T.ink, letterSpacing: -4, marginTop: 20, opacity: Math.min(1, a) }}>¡Listo!</div>
        <div style={{ marginTop: 40, background: T.surface, border: `3px solid ${T.accent}`, borderRadius: 30, padding: "24px 34px", textAlign: "center", opacity: Math.min(1, b), transform: `scale(${0.85 + 0.15 * Math.min(1, b)})` }}>
          <div style={{ fontSize: 34, color: T.accent, fontWeight: 900, letterSpacing: 2 }}>PARTE 2</div>
          <div style={{ fontSize: 50, fontWeight: 900, color: T.ink, lineHeight: 1.1 }}>Por qué es segura</div>
          <div style={{ fontSize: 50, fontWeight: 900, color: T.ink, lineHeight: 1.1 }}>y por qué es legal</div>
        </div>
        <div style={{ marginTop: 34, display: "flex", alignItems: "center", gap: 14, background: BLUE, color: "#07202f", fontWeight: 900, fontSize: 52, padding: "12px 28px", borderRadius: 20, opacity: Math.min(1, c), transform: `scale(${0.85 + 0.15 * Math.min(1, c)})` }}>
          <IcTelegram size={50} color="#07202f" /> t.me/actaapp
        </div>
      </div>
      <Captions f={f} cues={cues} y={CAP_FREE + 130} />
    </>
  );
};

const MAP: Record<string, React.FC<SP>> = {
  intro: Intro,
  download: Download,
  install: Install,
  perms: Perms,
  adbintro: AdbIntro,
  adbpc: AdbPc,
  adbconnect: AdbConnect,
  groqweb: GroqWeb,
  groqapp: GroqApp,
  end: End,
};

export const Tutorial1: React.FC = () => {
  const gf = useCurrentFrame();
  const i = Math.max(0, SCENES.findIndex((s) => gf >= s.start && gf < s.start + s.dur));
  const s = SCENES[i];
  const f = gf - s.start;
  const Cmp = MAP[s.name];
  const fadeIn = interpolate(f, [0, 8], [0, 1], clamp);
  const endFade = interpolate(gf, [TUTORIAL1_DURATION - 18, TUTORIAL1_DURATION], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: T.bg, opacity: endFade }}>
      <Audio src={staticFile("acta5/mix1.wav")} />
      <Bg glow={s.name.startsWith("groq") ? "rgba(245,80,54,0.12)" : "rgba(124,195,176,0.16)"} />
      <AbsoluteFill style={{ opacity: fadeIn }}>
        <Cmp f={f} cues={s.cues} dur={s.dur} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

