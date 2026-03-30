import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";

interface ChatBubbleProps {
  side: "left" | "right";
  name?: string;
  en: string;
  so: string;
  start: number; // frame to appear
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ side, name, en, so, start }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [start, start + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(frame, [start, start + 12], [side === "left" ? -30 : 30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const isRight = side === "right";

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: isRight ? "flex-end" : "flex-start",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {name && (
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#78716c",
            marginBottom: 4,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {name}
        </span>
      )}
      <div
        style={{
          background: isRight ? EMERALD : "#292524",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: isRight ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
          maxWidth: "80%",
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>{en}</p>
        <p style={{ fontSize: 12, color: isRight ? "rgba(255,255,255,0.7)" : "#a8a29e", marginTop: 4 }}>
          {so}
        </p>
      </div>
    </div>
  );
};
