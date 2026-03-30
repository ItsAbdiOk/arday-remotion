import React from "react";
import type { WordEntry } from "../data/words";

const EMERALD = "#10b981";
const WHITE = "#ffffff";
const GREY = "#a8a29e";

interface WordCardProps {
  word: WordEntry;
  scale?: number;
}

export const WordCard: React.FC<WordCardProps> = ({ word, scale = 1 }) => {
  const s = (v: number) => v * scale;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: s(8),
        fontFamily: "Plus Jakarta Sans, sans-serif",
        width: "100%",
      }}
    >
      {/* English word */}
      <p
        style={{
          fontSize: s(100),
          fontWeight: 800,
          color: WHITE,
          lineHeight: 1.1,
          letterSpacing: -1,
        }}
      >
        {word.en}
      </p>

      {/* Somali translation */}
      <p
        style={{
          fontSize: s(50),
          fontWeight: 600,
          color: EMERALD,
          lineHeight: 1.2,
          marginTop: s(4),
        }}
      >
        {word.so}
      </p>

      {/* Word type */}
      <p
        style={{
          fontSize: s(22),
          fontWeight: 400,
          fontStyle: "italic",
          color: GREY,
          marginTop: s(2),
        }}
      >
        {word.type}
      </p>

      {/* Divider */}
      <div
        style={{
          width: "100%",
          height: s(2),
          background: EMERALD,
          marginTop: s(12),
          marginBottom: s(12),
        }}
      />

      {/* English sentence */}
      <p
        style={{
          fontSize: s(34),
          fontWeight: 500,
          color: WHITE,
          lineHeight: 1.5,
        }}
      >
        {word.sentenceEn}
      </p>

      {/* Somali sentence */}
      <p
        style={{
          fontSize: s(34),
          fontWeight: 500,
          color: GREY,
          lineHeight: 1.5,
          marginTop: s(4),
        }}
      >
        {word.sentenceSo}
      </p>
    </div>
  );
};
