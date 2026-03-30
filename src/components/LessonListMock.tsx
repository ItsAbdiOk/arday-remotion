import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";
const EMERALD_LIGHT = "#d1fae5";
const WHITE = "#ffffff";
const GREY = "#a8a29e";
const FONT = "Plus Jakarta Sans, sans-serif";

interface LessonListMockProps {
  start: number;
}

const lessons = [
  { title: "Salaanta", subtitle: "Salaan & hadalka", status: "completed" as const },
  { title: "Qoysadka", subtitle: "Xubinta qoyska", status: "completed" as const },
  { title: "Cuntada", subtitle: "Cunto & cabbitaan", status: "current" as const },
  { title: "Lacagta", subtitle: "Wax iibsashada", status: "locked" as const },
];

const levels = ["Bilowga", "Dhexe", "Sare"];

export const LessonListMock: React.FC<LessonListMockProps> = ({ start }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ fontFamily: FONT, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <p style={{ fontSize: 28, fontWeight: 800, color: WHITE }}>Casharrada</p>

      {/* Level pills */}
      <div style={{ display: "flex", gap: 8 }}>
        {levels.map((level, i) => (
          <div
            key={level}
            style={{
              padding: "6px 16px",
              borderRadius: 9999,
              background: i === 0 ? EMERALD : "#292524",
              color: i === 0 ? WHITE : GREY,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {level}
          </div>
        ))}
      </div>

      {/* Lesson cards */}
      {lessons.map((lesson, i) => {
        const cardOpacity = interpolate(
          frame,
          [start + i * 8, start + i * 8 + 12],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const cardSlide = interpolate(
          frame,
          [start + i * 8, start + i * 8 + 12],
          [20, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );

        const isCompleted = lesson.status === "completed";
        const isCurrent = lesson.status === "current";
        const isLocked = lesson.status === "locked";

        return (
          <div
            key={lesson.title}
            style={{
              opacity: cardOpacity * (isLocked ? 0.5 : 1),
              transform: `translateY(${cardSlide}px)`,
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 16px",
              borderRadius: 14,
              border: `1.5px solid ${isCurrent ? EMERALD : "#44403c"}`,
              background: isCurrent ? "rgba(16,185,129,0.08)" : "#292524",
              boxShadow: "0 2px 8px rgba(28,25,23,0.06)",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isLocked ? "#44403c" : EMERALD_LIGHT,
                color: isLocked ? GREY : EMERALD,
                fontSize: 20,
              }}
            >
              {isLocked ? "\ud83d\udd12" : "\ud83d\udcd6"}
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 15, fontWeight: 600, color: WHITE }}>{lesson.title}</p>
              <p style={{ fontSize: 12, color: GREY }}>{lesson.subtitle}</p>
            </div>

            {/* Status */}
            {isCompleted && (
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 9999,
                  background: EMERALD_LIGHT,
                  color: EMERALD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {"\u2713"}
              </div>
            )}
            {isCurrent && (
              <svg width={24} height={24} viewBox="0 0 24 24" style={{ transform: "rotate(-90deg)" }}>
                <circle cx={12} cy={12} r={10} fill="none" stroke="#44403c" strokeWidth={2.5} />
                <circle
                  cx={12}
                  cy={12}
                  r={10}
                  fill="none"
                  stroke={EMERALD}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeDasharray={62.8}
                  strokeDashoffset={62.8 * 0.7}
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
};
