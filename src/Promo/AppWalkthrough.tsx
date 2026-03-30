import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  interpolate,
  useCurrentFrame,
  staticFile,
} from "remotion";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { DashboardMock } from "../components/DashboardMock";
import { LessonListMock } from "../components/LessonListMock";
import { LessonViewMock } from "../components/LessonViewMock";
import { AudioWaveform } from "../components/AudioWaveform";
import { ConversationMock } from "../components/ConversationMock";
import { SpacedRepMock } from "../components/SpacedRepMock";

const BG = "#1c1917";
const EMERALD = "#10b981";
const WHITE = "#ffffff";
const GREY = "#a8a29e";
const FONT = "Plus Jakarta Sans, sans-serif";

function fadeIn(frame: number, start: number, duration = 15) {
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function fadeOut(frame: number, start: number, duration = 10) {
  return interpolate(frame, [start, start + duration], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

function sceneOpacity(frame: number, sceneStart: number, sceneEnd: number) {
  const fadeInVal = fadeIn(frame, sceneStart, 15);
  const fadeOutVal = frame >= sceneEnd - 10 ? fadeOut(frame, sceneEnd - 10, 10) : 1;
  if (frame < sceneStart || frame > sceneEnd) return 0;
  return fadeInVal * fadeOutVal;
}

const SCALE = 1.4;

const ScaledScene: React.FC<{
  children: React.ReactNode;
  opacity: number;
}> = ({ children, opacity }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity,
      overflow: "hidden",
      paddingBottom: 220,
    }}
  >
    <div
      style={{
        width: 1080 / SCALE,
        transform: `scale(${SCALE})`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  </div>
);

export const AppWalkthrough: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene boundaries (30s = 900 frames at 30fps)
  // 0-60:     Arday logo
  // 60-150:   Dashboard
  // 150-270:  Lesson list
  // 270-420:  Lesson view (answer selection)
  // 420-540:  Audio feature
  // 540-660:  Conversation
  // 660-750:  Spaced repetition
  // 750-840:  Stats counters
  // 840-900:  CTA

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: FONT,
      }}
    >
      {/* Background music */}
      <Audio src={staticFile("music/promo-beat.mp3")} volume={0.2} loop />

      {/* === SCENE 1: Logo === */}
      {frame < 60 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            opacity: sceneOpacity(frame, 0, 60),
          }}
        >
          <p
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: EMERALD,
              letterSpacing: 6,
              textTransform: "uppercase",
            }}
          >
            ARDAY
          </p>
          <p style={{ fontSize: 20, color: GREY, marginTop: 12 }}>Sidee u shaqeeysa</p>
        </div>
      )}

      {/* === SCENE 2: Dashboard === */}
      {frame >= 50 && frame < 155 && (
        <ScaledScene opacity={sceneOpacity(frame, 60, 150)}>
          <DashboardMock start={60} />
        </ScaledScene>
      )}

      {/* === SCENE 3: Lesson List === */}
      {frame >= 140 && frame < 275 && (
        <ScaledScene opacity={sceneOpacity(frame, 150, 270)}>
          <LessonListMock start={155} />
        </ScaledScene>
      )}

      {/* === SCENE 4: Lesson View === */}
      {frame >= 260 && frame < 425 && (
        <ScaledScene opacity={sceneOpacity(frame, 270, 420)}>
          <LessonViewMock start={275} />
        </ScaledScene>
      )}

      {/* === SCENE 5: Audio Feature === */}
      {frame >= 410 && frame < 545 && (
        <ScaledScene opacity={sceneOpacity(frame, 420, 540)}>
          <div
            style={{
              width: "100%",
              background: "#292524",
              borderRadius: 20,
              padding: 32,
              border: "1.5px solid #44403c",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <p style={{ fontSize: 14, fontWeight: 600, color: GREY, textTransform: "uppercase", letterSpacing: 1 }}>
              Dhageyso erayga
            </p>
            <p style={{ fontSize: 38, fontWeight: 800, color: WHITE }}>Good morning</p>
            <p style={{ fontSize: 20, color: "#8B7355" }}>Subax wanaagsan</p>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
              {/* Play button */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 9999,
                  background: EMERALD,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
                }}
              >
                <span style={{ fontSize: 24, color: WHITE, marginLeft: 2 }}>{"\u25b6"}</span>
              </div>
              <AudioWaveform start={440} />
            </div>

            <div
              style={{
                marginTop: 8,
                padding: "10px 18px",
                background: "#1c1917",
                borderRadius: 10,
              }}
            >
              <p style={{ fontSize: 18, color: GREY, letterSpacing: 2, fontWeight: 500 }}>
                {"suu\u00b7bah \u00a0 waa\u00b7nag\u00b7san"}
              </p>
            </div>
          </div>
        </ScaledScene>
      )}

      {/* Audio playback */}
      <Sequence from={440} durationInFrames={90}>
        <Audio src={staticFile("audio/vocabulary/good-morning.mp3")} volume={0.6} />
      </Sequence>

      {/* === SCENE 6: Conversation === */}
      {frame >= 530 && frame < 665 && (
        <ScaledScene opacity={sceneOpacity(frame, 540, 660)}>
          <ConversationMock start={545} />
        </ScaledScene>
      )}

      {/* === SCENE 7: Spaced Repetition === */}
      {frame >= 650 && frame < 755 && (
        <ScaledScene opacity={sceneOpacity(frame, 660, 750)}>
          <SpacedRepMock start={665} />
        </ScaledScene>
      )}

      {/* === SCENE 8: Stats Counters === */}
      {frame >= 740 && frame < 845 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            paddingBottom: 220,
            opacity: sceneOpacity(frame, 750, 840),
          }}
        >
          <div style={{ display: "flex", gap: 40, justifyContent: "center" }}>
            {[
              { target: 120, label: "cashar", color: EMERALD },
              { target: 561, label: "erayg", color: WHITE },
              { target: 15, label: "wada-hadal", color: WHITE },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: "center" }}>
                <AnimatedCounter
                  target={stat.target}
                  start={755}
                  color={stat.color}
                  fontSize={56}
                  format={false}
                />
                <p style={{ fontSize: 16, color: GREY, marginTop: 8, fontWeight: 600 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SCENE 9: CTA === */}
      {frame >= 840 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            paddingBottom: 220,
            opacity: fadeIn(frame, 840, 20),
          }}
        >
          <p style={{ fontSize: 40, fontWeight: 800, color: WHITE, textAlign: "center" }}>
            Bilow maanta.
          </p>
          <p style={{ fontSize: 20, color: GREY, textAlign: "center" }}>
            Bilaash. Account la'aan.
          </p>
          <div
            style={{
              marginTop: 20,
              padding: "16px 48px",
              background: EMERALD,
              borderRadius: 9999,
              boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
            }}
          >
            <p style={{ fontSize: 22, fontWeight: 700, color: WHITE }}>Bilow — Waa bilaash</p>
          </div>
          <p style={{ fontSize: 20, color: GREY, marginTop: 8 }}>arday-nine.vercel.app</p>
        </div>
      )}
    </AbsoluteFill>
  );
};
