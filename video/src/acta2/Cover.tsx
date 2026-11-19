import React from "react";
import { AbsoluteFill } from "remotion";
import { AppIcon, FONT, IcPhone, T } from "../acta/theme";

// Portada del reel «historia» (1080×1920). Lo esencial dentro del recorte 4:5 (y 285–1635).
const RED = "#ff5d4f";

export const StoryCover: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill style={{ background: T.bg, fontFamily: FONT, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(80% 45% at 50% 30%, rgba(170,45,35,0.35) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(80% 45% at 50% 80%, rgba(124,195,176,0.25) 0%, rgba(0,0,0,0) 70%)" }} />

    {/* lo que te dicen */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 320, transform: "rotate(-3deg)" }}>
      <div style={{ background: "#2a1412", border: `5px solid ${RED}`, borderRadius: "44px 44px 44px 8px", padding: "30px 36px", boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
        <div style={{ color: "#ffb4ab", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Atención al cliente</div>
        <div style={{ color: "#fff", fontSize: 92, fontWeight: 900, lineHeight: 0.98, letterSpacing: -3 }}>«Nosotros nunca le dijimos eso»</div>
      </div>
    </div>

    {/* factura */}
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 770,
        width: 600,
        background: "#fbfaf6",
        borderRadius: 18,
        padding: "26px 30px",
        transform: "rotate(-6deg)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        color: "#222",
      }}
    >
      <div style={{ fontSize: 22, color: "#777", fontWeight: 700, letterSpacing: 2 }}>FACTURA · MARZO</div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 36, fontWeight: 600, marginTop: 16, position: "relative" }}>
        <span>Instalación</span>
        <span style={{ textDecoration: "line-through" }}>49,90 €</span>
        <svg width="620" height="110" style={{ position: "absolute", left: -40, top: -30, overflow: "visible" }}>
          <ellipse cx="300" cy="50" rx="300" ry="46" fill="none" stroke={RED} strokeWidth="6" transform="rotate(-2 300 50)" />
        </svg>
      </div>
      <div
        style={{
          position: "absolute",
          right: -70,
          top: -70,
          transform: "rotate(-12deg)",
          border: `7px solid ${T.call}`,
          color: T.call,
          fontWeight: 900,
          fontSize: 64,
          padding: "2px 22px",
          borderRadius: 12,
          background: "rgba(251,250,246,0.95)",
        }}
      >
        ANULADO
      </div>
    </div>

    {/* la prueba en Acta */}
    <div
      style={{
        position: "absolute",
        left: 120,
        right: 60,
        top: 1010,
        background: T.surface,
        border: `4px solid ${T.accent}`,
        borderRadius: 34,
        padding: "26px 30px",
        transform: "rotate(3deg)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 60px rgba(124,195,176,0.25)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 60, height: 60, borderRadius: 30, background: T.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcPhone size={32} color={T.accent} />
        </div>
        <div style={{ flex: 1, color: T.ink2, fontSize: 28 }}>12 mar · 11:04</div>
        <div style={{ background: T.accent, color: T.onAccent, fontSize: 40, fontWeight: 900, borderRadius: 14, padding: "6px 16px" }}>03:27</div>
      </div>
      <div style={{ color: T.ink, fontSize: 50, fontWeight: 800, lineHeight: 1.12, marginTop: 18, letterSpacing: -1 }}>
        «La instalación es totalmente{" "}
        <span style={{ color: T.onAccent, background: T.accent, borderRadius: 10, padding: "0 10px" }}>gratis</span>»
      </div>
    </div>

    {/* remate */}
    <div style={{ position: "absolute", left: 60, right: 60, top: 1390, textAlign: "center", fontSize: 88, fontWeight: 900, color: "#fff", letterSpacing: -3, lineHeight: 1, textShadow: "0 8px 0 rgba(0,0,0,0.5)" }}>
      Minuto 03:27:<br /><span style={{ color: T.accent }}>sí lo dijeron.</span>
    </div>

    {/* marca y llamada a la acción, fuera del recorte */}
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
