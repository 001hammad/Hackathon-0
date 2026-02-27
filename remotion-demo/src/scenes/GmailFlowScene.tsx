import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const GmailFlowScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Terminal window animation
  const terminalOpacity = interpolate(frame, [0, 30], [0, 1]);
  const terminalScale = interpolate(frame, [0, 30], [0.95, 1]);

  // Log lines appearing
  const log1 = interpolate(frame, [40, 50], [0, 1], { extrapolateRight: "clamp" });
  const log2 = interpolate(frame, [55, 65], [0, 1], { extrapolateRight: "clamp" });
  const log3 = interpolate(frame, [70, 80], [0, 1], { extrapolateRight: "clamp" });

  // Gmail interface transition
  const gmailOpacity = interpolate(frame, [100, 130], [0, 1]);
  const gmailScale = interpolate(frame, [100, 130], [1.1, 1]);

  // Email highlight
  const emailHighlight = interpolate(frame, [150, 180], [0, 1]);

  // Detection log
  const detectionLog = interpolate(frame, [200, 220], [0, 1]);

  // File explorer
  const fileExplorerOpacity = interpolate(frame, [250, 280], [0, 1]);
  const fileHighlight = interpolate(frame, [300, 330], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily,
      }}
    >
      {/* Terminal Window */}
      <div
        style={{
          position: "absolute",
          top: 40,
          left: 40,
          width: 600,
          opacity: terminalOpacity,
          transform: `scale(${terminalScale})`,
        }}
      >
        {/* Terminal header */}
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
            python gmail_watcher.py
          </div>
        </div>

        {/* Terminal content */}
        <div
          style={{
            background: "#0d0d0d",
            padding: 20,
            borderRadius: "0 0 8px 8px",
            fontSize: 14,
            fontFamily: "monospace",
            lineHeight: 1.8,
            minHeight: 200,
          }}
        >
          <div style={{ opacity: log1, color: "#00ff9d" }}>
            [2026-02-27 20:15:32] Gmail API authenticated ✓
          </div>
          <div style={{ opacity: log2, color: "#00ff9d" }}>
            [2026-02-27 20:15:33] Monitoring inbox...
          </div>
          <div style={{ opacity: log3, color: "#ffbd2e" }}>
            [2026-02-27 20:15:34] 📧 NEW EMAIL DETECTED
          </div>
          <div style={{ opacity: detectionLog, color: "#ffffff", paddingLeft: 20 }}>
            Subject: Urgent Invoice 25,000 PKR<br />
            From: client@example.com<br />
            Priority: HIGH
          </div>
          <div style={{ opacity: detectionLog, color: "#00ff9d", marginTop: 10 }}>
            [2026-02-27 20:15:35] ✓ Task created: vault/Needs_Action/
          </div>
        </div>
      </div>

      {/* Gmail Interface */}
      <div
        style={{
          position: "absolute",
          top: 40,
          right: 40,
          width: 580,
          opacity: gmailOpacity,
          transform: `scale(${gmailScale})`,
        }}
      >
        {/* Gmail header */}
        <div
          style={{
            background: "#1f1f1f",
            borderRadius: "8px 8px 0 0",
            padding: "15px 20px",
            display: "flex",
            alignItems: "center",
            gap: 15,
          }}
        >
          <div style={{ fontSize: 20, color: "#ffffff" }}>Gmail</div>
          <div
            style={{
              flex: 1,
              background: "#2a2a2a",
              padding: "8px 15px",
              borderRadius: 20,
              fontSize: 13,
              color: "#888",
            }}
          >
            Search mail
          </div>
        </div>

        {/* Gmail inbox */}
        <div
          style={{
            background: "#0d0d0d",
            padding: 15,
            borderRadius: "0 0 8px 8px",
            minHeight: 250,
          }}
        >
          {/* Email item */}
          <div
            style={{
              background: emailHighlight > 0 ? "#00ff9d15" : "#1a1a1a",
              border: emailHighlight > 0 ? "2px solid #00ff9d" : "1px solid #2a2a2a",
              borderRadius: 6,
              padding: 15,
              marginBottom: 10,
              transition: "all 0.3s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 600 }}>
                client@example.com
              </div>
              <div style={{ fontSize: 12, color: "#888" }}>Just now</div>
            </div>
            <div style={{ fontSize: 15, color: "#ffffff", fontWeight: 500, marginBottom: 5 }}>
              Urgent Invoice 25,000 PKR
            </div>
            <div style={{ fontSize: 13, color: "#aaa" }}>
              Hi, I need an invoice for 25,000 PKR for the urgent project...
            </div>
          </div>

          {/* Other emails (dimmed) */}
          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #2a2a2a",
              borderRadius: 6,
              padding: 15,
              opacity: 0.3,
            }}
          >
            <div style={{ fontSize: 14, color: "#ffffff" }}>Previous email...</div>
          </div>
        </div>
      </div>

      {/* File Explorer */}
      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 40,
          right: 40,
          opacity: fileExplorerOpacity,
        }}
      >
        <div
          style={{
            background: "#1e1e1e",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div style={{ fontSize: 16, color: "#ffffff", marginBottom: 15, fontWeight: 600 }}>
            📁 vault/Needs_Action/
          </div>
          <div
            style={{
              background: fileHighlight > 0 ? "#00ff9d15" : "#0d0d0d",
              border: fileHighlight > 0 ? "2px solid #00ff9d" : "1px solid #2a2a2a",
              borderRadius: 6,
              padding: 15,
              display: "flex",
              alignItems: "center",
              gap: 15,
            }}
          >
            <div style={{ fontSize: 24 }}>📄</div>
            <div>
              <div style={{ fontSize: 14, color: "#ffffff", fontWeight: 500 }}>
                email_2026-02-27_Urgent Invoice.md
              </div>
              <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                Created just now • 2.4 KB
              </div>
            </div>
            {fileHighlight > 0 && (
              <div
                style={{
                  marginLeft: "auto",
                  fontSize: 24,
                  color: "#00ff9d",
                }}
              >
                ✨
              </div>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
