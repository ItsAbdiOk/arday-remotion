import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";

interface ProgressBarMockProps {
  progress: number; // 0-1
  animateFrom?: number; // frame to start fill animation
  label?: string; // e.g. "3 / 10"
}

export const ProgressBarMock: React.FC<ProgressBarMockProps> = ({
  progress,
  animateFrom,
  label,
}) => {
  const frame = useCurrentFrame();

  const fillWidth =
    animateFrom !== undefined
      ? interpolate(frame, [animateFrom, animateFrom + 30], [0, progress * 100], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : progress * 100;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          flex: 1,
          height: 10,
          background: "#292524",
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${fillWidth}%`,
            height: "100%",
            borderRadius: 9999,
            background: `linear-gradient(90deg, ${EMERALD}, #34d399)`,
            boxShadow: fillWidth > 0 ? `0 0 12px rgba(16,185,129,0.4)` : "none",
          }}
        />
      </div>
      {label && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#78716c",
            fontVariantNumeric: "tabular-nums",
            fontFamily: "Plus Jakarta Sans, sans-serif",
            minWidth: 36,
            textAlign: "right" as const,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
