import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  useCurrentFrame,
  staticFile,
} from "remotion";

const BG = "#1c1917";
const EMERALD = "#10b981";
const EMERALD_LIGHT = "#d1fae5";
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

// Comparison row component
const ComparisonRow: React.FC<{
  left: React.ReactNode;
  right: React.ReactNode;
  start: number;
}> = ({ left, right, start }) => {
  const frame = useCurrentFrame();
  const opacity = fadeIn(frame, start, 20);
  const slideUp = interpolate(frame, [start, start + 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${slideUp}px)`,
        display: "flex",
        gap: 16,
        width: "100%",
      }}
    >
      {/* Left (grey/muted) */}
      <div
        style={{
          flex: 1,
          background: "#292524",
          borderRadius: 16,
          padding: 24,
          border: "1.5px solid #44403c",
          opacity: 0.7,
        }}
      >
        {left}
      </div>
      {/* Right (emerald/bright) */}
      <div
        style={{
          flex: 1,
          background: "rgba(16,185,129,0.08)",
          borderRadius: 16,
          padding: 24,
          border: `1.5px solid ${EMERALD}`,
        }}
      >
        {right}
      </div>
    </div>
  );
};

export const WhyArday: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene boundaries (20s = 600 frames)
  // 0-60:     Headers
  // 60-150:   Lesson UI comparison
  // 150-240:  WiFi/offline
  // 240-330:  Price
  // 330-420:  Textbook
  // 420-510:  Left fades, right expands
  // 510-600:  Full CTA

  // Scene visibilities
  const headersOpacity = fadeIn(frame, 0, 20);
  const comparisonPhase = frame >= 60 && frame < 420;
  const expandPhase = frame >= 420 && frame < 510;
  const ctaPhase = frame >= 510;

  // Left side fade out during expand
  const leftOpacity = expandPhase
    ? interpolate(frame, [420, 450], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  // Right side expand
  const rightExpand = expandPhase
    ? interpolate(frame, [450, 500], [0.5, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0.5;

  return (
    <AbsoluteFill
      style={{
        background: BG,
        fontFamily: FONT,
      }}
    >
      {/* Background music */}
      <Audio src={staticFile("music/promo-beat.mp3")} volume={0.2} loop />

      {/* Headers + Comparison rows — centered as one block */}
      {frame < 510 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 220,
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "0 56px",
              display: "flex",
              flexDirection: "column",
              gap: 20,
              transform: "scale(1.1)",
              transformOrigin: "center center",
            }}
          >
            {/* Headers */}
            <div
              style={{
                display: "flex",
                gap: 16,
                opacity: headersOpacity,
                marginBottom: 8,
              }}
            >
              <div style={{ flex: 1, textAlign: "center", opacity: leftOpacity }}>
                <p style={{ fontSize: 32, fontWeight: 800, color: GREY }}>Kale</p>
              </div>
              <div style={{ flex: expandPhase ? rightExpand / 0.5 : 1, textAlign: "center" }}>
                <p style={{ fontSize: 32, fontWeight: 800, color: EMERALD }}>Arday</p>
              </div>
            </div>

            {/* Comparison rows */}
            {comparisonPhase && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Row 1: Lesson UI (60-150) */}
          {frame >= 60 && (
            <ComparisonRow
              start={60}
              left={
                <div>
                  <p style={{ fontSize: 11, color: "#78716c", textTransform: "uppercase", marginBottom: 8 }}>Cashar</p>
                  <p style={{ fontSize: 15, color: GREY }}>Choose the correct answer</p>
                  <p style={{ fontSize: 13, color: "#44403c", marginTop: 6, fontStyle: "italic" }}>Ingiriisi kaliya</p>
                  <div style={{ height: 4, background: "#44403c", borderRadius: 2, marginTop: 12 }}>
                    <div style={{ width: "30%", height: "100%", background: GREY, borderRadius: 2 }} />
                  </div>
                </div>
              }
              right={
                <div>
                  <p style={{ fontSize: 11, color: EMERALD, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Cashar</p>
                  <p style={{ fontSize: 15, color: WHITE, fontWeight: 600 }}>Dooro jawaabta saxda ah</p>
                  <p style={{ fontSize: 13, color: EMERALD, marginTop: 6 }}>Af-Soomaali</p>
                  <div style={{ height: 4, background: "#292524", borderRadius: 2, marginTop: 12 }}>
                    <div style={{ width: "30%", height: "100%", background: EMERALD, borderRadius: 2 }} />
                  </div>
                </div>
              }
            />
          )}

          {/* Row 2: WiFi/Offline (150-240) */}
          {frame >= 150 && (
            <ComparisonRow
              start={150}
              left={
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 36 }}>{"\ud83d\udce1"}</p>
                  <p style={{ fontSize: 24, color: RED, fontWeight: 700, marginTop: 8 }}>{"\u2718"}</p>
                  <p style={{ fontSize: 14, color: GREY, marginTop: 4 }}>Internet u baahan</p>
                </div>
              }
              right={
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 36 }}>{"\ud83d\udce1"}</p>
                  <p style={{ fontSize: 24, color: EMERALD, fontWeight: 700, marginTop: 8 }}>{"\u2714"}</p>
                  <p style={{ fontSize: 14, color: EMERALD, fontWeight: 600, marginTop: 4 }}>Offline ka shaqeysa</p>
                </div>
              }
            />
          )}

          {/* Row 3: Price (240-330) */}
          {frame >= 240 && (
            <ComparisonRow
              start={240}
              left={
                <div style={{ textAlign: "center" }}>
                  <p
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: RED,
                      textDecoration: "line-through",
                    }}
                  >
                    $9.99/mo
                  </p>
                </div>
              }
              right={
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      display: "inline-block",
                      padding: "8px 20px",
                      background: EMERALD,
                      borderRadius: 9999,
                    }}
                  >
                    <p style={{ fontSize: 18, fontWeight: 700, color: WHITE }}>Bilaash — 100%</p>
                  </div>
                </div>
              }
            />
          )}

          {/* Row 4: Textbook (330-420) */}
          {frame >= 330 && (
            <ComparisonRow
              start={330}
              left={
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 36 }}>{"\ud83d\udcda"}</p>
                  <p style={{ fontSize: 14, color: GREY, marginTop: 6 }}>Buug caadi ah</p>
                </div>
              }
              right={
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 36 }}>{"\ud83d\udcda"}</p>
                  <p style={{ fontSize: 14, color: EMERALD, fontWeight: 600, marginTop: 6 }}>Oxford English File</p>
                </div>
              }
            />
          )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expand phase: Right side takes over */}
      {expandPhase && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: 220,
            opacity: fadeIn(frame, 450, 20),
          }}
        >
          <p
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: EMERALD,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            ARDAY
          </p>
          <p style={{ fontSize: 24, color: GREY, marginTop: 12, textAlign: "center" }}>
            App-ka ugu horreeya
          </p>
        </div>
      )}

      {/* CTA */}
      {ctaPhase && (
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
            opacity: fadeIn(frame, 510, 20),
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
