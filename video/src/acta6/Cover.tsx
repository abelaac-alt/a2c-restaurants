import React from "react";
import { AbsoluteFill } from "remotion";
import { AppIcon, IcPhone, T } from "../acta/theme";
import { FONT } from "../acta5/ui";

// Portada del reel «14 llamadas perdidas» (1080×1920). Lo esencial dentro del recorte 4:5 (y 285–1635).
export const AcosoCover: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill style={{ background: "#04070a", fontFamily: FONT, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(90% 50% at 50% 38%, rgba(70,105,185,0.3) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(90% 50% at 50% 70%, rgba(190,35,30,0.28) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)" }} />

    <div style={{ position: "absolute", top: 305, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", color: "#0b0b0b", fontWeight: 900, fontSize: 44, padding: "10px 26px", borderRadius: 14, transform: "rotate(-2deg)", letterSpacing: 1 }}>STORYTIME</div>
    </div>

    <div style={{ position: "absolute", top: 400, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 40, color: "#9aa7ba", fontWeight: 700 }}>martes 14 de octubre</div>
      <div style={{ fontSize: 250, fontWeight: 300, color: "#f3f6fb", letterSpacing: -10, lineHeight: 1, textShadow: "0 0 80px rgba(120,160,255,0.35)" }}>23:47</div>
    </div>

    <div style={{ position: "absolute", top: 760, left: 70, right: 70, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, background: "rgba(60,20,20,0.95)", border: "3px solid #a3322c", borderRadius: 30, padding: "26px 30px", transform: "rotate(-1.5deg)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ width: 84, height: 84, borderRadius: 42, background: "#5a1f1c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <IcPhone size={46} color="#ff8b80" />
        </div>
        <div>
          <div style={{ fontSize: 66, fontWeight: 900, color: "#ffb4ab", lineHeight: 1 }}>14 llamadas perdidas</div>
          <div style={{ fontSize: 40, color: "#e0b4af", fontWeight: 700, marginTop: 6 }}>Andrés (Jefe)</div>
        </div>
      </div>
      <div style={{ alignSelf: "flex-start", background: "rgba(36,42,54,0.95)", borderRadius: "26px 26px 26px 8px", padding: "20px 30px", fontSize: 46, fontWeight: 800, color: "#eaf0f8", transform: "rotate(1deg)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>Coge el teléfono</div>
      <div style={{ alignSelf: "flex-start", background: "rgba(36,42,54,0.95)", borderRadius: "26px 26px 26px 8px", padding: "20px 30px", fontSize: 46, fontWeight: 800, color: "#eaf0f8", transform: "rotate(-0.5deg)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>Mañana a las 8 el informe. Sin excusas.</div>
    </div>

    <div style={{ position: "absolute", top: 1290, left: 50, right: 50, textAlign: "center", lineHeight: 1.02, letterSpacing: -3, textShadow: "0 8px 0 rgba(0,0,0,0.6)" }}>
      <div style={{ fontSize: 80, fontWeight: 900, color: "#fff", whiteSpace: "nowrap" }}>Lo que grabé esa noche</div>
      <div style={{ fontSize: 92, fontWeight: 900, color: T.accent }}>lo cambió todo</div>
    </div>

    <div style={{ position: "absolute", top: 1700, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
      <AppIcon size={80} dotPulse={0.6} />
      <div style={{ fontSize: 60, fontWeight: 800, color: T.ink, letterSpacing: -2 }}>Acta</div>
    </div>
    {guides ? (
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: 285, height: 1350, border: "4px dashed #ff00aa" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 1440, border: "3px dashed #ffee00" }} />
      </>
    ) : null}
  </AbsoluteFill>
);

