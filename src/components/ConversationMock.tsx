import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { ChatBubble } from "./ChatBubble";

const WHITE = "#ffffff";
const GREY = "#a8a29e";
const EMERALD = "#10b981";
const FONT = "Plus Jakarta Sans, sans-serif";

interface ConversationMockProps {
  start: number;
}

const messages = [
  { side: "left" as const, name: "Dhakhtar", en: "How can I help you today?", so: "Sideen kugu caawin karaa maanta?" },
  { side: "right" as const, name: "Adiga", en: "I have a headache.", so: "Madax xanuun baan qabaa." },
  { side: "left" as const, name: "Dhakhtar", en: "How long have you had it?", so: "Ilaa goorma ayaad qabatay?" },
];

export const ConversationMock: React.FC<ConversationMockProps> = ({ start }) => {
  const frame = useCurrentFrame();

  return (
    <div style={{ fontFamily: FONT, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 9999,
            background: "#292524",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          {"\ud83c\udfe5"}
        </div>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, color: WHITE }}>Dhakhtarka</p>
          <p style={{ fontSize: 12, color: GREY }}>Dhakhtarka</p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            side={msg.side}
            name={msg.name}
            en={msg.en}
            so={msg.so}
            start={start + i * 20}
          />
        ))}
      </div>
    </div>
  );
};
