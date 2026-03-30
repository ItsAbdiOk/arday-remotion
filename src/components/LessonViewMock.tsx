import React from "react";
import { ProgressBarMock } from "./ProgressBarMock";
import { QuestionView } from "./QuestionView";
import { XPPopupAnim } from "./XPPopupAnim";

const FONT = "Plus Jakarta Sans, sans-serif";
const EMERALD = "#10b981";
const WHITE = "#ffffff";
const GREY = "#a8a29e";

interface LessonViewMockProps {
  start: number;
}

export const LessonViewMock: React.FC<LessonViewMockProps> = ({ start }) => {
  return (
    <div style={{ fontFamily: FONT, padding: "24px 0", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "0 24px", marginBottom: 16 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: EMERALD, marginBottom: 8 }}>
          Cashar 3 — Cunto & cabbitaan
        </p>
        <ProgressBarMock progress={0.3} animateFrom={start} label="3 / 10" />
      </div>

      {/* Question */}
      <QuestionView
        question="My name ___ Ahmed."
        options={["is", "am", "are"]}
        selectedIndex={0}
        correctIndex={0}
        selectAt={start + 40}
        showCorrectAt={start + 70}
      />

      {/* XP Popup */}
      <XPPopupAnim start={start + 80} amount={10} />
    </div>
  );
};
