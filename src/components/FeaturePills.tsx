import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";

const pills = [
  { icon: "\ud83d\udce1", label: "Offline" },
  { icon: "\ud83c\udd93", label: "Bilaash" },
  { icon: "\ud83d\udd0a", label: "Cod" },
];

interface FeaturePillsProps {
  start: number; // frame to begin staggered fade-in
}

export const FeaturePills: React.FC<FeaturePillsProps> = ({ start }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
      {pills.map((pill, i) => {
        const opacity = interpolate(
          frame,
          [start + i * 10, start + i * 10 + 15],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const translateY = interpolate(
          frame,
          [start + i * 10, start + i * 10 + 15],
          [20, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        return (
          <div
            key={pill.label}
            style={{
              opacity,
              transform: `translateY(${translateY}px)`,
              background: EMERALD,
              color: "#fff",
              padding: "10px 24px",
              borderRadius: 9999,
              fontSize: 20,
              fontWeight: 700,
              fontFamily: "Plus Jakarta Sans, sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 22 }}>{pill.icon}</span>
            {pill.label}
          </div>
        );
      })}
    </div>
  );
};
