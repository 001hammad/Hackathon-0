import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const OrchestratorScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Terminal orchestrator
  const terminalOpacity = interpolate(frame, [0, 30], [0, 1]);
  const log1 = interpolate(frame, [40, 50], [0, 1], { extrapolateRight: "clamp" });
  const log2 = interpolate(frame, [55, 65], [0, 1], { extrapolateRight: "clamp" });
  const log3 = interpolate(frame, [70, 80], [0, 1], { extrapolateRight: "clamp" });

  // Claude interface
  const claudeOpacity = interpolate(frame, [120, 150], [0, 1]);
  const claudeScale = interpolate(frame, [120, 150], [1.05, 1]);

  // Thinking animation
  const thinkingDots = Math.max(0, Math.floor(interpolate(frame, [150, 240], [0, 3], {
    extrapolateRight: "clamp",
    extrapolateLeft: "clamp"
  })));

  // Response appearing
  const responseOpacity = interpolate(frame, [250, 280], [0, 1]);

  // File movement
  const fileMovementOpacity = interpolate(frame, [320, 350], [0, 1]);
  const filePosition = interpolate(frame, [350, 410], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily,
      }}
    >
      {/* Orchestrator Terminal */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 700,
          opacity: terminalOpacity,
        }}
      >
        <div
          style={{
            background: "#1e1e1e",
            borderRadius: "8px 8px 0 0",
            padding: "10px 15px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f56" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ffbd2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#27c93f" }} />
          <div style={{ marginLeft: 15, fontSize: 13, color: "#888" }}>
            python orchestrator.py --autonomous
          </div>
        </div>

        <div
          style={{
            background: "#0d0d0d",
            padding: 20,
            borderRadius: "0 0 8px 8px",
            fontSize: 14,
            fontFamily: "monospace",
            lineHeight: 1.8,
            minHeight: 180,
          }}
        >
          <div style={{ opacity: log1, color: "#00ff9d" }}>
            [20:15:36] 🤖 RALPH WIGGUM AUTONOMOUS MODE
          </div>
          <div style={{ opacity: log2, color: "#ffffff" }}>
            [20:15:36] Found 1 pending task in queue
          </div>
          <div style={{ opacity: log3, color: "#ffbd2e" }}>
            [20:15:37] Task: Urgent Invoice 25,000 PKR
          </div>
          <div style={{ opacity: log3, color: "#00ff9d", marginTop: 5 }}>
            [20:15:37] → Invoking Claude Sonnet 4.6...
          </div>
        </div>
      </div>

      {/* Claude Interface */}
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 40,
          right: 40,
          opacity: claudeOpacity,
          transform: `scale(${claudeScale})`,
        }}
      >
        <div
          style={{
            background: "#1a1a1a",
            borderRadius: 12,
            padding: 25,
            border: "2px solid #00ff9d40",
            boxShadow: "0 10px 40px #00ff9d20",
          }}
        >
          {/* Claude header */}
          <div style={{ display: "flex", alignItems: "center", gap: 15, marginBottom: 20 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #00ff9d, #00cc7a)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
              }}
            >
              🤖
            </div>
            <div>
              <div style={{ fontSize: 16, color: "#ffffff", fontWeight: 600 }}>
                Claude Sonnet 4.6
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>Processing task...</div>
            </div>
          </div>

          {/* Prompt */}
          <div
            style={{
              background: "#0d0d0d",
              padding: 15,
              borderRadius: 8,
              marginBottom: 15,
              borderLeft: "3px solid #00ff9d",
            }}
          >
            <div style={{ fontSize: 13, color: "#aaa", marginBottom: 5 }}>Prompt:</div>
            <div style={{ fontSize: 14, color: "#ffffff" }}>
              Create invoice for 25,000 PKR and draft reply email
            </div>
          </div>

          {/* Thinking animation */}
          {frame < 250 && (
            <div style={{ fontSize: 14, color: "#00ff9d", fontStyle: "italic" }}>
              Thinking{".".repeat(thinkingDots + 1)}
            </div>
          )}

          {/* Response */}
          <div style={{ opacity: responseOpacity }}>
            <div
              style={{
                background: "#0d0d0d",
                padding: 15,
                borderRadius: 8,
                borderLeft: "3px solid #00ff9d",
              }}
            >
              <div style={{ fontSize: 13, color: "#00ff9d", marginBottom: 8 }}>
                ✓ Analysis complete
              </div>
              <div style={{ fontSize: 14, color: "#ffffff", lineHeight: 1.6 }}>
                → Calling Odoo MCP: create_invoice()<br />
                → Calling Email MCP: draft_reply()<br />
                → Moving task to Done/
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Movement Animation */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          right: 40,
          opacity: fileMovementOpacity,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Source folder */}
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: 8,
              padding: 20,
              width: 280,
              opacity: 1 - filePosition * 0.5,
            }}
          >
            <div style={{ fontSize: 14, color: "#888", marginBottom: 10 }}>
              📁 Needs_Action/
            </div>
            <div
              style={{
                background: "#0d0d0d",
                padding: 12,
                borderRadius: 6,
                fontSize: 13,
                color: "#ffffff",
                opacity: 1 - filePosition,
              }}
            >
              📄 email_2026-02-27...
            </div>
          </div>

          {/* Arrow */}
          <div
            style={{
              fontSize: 40,
              color: "#00ff9d",
              opacity: filePosition,
            }}
          >
            →
          </div>

          {/* Destination folder */}
          <div
            style={{
              background: "#1e1e1e",
              borderRadius: 8,
              padding: 20,
              width: 280,
              border: filePosition > 0.8 ? "2px solid #00ff9d" : "1px solid #2a2a2a",
            }}
          >
            <div style={{ fontSize: 14, color: "#00ff9d", marginBottom: 10 }}>
              📁 Done/
            </div>
            <div
              style={{
                background: "#0d0d0d",
                padding: 12,
                borderRadius: 6,
                fontSize: 13,
                color: "#ffffff",
                opacity: filePosition,
              }}
            >
              📄 email_2026-02-27...
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
