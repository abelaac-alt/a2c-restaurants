import React from "react";
import { AbsoluteFill } from "remotion";
import timing from "./timing.json";
import { Cue, SH, SW, SummaryScreen } from "./screens";
import { AppIcon, FONT, IcSearch, IcSpark, T } from "./theme";

// Portada del reel (1080×1920). Lo esencial cabe en el recorte 4:5 central (y 285–1635) de la cuadrícula del perfil.
const summary = timing.scenes.find((s) => s.name === "summary")!;
const cues = summary.cues as Cue[];
const tapAt = cues[1].at + Math.round(cues[1].dur * 0.55);

const Badge: React.FC<{ x: number; y: number; rot: number; children: React.ReactNode; border: string; bg: string }> = ({
  x,
  y,
  rot,
  children,
  border,
  bg,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `rotate(${rot}deg)`,
      display: "flex",
      alignItems: "center",
      gap: 14,
      background: bg,
      border: `2px solid ${border}`,
      borderRadius: 26,
      padding: "18px 26px",
      color: T.ink,
      fontSize: 34,
      fontWeight: 700,
      boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

export const ActaCover: React.FC<{ guides?: boolean }> = ({ guides = false }) => {
  const scale = 0.9;
  const pw = (SW + 24) * scale;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(110% 70% at 50% 10%, #1d302b 0%, ${T.bg} 62%)`, fontFamily: FONT, overflow: "hidden" }}>
      {/* halos */}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 760,
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,195,176,0.28) 0%, rgba(124,195,176,0) 62%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 220,
          width: 560,
          height: 560,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(224,87,74,0.22) 0%, rgba(224,87,74,0) 62%)",
        }}
      />

      {/* marca */}
      <div style={{ position: "absolute", top: 320, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 20 }}>
        <AppIcon size={96} dotPulse={0.6} />
        <div style={{ fontSize: 76, fontWeight: 800, color: T.ink, letterSpacing: -2 }}>Acta</div>
      </div>

      {/* titular */}
      <div style={{ position: "absolute", top: 455, left: 50, right: 50, textAlign: "center", lineHeight: 0.98, letterSpacing: -5 }}>
        <div style={{ fontSize: 132, fontWeight: 900, color: T.ink }}>Tus llamadas,</div>
        <div style={{ fontSize: 132, fontWeight: 900, color: T.accent }}>con memoria.</div>
      </div>

      {/* móvil */}
      <div
        style={{
          position: "absolute",
          left: (1080 - pw) / 2 + 30,
          top: 770,
          width: SW + 24,
          height: SH + 24,
          transform: `scale(${scale}) rotate(-6deg)`,
          transformOrigin: "top left",
          borderRadius: 64,
          background: "#050605",
          border: "3px solid #3a403c",
          boxShadow: "0 80px 140px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,195,176,0.2)",
        }}
      >
        <div style={{ position: "absolute", left: 12, top: 12, width: SW, height: SH, borderRadius: 52, overflow: "hidden" }}>
          <SummaryScreen f={tapAt + 30} cues={cues} />
          <div style={{ position: "absolute", top: 14, left: SW / 2 - 14, width: 28, height: 28, borderRadius: 14, background: "#000" }} />
        </div>
      </div>

      {/* insignias flotantes */}
      <Badge x={50} y={880} rot={-5} border={T.rec} bg="#2a1614">
        <div style={{ width: 20, height: 20, borderRadius: 10, background: T.rec, boxShadow: `0 0 18px ${T.rec}` }} />
        Grabando
      </Badge>
      <Badge x={620} y={1080} rot={5} border={T.accent} bg={T.accentSoft}>
        <IcSpark size={36} />
        Resumen con IA
      </Badge>
      <Badge x={40} y={1390} rot={-4} border={T.cream} bg={T.surface2}>
        <IcSearch size={36} color={T.cream} />
        Busca lo que se dijo
      </Badge>

      {/* llamada a la acción (fuera del recorte de la cuadrícula, visible al abrir el reel) */}
      <div style={{ position: "absolute", top: 1680, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ background: T.accent, color: T.onAccent, fontSize: 40, fontWeight: 800, borderRadius: 50, padding: "20px 48px" }}>
          Mira cómo funciona ▶
        </div>
      </div>

      {guides ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 285, height: 1350, border: "4px dashed #ff00aa" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 1440, border: "3px dashed #ffee00" }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
