import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const OdooScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Odoo dashboard fade in
  const dashboardOpacity = interpolate(frame, [0, 30], [0, 1]);
  const dashboardScale = interpolate(frame, [0, 30], [1.05, 1]);

  // Invoice creation animation
  const creatingOpacity = interpolate(frame, [60, 90], [0, 1]);

  // Invoice appears
  const invoiceOpacity = interpolate(frame, [120, 150], [0, 1]);
  const invoiceScale = interpolate(frame, [120, 150], [0.95, 1]);

  // Zoom in on invoice
  const zoomScale = interpolate(frame, [180, 240], [1, 1.15], { extrapolateRight: "clamp" });

  // Status change
  const statusOpacity = interpolate(frame, [270, 300], [0, 1]);

  // Success checkmark
  const checkmarkOpacity = interpolate(frame, [330, 360], [0, 1]);
  const checkmarkScale = interpolate(frame, [330, 360], [0.5, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#000000",
        fontFamily,
      }}
    >
      {/* Odoo Dashboard */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
          opacity: dashboardOpacity,
          transform: `scale(${dashboardScale})`,
        }}
      >
        {/* Odoo header */}
        <div
          style={{
            background: "#1a1a1a",
            padding: "15px 25px",
            borderRadius: "12px 12px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #2a2a2a",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#00ff9d" }}>Odoo</div>
            <div style={{ fontSize: 14, color: "#888" }}>Invoicing</div>
          </div>
          <div style={{ fontSize: 13, color: "#888" }}>localhost:8069</div>
        </div>

        {/* Main content area */}
        <div
          style={{
            background: "#0d0d0d",
            padding: 30,
            borderRadius: "0 0 12px 12px",
            minHeight: 600,
            position: "relative",
          }}
        >
          {/* Creating invoice message */}
          {frame < 120 && (
            <div
              style={{
                opacity: creatingOpacity,
                textAlign: "center",
                paddingTop: 100,
              }}
            >
              <div style={{ fontSize: 18, color: "#00ff9d", marginBottom: 15 }}>
                Creating invoice automatically...
              </div>
              <div
                style={{
                  width: 40,
                  height: 40,
                  border: "3px solid #00ff9d40",
                  borderTop: "3px solid #00ff9d",
                  borderRadius: "50%",
                  margin: "0 auto",
                  animation: "spin 1s linear infinite",
                }}
              />
            </div>
          )}

          {/* Invoice card */}
          <div
            style={{
              opacity: invoiceOpacity,
              transform: `scale(${invoiceScale * zoomScale})`,
              transformOrigin: "center center",
            }}
          >
            <div
              style={{
                background: "#1a1a1a",
                border: "2px solid #00ff9d40",
                borderRadius: 12,
                padding: 30,
                maxWidth: 700,
                margin: "0 auto",
                boxShadow: "0 10px 40px #00ff9d20",
              }}
            >
              {/* Invoice header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 30,
                  paddingBottom: 20,
                  borderBottom: "1px solid #2a2a2a",
                }}
              >
                <div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#ffffff" }}>
                    INVOICE
                  </div>
                  <div style={{ fontSize: 16, color: "#00ff9d", marginTop: 5 }}>
                    INV/2026/00002
                  </div>
                </div>
                <div
                  style={{
                    opacity: statusOpacity,
                    background: "#ffbd2e20",
                    border: "2px solid #ffbd2e",
                    borderRadius: 8,
                    padding: "8px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#ffbd2e",
                    height: "fit-content",
                  }}
                >
                  DRAFT
                </div>
              </div>

              {/* Invoice details */}
              <div style={{ marginBottom: 25 }}>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>Bill To:</div>
                <div style={{ fontSize: 16, color: "#ffffff", fontWeight: 500 }}>
                  Hammad Hafeez
                </div>
                <div style={{ fontSize: 14, color: "#aaa" }}>
                  hammadhafeez435@gmail.com
                </div>
              </div>

              {/* Line items */}
              <div
                style={{
                  background: "#0d0d0d",
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 25,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: 15,
                    fontSize: 13,
                    color: "#888",
                    marginBottom: 15,
                    paddingBottom: 10,
                    borderBottom: "1px solid #2a2a2a",
                  }}
                >
                  <div>Description</div>
                  <div style={{ textAlign: "right" }}>Quantity</div>
                  <div style={{ textAlign: "right" }}>Amount</div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr",
                    gap: 15,
                    fontSize: 15,
                    color: "#ffffff",
                  }}
                >
                  <div>Urgent Job Invoice</div>
                  <div style={{ textAlign: "right" }}>1</div>
                  <div style={{ textAlign: "right", fontWeight: 600 }}>25,000 PKR</div>
                </div>
              </div>

              {/* Total */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 20,
                  borderTop: "2px solid #00ff9d40",
                }}
              >
                <div style={{ fontSize: 18, color: "#ffffff", fontWeight: 600 }}>
                  Total Amount
                </div>
                <div style={{ fontSize: 32, color: "#00ff9d", fontWeight: 900 }}>
                  25,000 PKR
                </div>
              </div>
            </div>
          </div>

          {/* Success checkmark */}
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              textAlign: "center",
              opacity: checkmarkOpacity,
              transform: `scale(${checkmarkScale})`,
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: "#00ff9d20",
                borderRadius: "50%",
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                boxShadow: "0 0 30px #00ff9d40",
              }}
            >
              ✓
            </div>
            <div style={{ fontSize: 18, color: "#ffffff", marginTop: 15 }}>
              Invoice Created Successfully
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
