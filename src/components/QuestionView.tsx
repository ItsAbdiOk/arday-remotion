import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

const EMERALD = "#10b981";
const EMERALD_LIGHT = "#d1fae5";
const WHITE = "#ffffff";
const GREY = "#a8a29e";
const DARK = "#1c1917";

interface QuestionViewProps {
  instruction?: string;
  question: string;
  blank?: string; // the blank word highlighted in green
  options: string[];
  selectedIndex?: number; // which option is selected (-1 for none)
  correctIndex?: number; // which is correct (for green highlight)
  selectAt?: number; // frame when selection animates
  showCorrectAt?: number; // frame when correct highlights
}

export const QuestionView: React.FC<QuestionViewProps> = ({
  instruction = "DOORO JAWAABTA SAXDA AH",
  question,
  blank = "___",
  options,
  selectedIndex = -1,
  correctIndex = 0,
  selectAt = 0,
  showCorrectAt,
}) => {
  const frame = useCurrentFrame();

  const isSelected = selectAt !== undefined && frame >= selectAt;
  const isCorrect = showCorrectAt !== undefined && frame >= showCorrectAt;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        padding: "24px 20px",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {/* Instruction */}
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: GREY,
        }}
      >
        {instruction}
      </p>

      {/* Question with blank */}
      <p style={{ fontSize: 26, fontWeight: 700, color: WHITE, lineHeight: 1.4 }}>
        {question.split(blank).map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <span
                style={{
                  color: EMERALD,
                  borderBottom: `3px solid ${EMERALD}`,
                  paddingBottom: 2,
                }}
              >
                {isCorrect && selectedIndex >= 0 ? options[selectedIndex] : blank}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
        {options.map((opt, i) => {
          const isThisSelected = isSelected && i === selectedIndex;
          const isThisCorrect = isCorrect && i === correctIndex;
          const optionDelay = selectAt + i * 5;
          const optionOpacity = interpolate(
            frame,
            [optionDelay - 15, optionDelay],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          let bg = "#292524";
          let border = "2px solid #44403c";
          if (isThisCorrect) {
            bg = EMERALD_LIGHT;
            border = `2px solid ${EMERALD}`;
          } else if (isThisSelected) {
            bg = "#292524";
            border = `2px solid ${EMERALD}`;
          }

          const label = String.fromCharCode(65 + i); // A, B, C

          return (
            <div
              key={i}
              style={{
                opacity: optionOpacity,
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderRadius: 14,
                background: bg,
                border,
                transition: "all 0.2s",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isThisCorrect ? EMERALD : isThisSelected ? EMERALD : "#44403c",
                  color: isThisCorrect || isThisSelected ? WHITE : GREY,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {isThisCorrect ? "\u2713" : label}
              </div>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: isThisCorrect ? DARK : WHITE,
                }}
              >
                {opt}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
