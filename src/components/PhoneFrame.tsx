import React from "react";

interface PhoneFrameProps {
  children: React.ReactNode;
  scale?: number;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ children, scale = 1 }) => {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        width: 380,
        height: 780,
        borderRadius: 44,
        border: "6px solid #44403c",
        background: "#1c1917",
        overflow: "hidden",
        position: "relative",
        boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
      }}
    >
      {/* Notch */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: 140,
          height: 28,
          background: "#44403c",
          borderRadius: "0 0 20px 20px",
          zIndex: 10,
        }}
      />
      {/* Screen content */}
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          paddingTop: 36,
        }}
      >
        {children}
      </div>
    </div>
  );
};
