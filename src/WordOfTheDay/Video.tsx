import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { words, getSlug } from "../data/words";
import { getTrackById, DEFAULT_TRACK_ID } from "../data/music";

const BG = "#1c1917";
const EMERALD = "#10b981";
const WHITE = "#ffffff";
const GREY = "#a8a29e";

const FPS = 30;

function fadeIn(frame: number, start: number, duration: number = 15) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function slideUp(frame: number, fps: number, start: number) {
  return spring({ frame: frame - start, fps, config: { damping: 20, stiffness: 120 } });
}

export const WordOfTheDayVideo: React.FC<{
  index: number;
  hasAudio?: boolean;
  musicTrackId?: string;
}> = ({ index, hasAudio = true, musicTrackId = DEFAULT_TRACK_ID }) => {
  const word = words[index % words.length];
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slug = getSlug(word.en);
  const audioSrc = hasAudio ? staticFile(`audio/vocabulary/${slug}.mp3`) : null;
  const musicTrack = getTrackById(musicTrackId);

  // Timeline (10s / 300 frames at 30fps)
  const ardayFade = fadeIn(frame, 0, 15);                  // 0-0.5s
  const wordScale = slideUp(frame, fps, 15);               // 0.5s
  const translationSlide = slideUp(frame, fps, 45);        // 1.5s
  const typeFade = fadeIn(frame, 75, 15);                  // 2.5s
  const dividerWidth = interpolate(frame, [75, 90], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }); // 2.5-3s
  const sentenceEnFade = fadeIn(frame, 90, 20);            // 3s
  const sentenceSoFade = fadeIn(frame, 120, 20);           // 4s
  const ctaFade = fadeIn(frame, 240, 20);                  // 8s

  return (
    <AbsoluteFill
      style={{
        background: BG,
        padding: "120px 64px 220px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: "Plus Jakarta Sans, sans-serif",
      }}
    >
      {/* Background music — variant from A/B test */}
      <Audio src={staticFile(`music/${musicTrack.file}`)} volume={0.15} loop />

      {/* Vocabulary audio at 1.5s */}
      {audioSrc && (
        <Sequence from={45}>
          <Audio src={audioSrc} />
        </Sequence>
      )}

      {/* ARDAY header */}
      <p
        style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: EMERALD,
          textAlign: "center",
          opacity: ardayFade,
        }}
      >
        ARDAY
      </p>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
        {/* English word */}
        <p
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: WHITE,
            lineHeight: 1.1,
            letterSpacing: -1,
            transform: `scale(${wordScale})`,
            transformOrigin: "left center",
          }}
        >
          {word.en}
        </p>

        {/* Somali translation */}
        <p
          style={{
            fontSize: 56,
            fontWeight: 600,
            color: EMERALD,
            lineHeight: 1.2,
            marginTop: 8,
            transform: `translateY(${(1 - translationSlide) * 30}px)`,
            opacity: translationSlide,
          }}
        >
          {word.so}
        </p>

        {/* Word type */}
        <p
          style={{
            fontSize: 24,
            fontWeight: 400,
            fontStyle: "italic",
            color: GREY,
            marginTop: 4,
            opacity: typeFade,
          }}
        >
          {word.type}
        </p>

        {/* Divider */}
        <div
          style={{
            width: `${dividerWidth}%`,
            height: 2,
            background: EMERALD,
            marginTop: 20,
            marginBottom: 20,
          }}
        />

        {/* English sentence */}
        <p
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: WHITE,
            lineHeight: 1.5,
            opacity: sentenceEnFade,
          }}
        >
          {word.sentenceEn}
        </p>

        {/* Somali sentence */}
        <p
          style={{
            fontSize: 36,
            fontWeight: 500,
            color: GREY,
            lineHeight: 1.5,
            marginTop: 8,
            opacity: sentenceSoFade,
          }}
        >
          {word.sentenceSo}
        </p>
      </div>

      {/* Footer CTA */}
      <div style={{ textAlign: "center", opacity: ctaFade }}>
        <p
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: EMERALD,
            marginBottom: 8,
          }}
        >
          Bilow — Waa bilaash
        </p>
        <p style={{ fontSize: 24, fontWeight: 400, color: GREY }}>
          arday-nine.vercel.app
        </p>
      </div>
    </AbsoluteFill>
  );
};
