import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const EMERALD = "#10b981";

interface XPPopupAnimProps {
  amount?: number;
  start: number; // frame to appear
}

export const XPPopupAnim: React.FC<XPPopupAnimProps> = ({ amount = 10, start }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < start) return null;

  const elapsed = frame - start;
  const duration = 36; // ~1.2s at 30fps

  const scale = spring({
    frame: elapsed,
    fps,
    config: { damping: 15, stiffness: 200 },
  });

  const translateY = interpolate(elapsed, [0, duration], [0, -60], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(elapsed, [0, 6, duration - 10, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: "50%",
        transform: `translate(-50%, ${translateY}px) scale(${scale})`,
        opacity,
        zIndex: 50,
      }}
    >
      <span
        style={{
          display: "inline-block",
          padding: "8px 24px",
          borderRadius: 9999,
          background: EMERALD,
          color: "#fff",
          fontSize: 20,
          fontWeight: 700,
          fontFamily: "Plus Jakarta Sans, sans-serif",
          boxShadow: "0 2px 12px rgba(16,185,129,0.4)",
        }}
      >
        +{amount} XP
      </span>
    </div>
  );
};
