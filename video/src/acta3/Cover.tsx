import React from "react";
import { AbsoluteFill } from "remotion";
import { AppIcon, Avatar, FONT, T } from "../acta/theme";

// Portada del reel «el casero y la fianza» (1080×1920). Lo esencial dentro del recorte 4:5 (y 285–1635).
const RED = "#ff5d4f";
const GOLD = "#ffcf5c";

export const CaseroCover: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill style={{ background: T.bg, fontFamily: FONT, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(80% 40% at 50% 28%, rgba(170,45,35,0.4) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(80% 45% at 50% 82%, rgba(124,195,176,0.28) 0%, rgba(0,0,0,0) 70%)" }} />

    <div style={{ position: "absolute", top: 310, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", color: "#0b0b0b", fontWeight: 900, fontSize: 44, padding: "10px 26px", borderRadius: 14, transform: "rotate(-2deg)", letterSpacing: 1 }}>STORYTIME</div>
    </div>
    <div style={{ position: "absolute", top: 400, left: 50, right: 50, textAlign: "center", color: "#fff", fontSize: 104, fontWeight: 900, lineHeight: 0.98, letterSpacing: -4, textShadow: "0 8px 0 rgba(0,0,0,0.5)" }}>
      Mi casero quiso quedarse mi <span style={{ color: RED }}>fianza</span>
    </div>

    {/* la fianza: retenida → devuelta */}
    <div style={{ position: "absolute", left: 110, top: 760, width: 560, background: "#fbfaf6", borderRadius: 20, padding: "24px 30px", transform: "rotate(-5deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", color: "#111" }}>
      <div style={{ fontSize: 22, color: "#777", fontWeight: 700, letterSpacing: 2 }}>FIANZA</div>
      <div style={{ fontSize: 120, fontWeight: 900, letterSpacing: -5 }}>1.200 €</div>
      <div style={{ position: "absolute", right: -40, top: 18, transform: "rotate(-10deg)", border: `6px solid ${RED}`, color: RED, fontWeight: 900, fontSize: 40, padding: "2px 14px", borderRadius: 10, background: "rgba(251,250,246,0.9)", textDecoration: "line-through" }}>
        RETENIDA
      </div>
      <div style={{ position: "absolute", right: -80, bottom: -30, transform: "rotate(-14deg)", border: `7px solid ${T.call}`, color: T.call, fontWeight: 900, fontSize: 64, padding: "2px 20px", borderRadius: 12, background: "rgba(251,250,246,0.95)" }}>
        DEVUELTA
      </div>
    </div>

    {/* la prueba */}
    <div style={{ position: "absolute", left: 90, right: 70, top: 1080, background: T.surface, border: `4px solid ${T.accent}`, borderRadius: 34, padding: "24px 28px", transform: "rotate(3deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 60px rgba(124,195,176,0.25)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Avatar size={64} initials="M" bg={T.av2bg} fg={T.av2fg} />
        <div style={{ flex: 1 }}>
          <div style={{ color: T.ink, fontSize: 30, fontWeight: 700 }}>Manolo (casero)</div>
          <div style={{ color: T.ink2, fontSize: 24 }}>hace 1 año</div>
        </div>
        <div style={{ background: T.accent, color: T.onAccent, fontSize: 40, fontWeight: 900, borderRadius: 14, padding: "6px 16px" }}>01:42</div>
      </div>
      <div style={{ color: T.ink, fontSize: 48, fontWeight: 800, lineHeight: 1.12, marginTop: 16, letterSpacing: -1 }}>
        «Sí, mujer, <span style={{ color: T.onAccent, background: T.accent, borderRadius: 10, padding: "0 10px" }}>pinta el salón</span> del color que quieras»
      </div>
    </div>

    <div style={{ position: "absolute", top: 1480, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: GOLD, color: "#111", fontWeight: 900, fontSize: 48, padding: "12px 30px", borderRadius: 16, transform: "rotate(-2deg)" }}>No se lo esperaba…</div>
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
