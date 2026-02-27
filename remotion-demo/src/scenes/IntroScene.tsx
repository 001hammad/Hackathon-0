import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Particle glow effect
  const particleOpacity = interpolate(frame, [0, 60], [0, 0.3], {
    extrapolateRight: "clamp",
  });

  // Main title animation
  const titleOpacity = interpolate(frame, [30, 90], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleScale = interpolate(frame, [30, 90], [0.8, 1], {
    extrapolateRight: "clamp",
  });

  // Subtitle animation
  const subtitleOpacity = interpolate(frame, [90, 150], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Name animation
  const nameOpacity = interpolate(frame, [150, 210], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Particle glow background */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          background: `radial-gradient(circle at 50% 50%, #00ff9d15 0%, transparent 50%)`,
          opacity: particleOpacity,
        }}
      />

      {/* Animated particles */}
      {[...Array(20)].map((_, i) => {
        const x = (i * 123) % 100;
        const y = (i * 456) % 100;
        const delay = i * 5;
        const particleGlow = interpolate(
          frame,
          [delay, delay + 60],
          [0, 1],
          { extrapolateRight: "clamp" }
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "#00ff9d",
              opacity: particleGlow * 0.6,
              boxShadow: `0 0 10px #00ff9d`,
            }}
          />
        );
      })}

      {/* Main title */}
      <div
        style={{
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#ffffff",
            margin: 0,
            letterSpacing: "-2px",
            textShadow: "0 0 30px #00ff9d80",
          }}
        >
          Personal AI Employee
        </h1>
      </div>

      {/* Subtitle */}
      <div
        style={{
          position: "absolute",
          top: "55%",
          textAlign: "center",
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            fontSize: 28,
            color: "#00ff9d",
            fontWeight: 600,
            letterSpacing: "2px",
          }}
        >
          Gold Tier Complete • Hackathon-0 2026
        </div>
      </div>

      {/* Name */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          opacity: nameOpacity,
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: "#ffffff",
            fontWeight: 300,
            letterSpacing: "1px",
            opacity: 0.7,
          }}
        >
          Hammad Hafeez
        </div>
      </div>
    </AbsoluteFill>
  );
};
