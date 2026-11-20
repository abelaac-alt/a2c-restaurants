import React from "react";
import { interpolate } from "remotion";
import {
  Avatar,
  FONT,
  IcBack,
  IcBookmark,
  IcCal,
  IcCheck,
  IcFinger,
  IcHangup,
  IcKeypad,
  IcLock,
  IcMicOff,
  IcPause,
  IcPhone,
  IcPlay,
  IcSearch,
  IcShield,
  IcSpark,
  IcSpeaker,
  T,
  Tap,
  ease,
  pop,
} from "./theme";

export const SW = 476; // ancho de la pantalla del móvil
export const SH = 976;

export type Cue = { id: string; at: number; dur: number; text: string };
export type ScreenProps = { f: number; cues: Cue[] };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const Screen: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg = T.bg }) => (
  <div style={{ position: "absolute", inset: 0, background: bg, fontFamily: FONT, color: T.ink, overflow: "hidden" }}>
    {children}
  </div>
);
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 22, padding: 20, ...style }}>{children}</div>
);
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ color: T.ink3, fontSize: 15, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>{children}</div>
);
const Toast: React.FC<{ show: number; children: React.ReactNode }> = ({ show, children }) => (
  <div
    style={{
      position: "absolute",
      left: 24,
      right: 24,
      bottom: 40,
      background: T.okSoft,
      border: `1px solid ${T.ok}`,
      color: T.ink,
      borderRadius: 18,
      padding: "16px 18px",
      fontSize: 19,
      fontWeight: 600,
      display: "flex",
      gap: 12,
      alignItems: "center",
      opacity: show,
      transform: `translateY(${(1 - show) * 40}px)`,
    }}
  >
    <IcCheck size={26} />
    {children}
  </div>
);

// barras de onda deterministas
const bars = (n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7 + seed) * Math.sin(i * 0.43 + seed * 2)));

