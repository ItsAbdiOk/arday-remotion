import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface AnimatedCounterProps {
  target: number;
  start: number; // frame to start animating
  color?: string;
  fontSize?: number;
  format?: boolean; // add commas
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  start,
  color = "#ffffff",
  fontSize = 96,
  format = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: Math.max(0, frame - start),
    fps,
    config: { damping: 30, stiffness: 80 },
  });

  const value = Math.round(interpolate(progress, [0, 1], [0, target]));
  const display = format ? value.toLocaleString() : String(value);

  return (
    <p
      style={{
        fontSize,
        fontWeight: 800,
        color,
        fontVariantNumeric: "tabular-nums",
        fontFamily: "Plus Jakarta Sans, sans-serif",
        lineHeight: 1.1,
      }}
    >
      {display}
    </p>
  );
};
