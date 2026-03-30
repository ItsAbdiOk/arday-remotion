import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";

interface AudioWaveformProps {
  start: number; // frame to begin animating
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ start, barCount = 18 }) => {
  const frame = useCurrentFrame();

  const heights = [20, 35, 15, 45, 25, 50, 30, 55, 20, 40, 18, 48, 22, 38, 28, 52, 15, 42];

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 60 }}>
      {Array.from({ length: barCount }).map((_, i) => {
        const barProgress = interpolate(
          frame,
          [start + i * 3, start + i * 3 + 15],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const h = heights[i % heights.length] * barProgress;
        const isFilled = frame >= start + i * 3;

        return (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              borderRadius: 2,
              background: isFilled ? EMERALD : "#44403c",
              transition: "height 0.1s",
            }}
          />
        );
      })}
    </div>
  );
};
