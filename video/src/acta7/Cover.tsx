import React from "react";
import { AbsoluteFill } from "remotion";
import { AppIcon, IcPlay, T } from "../acta/theme";
import { FONT } from "../acta5/ui";

// Portada del reel «Me dijeron que era gratis» (1080×1920). Lo esencial dentro del recorte 4:5 (y 285–1635).
const RED = "#ff5d4f";
export const GratisCover: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill style={{ background: "#05080c", fontFamily: FONT, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(90% 45% at 50% 33%, rgba(190,35,30,0.34) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(90% 45% at 50% 78%, rgba(124,195,176,0.26) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(120% 90% at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.65) 100%)" }} />

    <div style={{ position: "absolute", top: 305, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", color: "#0b0b0b", fontWeight: 900, fontSize: 44, padding: "10px 26px", borderRadius: 14, transform: "rotate(-2deg)", letterSpacing: 1 }}>STORYTIME</div>
    </div>

    <div style={{ position: "absolute", top: 410, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ display: "inline-block", fontSize: 290, fontWeight: 900, color: RED, letterSpacing: -12, lineHeight: 1, transform: "rotate(-4deg)", textShadow: "0 12px 0 rgba(0,0,0,0.55), 0 0 90px rgba(255,93,79,0.4)" }}>−312 €</div>
    </div>

    <div style={{ position: "absolute", top: 800, left: 60, right: 60, textAlign: "center", lineHeight: 1.0, letterSpacing: -3, textShadow: "0 8px 0 rgba(0,0,0,0.6)" }}>
      <div style={{ fontSize: 92, fontWeight: 900, color: "#fff" }}>«Es gratis,</div>
      <div style={{ fontSize: 92, fontWeight: 900, color: "#fff" }}>te lo digo yo»</div>
    </div>

    <div style={{ position: "absolute", top: 1110, left: 90, right: 90, display: "flex", alignItems: "center", gap: 22, background: "rgba(18,48,31,0.96)", border: `4px solid ${T.accent}`, borderRadius: 34, padding: "26px 34px", transform: "rotate(1.8deg)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
      <div style={{ width: 96, height: 96, borderRadius: 48, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <IcPlay size={50} />
      </div>
      <div>
        <div style={{ fontSize: 66, fontWeight: 900, color: "#fff", lineHeight: 1 }}>Lo tenía grabado</div>
        <div style={{ fontSize: 36, color: "#9fd9b5", fontWeight: 700, marginTop: 6 }}>Jorge (Comercial) · 01:48</div>
      </div>
    </div>

    <div style={{ position: "absolute", top: 1440, left: 0, right: 0, textAlign: "center", fontSize: 54, fontWeight: 900, color: T.accent, letterSpacing: -1 }}>
      Mira cómo recuperé mi dinero
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
