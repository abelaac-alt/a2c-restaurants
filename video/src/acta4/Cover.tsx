import React from "react";
import { AbsoluteFill } from "remotion";
import { AppIcon, FONT, T } from "../acta/theme";
import { Pedro } from "./Pedro";

// Portada del reel de humor (1080×1920). Lo esencial dentro del recorte 4:5 (y 285–1635).
const GOLD = "#ffcf5c";
const RED = "#ff5d4f";

export const PlatosCover: React.FC<{ guides?: boolean }> = ({ guides = false }) => (
  <AbsoluteFill style={{ background: T.bg, fontFamily: FONT, overflow: "hidden" }}>
    <AbsoluteFill style={{ background: "radial-gradient(80% 40% at 50% 30%, rgba(255,170,60,0.25) 0%, rgba(0,0,0,0) 70%)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(80% 45% at 50% 82%, rgba(124,195,176,0.25) 0%, rgba(0,0,0,0) 70%)" }} />

    <div style={{ position: "absolute", top: 310, left: 50, right: 50, display: "flex", justifyContent: "center" }}>
      <div style={{ background: "#fff", color: "#0b0b0b", fontWeight: 900, fontSize: 46, padding: "12px 26px", borderRadius: 14, transform: "rotate(-2deg)", textAlign: "center" }}>POV: tu novio jura que nunca dijo eso</div>
    </div>
    <div style={{ position: "absolute", top: 420, left: 40, right: 40, textAlign: "center", color: "#fff", fontSize: 100, fontWeight: 900, lineHeight: 0.98, letterSpacing: -4, textShadow: "0 8px 0 rgba(0,0,0,0.5)" }}>
      Prometió fregar <span style={{ color: GOLD }}>30 días</span>… y le dio <span style={{ color: RED }}>amnesia</span>
    </div>

    {/* Pedro inocente + «PALABRA.» */}
    <div style={{ position: "absolute", left: 90, top: 790, transform: "rotate(-6deg)" }}>
      <Pedro size={360} mood="innocent" gf={10} />
    </div>
    <div style={{ position: "absolute", left: 440, top: 860, transform: "rotate(8deg)", background: GOLD, color: "#111", fontWeight: 900, fontSize: 76, padding: "4px 30px", borderRadius: 20, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
      «PALABRA.»
    </div>

    {/* la tarea que le apuntó Acta */}
    <div style={{ position: "absolute", left: 90, right: 70, top: 1200, background: T.surface, border: `4px solid ${T.accent}`, borderRadius: 30, padding: "24px 28px", transform: "rotate(2deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 60px rgba(124,195,176,0.25)" }}>
      <div style={{ color: T.ink3, fontSize: 24, fontWeight: 800, letterSpacing: 1.5 }}>TAREA PENDIENTE · ACTA</div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, border: `4px solid ${T.accent}` }} />
        <div style={{ flex: 1, color: T.ink, fontSize: 50, fontWeight: 900, letterSpacing: -1 }}>Pedro friega los platos</div>
      </div>
      <div style={{ display: "inline-block", marginTop: 14, background: GOLD, color: "#111", fontSize: 34, fontWeight: 900, borderRadius: 12, padding: "4px 16px" }}>30 días</div>
    </div>

    <div style={{ position: "absolute", top: 1490, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ background: RED, color: "#fff", fontWeight: 900, fontSize: 54, padding: "10px 32px", borderRadius: 16, transform: "rotate(-2deg)" }}>Etiqueta a tu Pedro</div>
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
