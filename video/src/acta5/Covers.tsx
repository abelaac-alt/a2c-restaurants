import React from "react";
import { AbsoluteFill } from "remotion";
import { AppIcon, IcCheck, IcShield } from "../acta/theme";
import { BLUE, FONT, GOLD, IcFolder, IcScale, IcTelegram, IcTerm, IcX, RED, T } from "./ui";

// Portadas 1080×1920. Lo esencial dentro del recorte 4:5 de la cuadrícula del perfil (y 285–1635).
const Guides: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 285, height: 1350, border: "4px dashed #ff00aa" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 1440, border: "3px dashed #ffee00" }} />
  </>
);
const Tag: React.FC<{ children: React.ReactNode; bg?: string; color?: string; rot?: number; size?: number }> = ({ children, bg = "#fff", color = "#0b0b0b", rot = -2, size = 46 }) => (
  <div style={{ background: bg, color, fontWeight: 900, fontSize: size, padding: "10px 26px", borderRadius: 14, transform: `rotate(${rot}deg)`, letterSpacing: 1, display: "inline-block" }}>{children}</div>
);
const Brand: React.FC = () => (
  <div style={{ position: "absolute", top: 1700, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
    <AppIcon size={80} dotPulse={0.6} />
    <div style={{ fontSize: 60, fontWeight: 800, color: T.ink, letterSpacing: -2 }}>Acta</div>
  </div>
);

// ---------- Parte 1: instalar y configurar ----------
export const TutorialCover1: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  const steps = [
    { n: "1", t: "Descarga por Telegram", icon: <IcTelegram size={46} color={BLUE} /> },
    { n: "2", t: "Instala la APK", icon: <IcFolder size={46} /> },
    { n: "3", t: "Concede los permisos", icon: <IcCheck size={46} /> },
    { n: "4", t: "Graba las dos voces (ADB)", icon: <IcTerm size={46} /> },
    { n: "5", t: "Conecta Groq: IA gratis", icon: <IcShield size={46} /> },
  ];
  return (
    <AbsoluteFill style={{ background: T.bg, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(80% 40% at 50% 30%, rgba(124,195,176,0.3) 0%, rgba(0,0,0,0) 70%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(80% 40% at 50% 85%, rgba(106,179,243,0.18) 0%, rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", top: 305, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
        <Tag bg={T.accent} color={T.onAccent}>PARTE 1</Tag>
        <Tag>PASO A PASO</Tag>
      </div>
      <div style={{ position: "absolute", top: 410, left: 40, right: 40, textAlign: "center", lineHeight: 0.96, letterSpacing: -5, textShadow: "0 8px 0 rgba(0,0,0,0.5)" }}>
        <div style={{ color: "#fff", fontSize: 128, fontWeight: 900 }}>Instala Acta</div>
        <div style={{ color: T.accent, fontSize: 112, fontWeight: 900 }}>en 5 minutos</div>
      </div>
      <div style={{ position: "absolute", top: 790, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 20 }}>
        {steps.map((s, i) => (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 20, background: T.surface, border: `2px solid ${i === 3 ? T.accent : T.line}`, borderRadius: 26, padding: "22px 26px", transform: `translateX(${[0, 18, -8, 14, 0][i]}px)`, boxShadow: i === 3 ? "0 0 50px rgba(124,195,176,0.3)" : "none" }}>
            <div style={{ width: 56, height: 56, borderRadius: 28, background: T.accent, color: T.onAccent, fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.n}</div>
            <div style={{ flex: 1, fontSize: 46, fontWeight: 800, color: T.ink }}>{s.t}</div>
            {s.icon}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 1500, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: BLUE, color: "#07202f", fontWeight: 900, fontSize: 50, padding: "12px 30px", borderRadius: 20, transform: "rotate(-2deg)" }}>
          <IcTelegram size={50} color="#07202f" /> t.me/actaapp
        </div>
      </div>
      <Brand />
      {guides ? <Guides /> : null}
    </AbsoluteFill>
  );
};

// ---------- Parte 2: seguridad y legalidad ----------
export const TutorialCover2: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill style={{ background: T.bg, fontFamily: FONT, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(80% 35% at 50% 28%, rgba(111,211,154,0.25) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(80% 35% at 50% 72%, rgba(255,207,92,0.2) 0%, rgba(0,0,0,0) 70%)" }} />
    <div style={{ position: "absolute", top: 305, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16 }}>
      <Tag bg={T.accent} color={T.onAccent}>PARTE 2</Tag>
      <Tag>LA VERDAD</Tag>
    </div>
    <div style={{ position: "absolute", top: 430, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 26 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, background: T.okSoft, border: `5px solid ${T.ok}`, borderRadius: 40, padding: "20px 36px", transform: "rotate(-2.5deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.55)" }}>
        <IcShield size={150} color={T.ok} />
        <div style={{ fontSize: 124, fontWeight: 900, color: "#fff", letterSpacing: -4 }}>¿SEGURA?</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 26, background: "#33280f", border: `5px solid ${GOLD}`, borderRadius: 40, padding: "20px 36px", transform: "rotate(2.5deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.55)" }}>
        <IcScale size={150} color={GOLD} />
        <div style={{ fontSize: 124, fontWeight: 900, color: "#fff", letterSpacing: -4 }}>¿LEGAL?</div>
      </div>
    </div>
    <div style={{ position: "absolute", top: 1030, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 20 }}>
      {[
        { ok: true, t: "Cifrado AES-256 en tu móvil" },
        { ok: true, t: "Grabar tus llamadas en España" },
        { ok: false, t: "Grabar a otros sin participar" },
      ].map((r) => (
        <div key={r.t} style={{ display: "flex", alignItems: "center", gap: 18, background: r.ok ? T.okSoft : "#2a1412", border: `3px solid ${r.ok ? T.ok : RED}`, borderRadius: 26, padding: "22px 28px" }}>
          {r.ok ? <IcCheck size={58} /> : <IcX size={58} />}
          <div style={{ fontSize: 48, fontWeight: 800, color: T.ink }}>{r.t}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", top: 1520, left: 0, right: 0, textAlign: "center", fontSize: 34, color: T.ink3, fontWeight: 700 }}>
      Información general · no es asesoramiento jurídico
    </div>
    <Brand />
    {guides ? <Guides /> : null}
  </AbsoluteFill>
);