// ---------- Llamada en curso: grabando las dos voces ----------
export const RecordScreen: React.FC<ScreenProps> = ({ f }) => {
  const secs = 38 + Math.floor(f / 30);
  const who = Math.floor(f / 40) % 2; // 0: Laura habla, 1: tú
  const markAt = 95;
  const toast = ease(f, markAt + 4, 10) * (1 - ease(f, markAt + 60, 10));
  const level = (row: number, i: number) => {
    const talking = row === who;
    const v = Math.abs(Math.sin(f * 0.45 + i * 0.9 + row * 3) * Math.sin(f * 0.21 + i * 0.37));
    return talking ? 0.2 + 0.8 * v : 0.08 + 0.1 * v;
  };
  const Btn: React.FC<{ icon: React.ReactNode; label: string; active?: boolean }> = ({ icon, label, active }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 100 }}>
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: 38,
          background: active ? T.accent : T.surface2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div style={{ fontSize: 15, color: T.ink2, textAlign: "center", lineHeight: 1.2 }}>{label}</div>
    </div>
  );
  const marked = f >= markAt;
  return (
    <Screen bg={`linear-gradient(180deg, ${T.bg2} 0%, ${T.bg} 70%)`}>
      <div style={{ textAlign: "center", marginTop: 70, color: T.ink2, fontSize: 18 }}>Llamada en curso</div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
        <Avatar size={140} initials="LG" />
      </div>
      <div style={{ textAlign: "center", fontSize: 34, fontWeight: 700, marginTop: 20 }}>Laura Gómez</div>
      <div style={{ textAlign: "center", fontSize: 22, color: T.ink2, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
        {String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(224,87,74,0.14)",
            border: `1px solid ${T.rec}`,
            borderRadius: 30,
            padding: "10px 18px",
            fontSize: 19,
            fontWeight: 700,
            color: "#ffb4ab",
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: 6, background: T.rec, opacity: 0.4 + 0.6 * Math.abs(Math.cos(f / 9)) }} />
          Grabando · ambas voces
        </div>
      </div>
      {/* ondas de las dos voces */}
      <div style={{ margin: "34px 30px 0", display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { name: "Laura", color: T.accent },
          { name: "Tú", color: T.cream },
        ].map((r, row) => (
          <div key={row} style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 60, fontSize: 16, color: T.ink2, fontWeight: 600 }}>{r.name}</div>
            <div style={{ flex: 1, height: 52, display: "flex", alignItems: "center", gap: 4 }}>
              {Array.from({ length: 26 }, (_, i) => (
                <div key={i} style={{ flex: 1, height: `${level(row, i) * 100}%`, background: r.color, borderRadius: 3, opacity: 0.9 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", margin: "44px 24px 0" }}>
        <Btn icon={<IcMicOff size={32} />} label="Silenciar" />
        <Btn icon={<IcSpeaker size={32} />} label="Altavoz" />
        <Btn icon={<IcBookmark size={32} color={marked ? T.onAccent : T.ink} />} label="Marcar momento" active={marked} />
        <Btn icon={<IcKeypad size={30} />} label="Teclado" />
      </div>
      <Tap f={f} at={markAt} x={298} y={668} />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
        <div style={{ width: 92, height: 92, borderRadius: 46, background: "#d6453a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcHangup size={44} />
        </div>
      </div>
      <Toast show={toast}>Momento marcado en el 00:41</Toast>
    </Screen>
  );
};

// ---------- Ficha de la llamada: resumen y tareas con IA ----------
const SUMMARY =
  "Laura confirma el presupuesto de 4.800 € para la reforma de la cocina. La obra empieza el lunes 9 si el contrato se firma antes del viernes.";
const TASKS = [
  { t: "Enviar el contrato firmado", when: "Viernes" },
  { t: "Transferir la señal de 1.200 €", when: "Esta semana" },
  { t: "Confirmar inicio de obra", when: "Lun 9" },
];

export const SummaryScreen: React.FC<ScreenProps> = ({ f, cues }) => {
  const [c0, c1] = cues;
  const typed = Math.floor(interpolate(f, [c0.at + 6, c0.at + c0.dur * 0.75], [0, SUMMARY.length], clamp));
  const taskAt = (i: number) => c0.at + Math.round(c0.dur * 0.62) + i * 15;
  const tapAt = c1.at + Math.round(c1.dur * 0.55);
  const added = f >= tapAt + 4;
  const toast = ease(f, tapAt + 6, 10);
  return (
    <Screen>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "62px 24px 0" }}>
        <IcBack size={30} />
        <Avatar size={56} initials="LG" />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>Laura Gómez</div>
          <div style={{ fontSize: 16, color: T.ink2, marginTop: 2 }}>Hoy · 10:42 · 6 min</div>
        </div>
      </div>
      <div style={{ padding: "22px 20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card style={{ display: "flex", alignItems: "center", gap: 14, padding: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IcPlay size={24} />
          </div>
          <div style={{ flex: 1, height: 36, display: "flex", alignItems: "center", gap: 3 }}>
            {bars(34, 1).map((v, i) => (
              <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: 2, background: i < 9 ? T.accent : T.ink3 }} />
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <IcSpark size={20} />
            <Label>Resumen</Label>
          </div>
          <div style={{ fontSize: 19, lineHeight: 1.42, minHeight: 135 }}>
            {SUMMARY.slice(0, typed)}
            {typed < SUMMARY.length && f > c0.at ? <span style={{ color: T.accent }}>▍</span> : null}
          </div>
        </Card>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <Label>Tareas acordadas</Label>
            <div style={{ fontSize: 15, color: T.accent, fontWeight: 700, opacity: ease(f, taskAt(2), 10) }}>3 nuevas</div>
          </div>
          {TASKS.map((tk, i) => {
            const a = pop(f, taskAt(i), 14);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderTop: i ? `1px solid ${T.line}` : "none",
                  opacity: Math.min(1, a),
                  transform: `translateX(${(1 - a) * 30}px)`,
                }}
              >
                <div style={{ width: 26, height: 26, borderRadius: 8, border: `2px solid ${T.accent}`, flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 19, fontWeight: 600 }}>{tk.t}</div>
                <div style={{ fontSize: 14, color: T.warn, background: "#33280f", borderRadius: 10, padding: "4px 10px", fontWeight: 700 }}>
                  {tk.when}
                </div>
              </div>
            );
          })}
        </Card>
        <div
          style={{
            background: added ? T.okSoft : T.accent,
            color: added ? T.ok : T.onAccent,
            border: added ? `1px solid ${T.ok}` : "none",
            borderRadius: 18,
            padding: "18px 0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            fontSize: 21,
            fontWeight: 700,
            transform: `scale(${1 - 0.05 * ease(f, tapAt - 3, 3) * (1 - ease(f, tapAt + 1, 5))})`,
            opacity: ease(f, taskAt(2) + 6, 10),
          }}
        >
          {added ? <IcCheck size={26} /> : <IcCal size={26} />}
          {added ? "Añadidas al calendario" : "Añadir al calendario"}
        </div>
      </div>
      <Tap f={f} at={tapAt} x={238} y={778} />
      <Toast show={toast * (1 - ease(f, tapAt + 75, 10))}>3 tareas en tu calendario</Toast>
    </Screen>
  );
};

// ---------- Búsqueda por lo que se habló ----------
const QUERY = "presupuesto";
export const SearchScreen: React.FC<ScreenProps> = ({ f, cues }) => {
  const [c0] = cues;
  const typeStart = c0.at + Math.round(c0.dur * 0.2);
  const typed = Math.floor(interpolate(f, [typeStart, typeStart + 26], [0, QUERY.length], clamp));
  const results = ease(f, typeStart + 30, 12);
  const tapAt = c0.at + Math.round(c0.dur * 0.72);
  const sheet = ease(f, tapAt + 4, 14);
  const head = interpolate(f, [tapAt + 14, tapAt + 30], [0.08, 0.36], clamp);
  const playing = f > tapAt + 30;
  const Hit: React.FC<{ before: string; after: string }> = ({ before, after }) => (
    <span>
      {before}
      <span style={{ background: "rgba(124,195,176,0.28)", color: T.accent, borderRadius: 4, padding: "0 3px", fontWeight: 700 }}>presupuesto</span>
      {after}
    </span>
  );
  const Result: React.FC<{ name: string; ini: string; when: string; time: string; children: React.ReactNode; bg?: string; fg?: string }> = ({
    name,
    ini,
    when,
    time,
    children,
    bg,
    fg,
  }) => (
    <Card style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar size={44} initials={ini} bg={bg} fg={fg} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{name}</div>
          <div style={{ fontSize: 14, color: T.ink3 }}>{when}</div>
        </div>
        <div style={{ fontSize: 15, color: T.accent, fontWeight: 700, background: T.accentSoft, borderRadius: 10, padding: "4px 10px" }}>
          {time}
        </div>
      </div>
      <div style={{ fontSize: 17, lineHeight: 1.4, color: T.ink2, marginTop: 12 }}>{children}</div>
    </Card>
  );
  return (
    <Screen>
      <div style={{ padding: "64px 20px 0" }}>
        <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 18 }}>Buscar</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: T.surface2,
            borderRadius: 18,
            padding: "16px 18px",
            border: `1.5px solid ${typed ? T.accent : T.line}`,
          }}
        >
          <IcSearch size={26} />
          <div style={{ fontSize: 22, color: typed ? T.ink : T.ink3 }}>
            {typed ? QUERY.slice(0, typed) : "Buscar en lo que se habló"}
            {f > typeStart - 10 && f < typeStart + 40 && Math.floor(f / 8) % 2 === 0 ? <span style={{ color: T.accent }}>|</span> : null}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 20, opacity: results, transform: `translateY(${(1 - results) * 20}px)` }}>
          <div style={{ fontSize: 15, color: T.ink3 }}>2 llamadas</div>
          <Result name="Laura Gómez" ini="LG" when="Hoy · 10:42" time="02:14">
            <Hit before="«…el " after=" final queda en 4.800 €, con todo incluido…»" />
          </Result>
          <Result name="Taller Ruiz" ini="TR" when="Lunes · 18:05" time="05:31" bg={T.av2bg} fg={T.av2fg}>
            <Hit before="«…te paso el " after=" del cambio de ruedas…»" />
          </Result>
        </div>
      </div>
      <Tap f={f} at={tapAt} x={238} y={380} />
      {/* reproductor que salta al momento exacto */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 430,
          background: T.surface,
          borderTop: `1px solid ${T.line}`,
          borderRadius: "28px 28px 0 0",
          padding: "26px 22px",
          transform: `translateY(${(1 - sheet) * 460}px)`,
        }}
      >
        <div style={{ width: 50, height: 5, borderRadius: 3, background: T.line, margin: "0 auto 18px" }} />
        <div style={{ fontSize: 22, fontWeight: 700 }}>Laura Gómez</div>
        <div style={{ fontSize: 16, color: T.ink2, marginTop: 4 }}>Saltando al 02:14</div>
        <div style={{ position: "relative", height: 60, display: "flex", alignItems: "center", gap: 3, marginTop: 22 }}>
          {bars(40, 3).map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${v * 100}%`, borderRadius: 2, background: i / 40 < head ? T.accent : T.ink3 }} />
          ))}
          <div style={{ position: "absolute", left: `${head * 100}%`, top: -8, bottom: -8, width: 3, background: T.cream, borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 22 }}>
          <div style={{ width: 58, height: 58, borderRadius: 29, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {playing ? <IcPause size={28} /> : <IcPlay size={28} />}
          </div>
          <div style={{ fontSize: 18, lineHeight: 1.4, color: T.ink }}>
            «El <span style={{ color: T.accent, fontWeight: 700 }}>presupuesto</span> final queda en 4.800 euros.»
          </div>
        </div>
      </div>
    </Screen>
  );
};

// ---------- Llamada entrante con el contexto de la última conversación ----------
export const ContextScreen: React.FC<ScreenProps> = ({ f, cues }) => {
  const [c0] = cues;
  const card = pop(f, c0.at + Math.round(c0.dur * 0.35), 15);
  const ring = (k: number) => ((f + k * 20) % 60) / 60;
  return (
    <Screen bg={`linear-gradient(180deg, #1b2b27 0%, ${T.bg} 75%)`}>
      <div style={{ textAlign: "center", marginTop: 80, color: T.ink2, fontSize: 19 }}>Llamada entrante · Móvil</div>
      <div style={{ position: "relative", display: "flex", justifyContent: "center", marginTop: 40, height: 150 }}>
        {[0, 1, 2].map((k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              top: 75 - (75 + 70 * ring(k)),
              width: 150 + 140 * ring(k),
              height: 150 + 140 * ring(k),
              borderRadius: "50%",
              border: `2px solid ${T.accent}`,
              opacity: 0.6 * (1 - ring(k)),
            }}
          />
        ))}
        <Avatar size={150} initials="LG" />
      </div>
      <div style={{ textAlign: "center", fontSize: 36, fontWeight: 700, marginTop: 26 }}>Laura Gómez</div>
      <div
        style={{
          margin: "36px 22px 0",
          background: "rgba(24,28,26,0.92)",
          border: `1px solid ${T.accent}`,
          borderRadius: 24,
          padding: 22,
          opacity: Math.min(1, card),
          transform: `translateY(${(1 - card) * 60}px) scale(${0.94 + 0.06 * card})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IcSpark size={20} />
          <Label>La última vez hablasteis de</Label>
        </div>
        <div style={{ fontSize: 21, lineHeight: 1.4, marginTop: 12, fontWeight: 600 }}>
          Presupuesto de la reforma: 4.800 €. La obra empieza el lunes 9.
        </div>
        <div style={{ height: 1, background: T.line, margin: "16px 0" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${T.warn}` }} />
          <div style={{ fontSize: 18, color: T.ink2 }}>
            Pendiente: <span style={{ color: T.ink, fontWeight: 600 }}>enviar el contrato firmado</span>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "space-around" }}>
        <div style={{ width: 96, height: 96, borderRadius: 48, background: "#d6453a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcHangup size={46} />
        </div>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: T.call,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${1 + 0.08 * Math.abs(Math.sin(f / 8))})`,
          }}
        >
          <IcPhone size={46} color="#fff" />
        </div>
      </div>
    </Screen>
  );
};

// ---------- Privacidad: cifrado y huella ----------
export const PrivacyScreen: React.FC<ScreenProps> = ({ f, cues }) => {
  const [c0] = cues;
  const scanStart = c0.at + 5;
  const scan = interpolate(f, [scanStart, scanStart + 40], [0, 1], clamp);
  const done = f > scanStart + 44;
  const chips = ["Solo en tu móvil", "Cifrado AES-256", "Huella o PIN"];
  return (
    <Screen>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 110 }}>
        <div style={{ position: "relative", width: 150, height: 150 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <IcShield size={150} />
          </div>
          <div style={{ position: "absolute", left: 45, top: 40 }}>
            <IcLock size={60} />
          </div>
        </div>
        <div style={{ fontSize: 30, fontWeight: 800, marginTop: 24 }}>Grabaciones protegidas</div>
        <div style={{ fontSize: 19, color: T.ink2, marginTop: 10, textAlign: "center", padding: "0 40px", lineHeight: 1.4 }}>
          Usa tu huella para abrir tus llamadas
        </div>
        <div
          style={{
            marginTop: 50,
            width: 150,
            height: 150,
            borderRadius: 75,
            background: done ? T.okSoft : T.accentSoft,
            border: `2px solid ${done ? T.ok : T.accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {done ? <IcCheck size={80} /> : <IcFinger size={92} progress={scan} />}
          {!done && scan > 0 && scan < 1 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: `${scan * 100}%`, height: 3, background: T.accent, boxShadow: `0 0 18px ${T.accent}` }} />
          ) : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 50, width: SW - 80 }}>
          {chips.map((c, i) => {
            const a = pop(f, scanStart + 48 + i * 10, 14);
            return (
              <div
                key={c}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: T.surface,
                  border: `1px solid ${T.line}`,
                  borderRadius: 16,
                  padding: "14px 18px",
                  fontSize: 20,
                  fontWeight: 600,
                  opacity: Math.min(1, a),
                  transform: `translateY(${(1 - a) * 20}px)`,
                }}
              >
                <IcCheck size={24} />
                {c}
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
};
