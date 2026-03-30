import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";
const EMERALD_LIGHT = "#d1fae5";
const WHITE = "#ffffff";
const GREY = "#a8a29e";
const AMBER = "#f59e0b";
const FONT = "Plus Jakarta Sans, sans-serif";

interface SpacedRepMockProps {
  start: number;
}

export const SpacedRepMock: React.FC<SpacedRepMockProps> = ({ start }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [start, start + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const answerOpacity = interpolate(frame, [start + 30, start + 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ fontFamily: FONT, padding: 24, opacity, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header with badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            background: AMBER,
            color: WHITE,
            padding: "6px 14px",
            borderRadius: 9999,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          Dib u eeg
        </div>
        <p style={{ fontSize: 14, color: GREY }}>Ku celi erayada</p>
      </div>

      {/* Question */}
      <div
        style={{
          background: "#292524",
          borderRadius: 16,
          padding: 24,
          border: "1.5px solid #44403c",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: GREY, textTransform: "uppercase", marginBottom: 12 }}>
          Buuxi meesha banaan
        </p>
        <p style={{ fontSize: 22, fontWeight: 700, color: WHITE, lineHeight: 1.4 }}>
          Can I have <span style={{ color: EMERALD, borderBottom: `2px solid ${EMERALD}` }}>___</span>, please?
        </p>
        <p style={{ fontSize: 14, color: GREY, marginTop: 8 }}>Ma heli karaa biyo, fadlan?</p>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 20 }}>
          {["water", "coffee", "tea"].map((opt, i) => {
            const isCorrect = i === 0;
            const showAnswer = answerOpacity > 0.5;

            return (
              <div
                key={opt}
                style={{
                  padding: "12px 16px",
                  borderRadius: 12,
                  border: `2px solid ${showAnswer && isCorrect ? EMERALD : "#44403c"}`,
                  background: showAnswer && isCorrect ? EMERALD_LIGHT : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 9999,
                    background: showAnswer && isCorrect ? EMERALD : "#44403c",
                    color: WHITE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {showAnswer && isCorrect ? "\u2713" : String.fromCharCode(65 + i)}
                </div>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: showAnswer && isCorrect ? "#1c1917" : WHITE,
                  }}
                >
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
