import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { GmailFlowScene } from "./scenes/GmailFlowScene";
import { OrchestratorScene } from "./scenes/OrchestratorScene";
import { OdooScene } from "./scenes/OdooScene";
import { ConclusionScene } from "./scenes/ConclusionScene";

export const MyVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {/* Intro: 0-8s (0-240 frames) */}
      <Sequence from={0} durationInFrames={240}>
        <IntroScene />
      </Sequence>

      {/* Gmail Flow: 8-20s (240-600 frames) */}
      <Sequence from={240} durationInFrames={360}>
        <GmailFlowScene />
      </Sequence>

      {/* Orchestrator + Claude: 20-35s (600-1050 frames) */}
      <Sequence from={600} durationInFrames={450}>
        <OrchestratorScene />
      </Sequence>

      {/* Odoo Invoice: 35-48s (1050-1440 frames) */}
      <Sequence from={1050} durationInFrames={390}>
        <OdooScene />
      </Sequence>

      {/* Conclusion: 48-60s (1440-1800 frames) */}
      <Sequence from={1440} durationInFrames={360}>
        <ConclusionScene />
      </Sequence>
    </AbsoluteFill>
  );
};
