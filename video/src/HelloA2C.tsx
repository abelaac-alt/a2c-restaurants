import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const HelloA2C: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame, fps, config: { damping: 12 } });
  const opacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#111", justifyContent: "center", alignItems: "center", fontFamily: "sans-serif" }}>
      <div style={{ color: "white", fontSize: 140, fontWeight: 800, transform: `scale(${scale})` }}>A2C</div>
      <div style={{ color: "#f5a623", fontSize: 56, marginTop: 24, opacity }}>Restaurants</div>
    </AbsoluteFill>
  );
};
