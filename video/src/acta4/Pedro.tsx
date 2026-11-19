import React from "react";
import { FONT, T } from "../acta/theme";

const GOLD = "#ffcf5c";

// ---------- Pedro, en dibujo ----------
export type Mood = "cocky" | "innocent" | "busted" | "sad";
export const Pedro: React.FC<{ size: number; mood: Mood; gf: number; gloves?: boolean }> = ({ size, mood, gf, gloves }) => {
  const blink = gf % 70 < 3;
  const eyeY = mood === "innocent" ? 86 : 96;
  const lookUp = mood === "innocent" ? -6 : 0;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: "block", overflow: "visible" }}>
      {mood === "innocent" ? <ellipse cx="100" cy="18" rx="52" ry="12" fill="none" stroke={GOLD} strokeWidth="7" opacity={0.9} /> : null}
      <circle cx="100" cy="110" r="78" fill="#f0c49a" />
      <path d="M26 98 C26 40 70 22 104 24 C150 26 178 56 176 100 C160 70 120 62 92 64 C66 66 40 76 26 98 Z" fill="#3b2a20" />
      <ellipse cx="24" cy="112" rx="10" ry="16" fill="#e8b88c" />
      <ellipse cx="176" cy="112" rx="10" ry="16" fill="#e8b88c" />
      {/* cejas */}
      {mood === "cocky" ? (
        <>
          <path d="M58 80 L86 74" stroke="#3b2a20" strokeWidth="7" strokeLinecap="round" />
          <path d="M114 68 L144 62" stroke="#3b2a20" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : mood === "sad" ? (
        <>
          <path d="M60 76 L86 84" stroke="#3b2a20" strokeWidth="7" strokeLinecap="round" />
          <path d="M140 76 L114 84" stroke="#3b2a20" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M58 72 Q72 64 86 72" stroke="#3b2a20" strokeWidth="7" fill="none" strokeLinecap="round" />
          <path d="M114 72 Q128 64 142 72" stroke="#3b2a20" strokeWidth="7" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* ojos */}
      {blink ? (
        <>
          <path d="M60 98 L84 98" stroke="#222" strokeWidth="6" strokeLinecap="round" />
          <path d="M116 98 L140 98" stroke="#222" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="72" cy={eyeY} rx={mood === "busted" ? 15 : 12} ry={mood === "busted" ? 17 : mood === "cocky" ? 8 : 13} fill="#fff" />
          <ellipse cx="128" cy={eyeY} rx={mood === "busted" ? 15 : 12} ry={mood === "busted" ? 17 : mood === "cocky" ? 8 : 13} fill="#fff" />
          <circle cx={mood === "cocky" ? 76 : 72} cy={eyeY + lookUp} r={mood === "busted" ? 5 : 6.5} fill="#222" />
          <circle cx={mood === "cocky" ? 132 : 128} cy={eyeY + lookUp} r={mood === "busted" ? 5 : 6.5} fill="#222" />
        </>
      )}
      {/* boca */}
      {mood === "cocky" ? <path d="M74 140 Q110 158 134 132" stroke="#7a3b26" strokeWidth="7" fill="none" strokeLinecap="round" /> : null}
      {mood === "innocent" ? <circle cx="112" cy="142" r="8" fill="#7a3b26" /> : null}
      {mood === "busted" ? <path d="M80 146 Q100 136 120 146 Q100 150 80 146 Z" fill="#7a3b26" stroke="#7a3b26" strokeWidth="4" /> : null}
      {mood === "sad" ? <path d="M76 150 Q100 132 124 150" stroke="#7a3b26" strokeWidth="7" fill="none" strokeLinecap="round" /> : null}
      {mood === "innocent" ? <text x="138" y="150" fontSize="26" fill={T.ink2} fontFamily={FONT}>♪</text> : null}
      {mood === "busted" || mood === "sad" ? <path d="M160 70 Q168 86 160 92 Q152 86 160 70 Z" fill="#8fd3ff" /> : null}
      {mood === "cocky" ? <ellipse cx="62" cy="122" rx="12" ry="7" fill="#ea9d84" opacity={0.6} /> : null}
      {gloves ? (
        <>
          <ellipse cx="34" cy="196" rx="26" ry="34" fill={GOLD} />
          <ellipse cx="166" cy="196" rx="26" ry="34" fill={GOLD} />
        </>
      ) : null}
    </svg>
  );
};

