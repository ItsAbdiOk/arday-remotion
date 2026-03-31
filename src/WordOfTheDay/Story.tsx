import React from "react";
import { AbsoluteFill } from "remotion";
import { ArdayHeader, ArdayFooter } from "../components/ArdayBranding";
import { WordCard } from "../components/WordCard";
import { words } from "../data/words";

const BG = "#1c1917";

export const WordOfTheDayStory: React.FC<{ index: number }> = ({ index }) => {
  const word = words[index % words.length];

  return (
    <AbsoluteFill
      style={{
        background: BG,
        padding: "250px 100px 320px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      <ArdayHeader />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <WordCard word={word} scale={0.6} />
      </div>
      <ArdayFooter />
    </AbsoluteFill>
  );
};
