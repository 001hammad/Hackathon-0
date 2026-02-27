import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const ConclusionScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Checkmarks appearing one by one
  const check1 = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const check2 = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const check3 = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });
  const check4 = interpolate(frame, [110, 130], [0, 1], { extrapolateRight: "clamp" });
  const check5 = interpolate(frame, [140, 160], [0, 1], { extrapolateRight: "clamp" });

  // Final message
  const finalMessageOpacity = interpolate(frame, [200, 240], [0, 1]);
  const finalMessageScale = interpolate(frame, [200, 240], [0.9, 1]);

  // Alhamdulillah
  const alhamdulillahOpacity = interpolate(frame, [270, 310], [0, 1]);

  // Fade out
  const fadeOut = interpolate(frame, [330, 360], [1, 0]);

  const checkmarks = [
    { text: "Gmail Integration", opacity: check1 },
    { text: "Autonomous Processing", opacity: check2 },
    { text: "Odoo Auto Invoice", opacity: check3 },
    { text: "MCP Email Draft", opacity: check4 },
    { text: "Full Gold Tier Complete", opacity: check5 },
  ];

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily,
        opacity: fadeOut,
      }}
    >
      {/* Subtle glow background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at 50% 50%, #00ff9d10 0%, transparent 60%)`,
        }}
      />

      {/* Checkmarks list */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 25,
        }}
      >
        {checkmarks.map((item, index) => (
          <div
            key={index}
            style={{
              opacity: item.opacity,
              transform: `translateX(${(1 - item.opacity) * -50}px)`,
              display: "flex",
              alignItems: "center",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#00ff9d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                color: "#000000",
                fontWeight: 900,
                boxShadow: "0 0 20px #00ff9d60",
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: 28,
                color: "#ffffff",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              {item.text}
            </div>
          </div>
        ))}
      </div>

      {/* Final message */}
      <div
        style={{
          position: "absolute",
          top: "60%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: finalMessageOpacity,
          transform: `scale(${finalMessageScale})`,
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: "#00ff9d",
            letterSpacing: "-1px",
            textShadow: "0 0 30px #00ff9d60",
            marginBottom: 15,
          }}
        >
          Gold Tier 100% Complete
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#ffffff",
            fontWeight: 300,
            opacity: 0.8,
          }}
        >
          Fully Autonomous AI Employee System
        </div>
      </div>

      {/* Alhamdulillah */}
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: alhamdulillahOpacity,
        }}
      >
        <div
          style={{
            fontSize: 36,
            color: "#00ff9d",
            fontWeight: 300,
            fontStyle: "italic",
            letterSpacing: "2px",
            marginBottom: 20,
          }}
        >
          Alhamdulillah
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#ffffff",
            opacity: 0.6,
          }}
        >
          Hammad Hafeez • February 2026
        </div>
      </div>
    </AbsoluteFill>
  );
};
