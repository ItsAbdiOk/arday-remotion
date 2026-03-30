import React from "react";

const EMERALD = "#10b981";
const GREY = "#a8a29e";

export const ArdayHeader: React.FC = () => (
  <p
    style={{
      fontSize: 24,
      fontWeight: 700,
      letterSpacing: 4,
      textTransform: "uppercase" as const,
      color: EMERALD,
      textAlign: "center" as const,
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}
  >
    ARDAY
  </p>
);

export const ArdayFooter: React.FC = () => (
  <p
    style={{
      fontSize: 24,
      fontWeight: 400,
      color: GREY,
      textAlign: "center" as const,
      fontFamily: "Plus Jakarta Sans, sans-serif",
    }}
  >
    arday-nine.vercel.app
  </p>
);
