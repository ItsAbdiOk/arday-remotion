import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";
import { AnimatedCounter } from "../components/AnimatedCounter";
import { FeaturePills } from "../components/FeaturePills";
import { PhoneFrame } from "../components/PhoneFrame";
import { ProgressBarMock } from "../components/ProgressBarMock";
import { QuestionView } from "../components/QuestionView";
import { XPPopupAnim } from "../components/XPPopupAnim";

const BG = "#1c1917";
const EMERALD = "#10b981";
const WHITE = "#ffffff";
const GREY = "#a8a29e";
const RED = "#ef4444";
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

export const TheProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // === SCENE BOUNDARIES ===
  // 0-60:   25 million counter + "Somali speakers"
  // 60-120: morphs to 0 + "apps teach them English"
  // 120-180: grey fake lesson + red X
  // 180-240: wipe → Arday QuestionView
  // 240-300: correct answer + XP popup
  // 300-360: phone frame pullback + feature pills
  // 360-450: branding + CTA

  // Scene 1: Counter "25,000,000"
  const scene1Opacity = frame < 55 ? fadeIn(frame, 0, 20) : fadeOut(frame, 55, 5);
  const scene1TextOpacity = fadeIn(frame, 15, 15);

  // Scene 2: Counter "0" in red
  const scene2Opacity = frame >= 60 && frame < 115 ? fadeIn(frame, 60, 10) : frame >= 115 ? fadeOut(frame, 115, 5) : 0;

  // Scene 3: Fake lesson (grey/blurred)
  const scene3Opacity = frame >= 120 && frame < 175 ? fadeIn(frame, 120, 15) : frame >= 175 ? fadeOut(frame, 175, 5) : 0;
  const redXScale = spring({ frame: Math.max(0, frame - 140), fps, config: { damping: 12, stiffness: 150 } });

  // Scene 4: Arday lesson wipe-in
  const scene4Opacity = frame >= 180 && frame < 295 ? fadeIn(frame, 180, 15) : frame >= 295 ? fadeOut(frame, 295, 5) : 0;

  // Scene 5: Phone pullback + pills
  const scene5Opacity = frame >= 300 && frame < 355 ? fadeIn(frame, 300, 15) : frame >= 355 ? fadeOut(frame, 355, 5) : 0;
  const phoneScale = spring({ frame: Math.max(0, frame - 300), fps, config: { damping: 20, stiffness: 100 } });

  // Scene 6: CTA
  const scene6Opacity = fadeIn(frame, 360, 20);

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: FONT,
      }}
    >
      {/* Background music */}
      <Audio src={staticFile("music/promo-beat.mp3")} volume={0.2} loop />

      {/* === SCENE 1: 25 Million === */}
      {frame < 60 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 220,
            opacity: scene1Opacity,
          }}
        >
          <AnimatedCounter target={25000000} start={0} color={WHITE} fontSize={120} />
          <p
            style={{
              fontSize: 40,
              fontWeight: 600,
              color: GREY,
              marginTop: 20,
              opacity: scene1TextOpacity,
            }}
          >
            qof oo Soomaali ku hadla
          </p>
        </div>
      )}

      {/* === SCENE 2: Zero apps === */}
      {frame >= 60 && frame < 120 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 220,
            opacity: scene2Opacity,
          }}
        >
          <p
            style={{
              fontSize: 200,
              fontWeight: 800,
              color: RED,
              lineHeight: 1,
              fontFamily: FONT,
            }}
          >
            0
          </p>
          <p
            style={{
              fontSize: 36,
              fontWeight: 600,
              color: GREY,
              marginTop: 20,
              textAlign: "center",
            }}
          >
            app ayaa Ingiriisi u dhiga
          </p>
        </div>
      )}

      {/* === SCENE 3: Fake English-only lesson === */}
      {frame >= 120 && frame < 180 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 220,
            opacity: scene3Opacity,
            padding: "0 60px 220px",
          }}
        >
          {/* Fake greyed-out lesson */}
          <div
            style={{
              width: "100%",
              maxWidth: 500,
              background: "#292524",
              borderRadius: 20,
              padding: 32,
              filter: "grayscale(100%) blur(1px)",
              opacity: 0.5,
            }}
          >
            <div style={{ height: 8, background: "#44403c", borderRadius: 4, marginBottom: 24 }} />
            <p style={{ fontSize: 18, color: "#78716c", marginBottom: 12 }}>Dooro jawaabta saxda ah</p>
            <p style={{ fontSize: 24, color: "#a8a29e", marginBottom: 24 }}>My name ___ Ahmed.</p>
            {["is", "am", "are"].map((opt) => (
              <div
                key={opt}
                style={{
                  padding: "12px 16px",
                  border: "2px solid #44403c",
                  borderRadius: 12,
                  marginBottom: 10,
                  color: "#78716c",
                  fontSize: 16,
                }}
              >
                {opt}
              </div>
            ))}
          </div>

          {/* Red X overlay */}
          <div
            style={{
              position: "absolute",
              transform: `scale(${redXScale})`,
              fontSize: 200,
              color: RED,
              fontWeight: 800,
              textShadow: "0 0 40px rgba(239,68,68,0.5)",
            }}
          >
            {"\u2715"}
          </div>

          {/* "Ingiriisi oo dhan" text */}
          <p
            style={{
              position: "absolute",
              bottom: 340,
              fontSize: 28,
              fontWeight: 700,
              color: RED,
              opacity: fadeIn(frame, 135, 15),
            }}
          >
            Ingiriisi oo dhan.
          </p>
        </div>
      )}

      {/* === SCENE 4: Arday lesson view === */}
      {frame >= 180 && frame < 300 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 220,
            opacity: scene4Opacity,
            padding: "0 60px 220px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 500,
              background: "#292524",
              borderRadius: 20,
              padding: "24px 0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
          >
            {/* Header */}
            <div style={{ padding: "0 20px", marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: EMERALD, marginBottom: 8 }}>
                Cashar 1 — Salaanta
              </p>
              <ProgressBarMock progress={0.3} animateFrom={190} label="3 / 10" />
            </div>
            {/* Question */}
            <QuestionView
              question="My name ___ Ahmed."
              options={["is", "am", "are"]}
              selectedIndex={0}
              correctIndex={0}
              selectAt={220}
              showCorrectAt={250}
            />
          </div>

          {/* XP Popup */}
          <XPPopupAnim start={260} amount={10} />
        </div>
      )}

      {/* === SCENE 5: Phone frame + Feature pills === */}
      {frame >= 300 && frame < 360 && (
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
            opacity: scene5Opacity,
          }}
        >
          <PhoneFrame scale={interpolate(phoneScale, [0, 1], [0.6, 0.55])}>
            <div style={{ background: BG, height: "100%", padding: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: EMERALD, textAlign: "center", marginBottom: 8 }}>
                ARDAY
              </p>
              <div style={{ background: "#292524", borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 10, color: GREY }}>Cashar 1 — Salaanta</p>
                <div style={{ height: 4, background: "#44403c", borderRadius: 2, marginTop: 6, marginBottom: 10 }}>
                  <div style={{ width: "30%", height: "100%", background: EMERALD, borderRadius: 2 }} />
                </div>
                <p style={{ fontSize: 12, color: WHITE }}>My name <span style={{ color: EMERALD }}>is</span> Ahmed.</p>
              </div>
            </div>
          </PhoneFrame>

          <FeaturePills start={320} />
        </div>
      )}

      {/* === SCENE 6: CTA === */}
      {frame >= 360 && (
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
            opacity: scene6Opacity,
          }}
        >
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: EMERALD,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            ARDAY
          </p>
          <p
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: WHITE,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            Ku baro Ingiriisiga.{"\n"}Af-Soomaali.
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
