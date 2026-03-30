import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";
const EMERALD_LIGHT = "#d1fae5";
const WHITE = "#ffffff";
const GREY = "#a8a29e";
const AMBER = "#f59e0b";
const FONT = "Plus Jakarta Sans, sans-serif";

interface DashboardMockProps {
  start: number;
}

export const DashboardMock: React.FC<DashboardMockProps> = ({ start }) => {
  const frame = useCurrentFrame();

  const slideUp = interpolate(frame, [start, start + 20], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(frame, [start, start + 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const stats = [
    { label: "XP", value: "1,240", color: EMERALD },
    { label: "Erayg", value: "156", color: WHITE },
    { label: "Cashar", value: "12", color: WHITE },
    { label: "Streak", value: "3", color: AMBER, icon: "\ud83d\udd25" },
  ];

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideUp}px)`,
        fontFamily: FONT,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p style={{ fontSize: 32, fontWeight: 800, color: WHITE }}>Arday</p>
          <p style={{ fontSize: 16, color: GREY }}>Ku soo dhawoow!</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#292524",
            padding: "8px 14px",
            borderRadius: 9999,
          }}
        >
          <span style={{ fontSize: 20 }}>{"\ud83d\udd25"}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: AMBER }}>3</span>
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {stats.map((stat, i) => {
          const cardOpacity = interpolate(
            frame,
            [start + 10 + i * 5, start + 20 + i * 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={stat.label}
              style={{
                opacity: cardOpacity,
                background: "#292524",
                borderRadius: 14,
                padding: "16px 18px",
                border: "1.5px solid #44403c",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 600, color: GREY, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {stat.label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginTop: 4 }}>
                {stat.icon ? `${stat.icon} ${stat.value}` : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Nudge card */}
      <div
        style={{
          background: `linear-gradient(135deg, ${EMERALD}, #059669)`,
          borderRadius: 16,
          padding: "20px 24px",
          opacity: interpolate(frame, [start + 30, start + 40], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 700, color: WHITE }}>Bilow casharka 1</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 }}>
          Salaanta — Salaan
        </p>
        <div
          style={{
            marginTop: 12,
            display: "inline-block",
            background: WHITE,
            padding: "8px 20px",
            borderRadius: 9999,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>{"Bilow \u2192"}</p>
        </div>
      </div>
    </div>
  );
};
