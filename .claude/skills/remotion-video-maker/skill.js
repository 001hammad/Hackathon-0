#!/usr/bin/env node

/**
 * Remotion Video Maker Skill
 * Creates a professional 60-second demo video for the AI Employee Gold Tier project
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = process.cwd();
const REMOTION_DIR = path.join(PROJECT_ROOT, 'remotion-demo');

console.log('🎬 Remotion Video Maker Skill');
console.log('=' .repeat(80));
console.log('Creating professional demo video for AI Employee - Gold Tier');
console.log('=' .repeat(80));
console.log();

// Step 1: Check if remotion-demo exists
if (fs.existsSync(REMOTION_DIR)) {
    console.log('⚠️  remotion-demo folder already exists!');
    console.log('   Delete it first if you want to start fresh:');
    console.log('   rm -rf remotion-demo');
    console.log();
    process.exit(1);
}

// Step 2: Create remotion-demo directory
console.log('📁 Creating remotion-demo directory...');
fs.mkdirSync(REMOTION_DIR, { recursive: true });

// Step 3: Initialize Remotion project
console.log('🚀 Initializing Remotion with TypeScript template...');
console.log('   This may take a few minutes...');
console.log();

try {
    execSync('npx create-video@latest --template=hello-world-typescript remotion-demo', {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
} catch (error) {
    console.error('❌ Failed to initialize Remotion project');
    process.exit(1);
}

// Step 4: Install additional dependencies
console.log();
console.log('📦 Installing additional dependencies...');
try {
    execSync('npm install @remotion/google-fonts', {
        cwd: REMOTION_DIR,
        stdio: 'inherit'
    });
} catch (error) {
    console.error('⚠️  Warning: Failed to install @remotion/google-fonts');
}

// Step 5: Generate video components
console.log();
console.log('🎨 Generating video components...');

// Create src directory structure
const srcDir = path.join(REMOTION_DIR, 'src');
const scenesDir = path.join(srcDir, 'scenes');
fs.mkdirSync(scenesDir, { recursive: true });

// Generate Root component
const rootComponent = `import { Composition } from "remotion";
import { MyVideo } from "./MyVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AIEmployeeDemo"
        component={MyVideo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
`;

fs.writeFileSync(path.join(srcDir, 'Root.tsx'), rootComponent);

// Generate main video component
const myVideoComponent = `import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { IntroScene } from "./scenes/IntroScene";
import { EmailFlowScene } from "./scenes/EmailFlowScene";
import { OrchestratorScene } from "./scenes/OrchestratorScene";
import { OdooScene } from "./scenes/OdooScene";
import { ConclusionScene } from "./scenes/ConclusionScene";

export const MyVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {/* Intro: 0-10s (0-300 frames) */}
      <Sequence from={0} durationInFrames={300}>
        <IntroScene />
      </Sequence>

      {/* Email Flow: 10-25s (300-750 frames) */}
      <Sequence from={300} durationInFrames={450}>
        <EmailFlowScene />
      </Sequence>

      {/* Orchestrator: 25-40s (750-1200 frames) */}
      <Sequence from={750} durationInFrames={450}>
        <OrchestratorScene />
      </Sequence>

      {/* Odoo Invoice: 40-50s (1200-1500 frames) */}
      <Sequence from={1200} durationInFrames={300}>
        <OdooScene />
      </Sequence>

      {/* Conclusion: 50-60s (1500-1800 frames) */}
      <Sequence from={1500} durationInFrames={300}>
        <ConclusionScene />
      </Sequence>
    </AbsoluteFill>
  );
};
`;

fs.writeFileSync(path.join(srcDir, 'MyVideo.tsx'), myVideoComponent);

// Generate IntroScene
const introScene = `import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: {
      damping: 100,
    },
  });

  const subtitleOpacity = interpolate(frame, [60, 90], [0, 1], {
    extrapolateRight: "clamp",
  });

  const badgeScale = spring({
    frame: frame - 120,
    fps,
    config: {
      damping: 80,
    },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Animated background grid */}
      <div
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: \`linear-gradient(#00ff8820 1px, transparent 1px),
                           linear-gradient(90deg, #00ff8820 1px, transparent 1px)\`,
          backgroundSize: "50px 50px",
          opacity: 0.1,
        }}
      />

      {/* Main title */}
      <div
        style={{
          transform: \`scale(\${titleScale})\`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: "#00ff88",
            margin: 0,
            textShadow: "0 0 40px #00ff8860",
          }}
        >
          AI EMPLOYEE
        </h1>
        <div
          style={{
            fontSize: 48,
            color: "#ffffff",
            marginTop: 20,
            opacity: subtitleOpacity,
          }}
        >
          Personal Assistant System
        </div>
      </div>

      {/* Gold Tier Badge */}
      <div
        style={{
          position: "absolute",
          bottom: 200,
          transform: \`scale(\${badgeScale})\`,
        }}
      >
        <div
          style={{
            padding: "20px 60px",
            background: "linear-gradient(135deg, #00ff88 0%, #00cc66 100%)",
            borderRadius: 50,
            fontSize: 36,
            fontWeight: 700,
            color: "#0a0a0a",
            boxShadow: "0 10px 40px #00ff8840",
          }}
        >
          ✅ GOLD TIER COMPLETE
        </div>
      </div>
    </AbsoluteFill>
  );
};
`;

fs.writeFileSync(path.join(scenesDir, 'IntroScene.tsx'), introScene);

// Generate EmailFlowScene
const emailFlowScene = `import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const EmailFlowScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 30], [0, 1]);
  const step1Opacity = interpolate(frame, [60, 90], [0, 1]);
  const step2Opacity = interpolate(frame, [120, 150], [0, 1]);
  const step3Opacity = interpolate(frame, [180, 210], [0, 1]);
  const arrowProgress = interpolate(frame, [240, 300], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 80,
        fontFamily,
      }}
    >
      {/* Title */}
      <div style={{ opacity: titleOpacity }}>
        <h2
          style={{
            fontSize: 72,
            color: "#00ff88",
            margin: 0,
            marginBottom: 60,
          }}
        >
          📧 Email → Task Flow
        </h2>
      </div>

      {/* Flow steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Step 1 */}
        <div style={{ opacity: step1Opacity }}>
          <div
            style={{
              background: "#1a1a1a",
              padding: 40,
              borderRadius: 20,
              borderLeft: "6px solid #00ff88",
            }}
          >
            <div style={{ fontSize: 32, color: "#00ff88", fontWeight: 700 }}>
              1. Gmail Watcher
            </div>
            <div style={{ fontSize: 24, color: "#cccccc", marginTop: 10 }}>
              Monitors inbox 24/7 → Detects new emails → Extracts metadata
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div style={{ opacity: step2Opacity }}>
          <div
            style={{
              background: "#1a1a1a",
              padding: 40,
              borderRadius: 20,
              borderLeft: "6px solid #00ff88",
            }}
          >
            <div style={{ fontSize: 32, color: "#00ff88", fontWeight: 700 }}>
              2. Task Creation
            </div>
            <div style={{ fontSize: 24, color: "#cccccc", marginTop: 10 }}>
              Creates task file in vault/Needs_Action/ → Generates Claude prompt
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div style={{ opacity: step3Opacity }}>
          <div
            style={{
              background: "#1a1a1a",
              padding: 40,
              borderRadius: 20,
              borderLeft: "6px solid #00ff88",
            }}
          >
            <div style={{ fontSize: 32, color: "#00ff88", fontWeight: 700 }}>
              3. Queue System
            </div>
            <div style={{ fontSize: 24, color: "#cccccc", marginTop: 10 }}>
              Adds to pending_tasks.md → Ready for orchestrator processing
            </div>
          </div>
        </div>
      </div>

      {/* Animated arrow */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: "50%",
          fontSize: 120,
          opacity: arrowProgress,
          transform: \`translateY(-50%) translateX(\${(1 - arrowProgress) * 100}px)\`,
        }}
      >
        →
      </div>
    </AbsoluteFill>
  );
};
`;

fs.writeFileSync(path.join(scenesDir, 'EmailFlowScene.tsx'), emailFlowScene);

// Generate OrchestratorScene
const orchestratorScene = `import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const OrchestratorScene: React.FC = () => {
  const frame = useCurrentFrame();

  const titleOpacity = interpolate(frame, [0, 30], [0, 1]);
  const loopOpacity = interpolate(frame, [60, 90], [0, 1]);
  const iterationProgress = Math.floor(interpolate(frame, [120, 400], [1, 15], { extrapolateRight: "clamp" }));

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 80,
        fontFamily,
      }}
    >
      {/* Title */}
      <div style={{ opacity: titleOpacity }}>
        <h2
          style={{
            fontSize: 72,
            color: "#00ff88",
            margin: 0,
            marginBottom: 40,
          }}
        >
          🤖 Ralph Wiggum Loop
        </h2>
      </div>

      {/* Main content */}
      <div style={{ opacity: loopOpacity }}>
        <div
          style={{
            background: "#1a1a1a",
            padding: 60,
            borderRadius: 20,
            border: "2px solid #00ff88",
          }}
        >
          <div style={{ fontSize: 36, color: "#ffffff", marginBottom: 40 }}>
            <strong style={{ color: "#00ff88" }}>Autonomous Task Processing</strong>
          </div>

          <div style={{ fontSize: 28, color: "#cccccc", lineHeight: 1.8 }}>
            ✓ Detects pending task in queue<br />
            ✓ Invokes Claude with task prompt<br />
            ✓ Claude analyzes email content<br />
            ✓ Determines required actions<br />
            ✓ Calls MCP servers (Odoo, Email)<br />
            ✓ Checks completion signals<br />
            ✓ Retries until task complete
          </div>

          {/* Iteration counter */}
          <div
            style={{
              marginTop: 60,
              padding: 30,
              background: "#0a0a0a",
              borderRadius: 15,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, color: "#00ff88", marginBottom: 10 }}>
              Current Iteration
            </div>
            <div style={{ fontSize: 80, color: "#ffffff", fontWeight: 900 }}>
              {iterationProgress} / 15
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
`;

fs.writeFileSync(path.join(scenesDir, 'OrchestratorScene.tsx'), orchestratorScene);

// Generate OdooScene
const odooScene = `import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const OdooScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOpacity = interpolate(frame, [0, 30], [0, 1]);
  const invoiceScale = spring({
    frame: frame - 60,
    fps,
    config: {
      damping: 100,
    },
  });
  const checkmarkScale = spring({
    frame: frame - 180,
    fps,
    config: {
      damping: 80,
    },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        padding: 80,
        fontFamily,
      }}
    >
      {/* Title */}
      <div style={{ opacity: titleOpacity }}>
        <h2
          style={{
            fontSize: 72,
            color: "#00ff88",
            margin: 0,
            marginBottom: 60,
          }}
        >
          💼 Odoo Auto Invoice
        </h2>
      </div>

      {/* Invoice card */}
      <div
        style={{
          transform: \`scale(\${invoiceScale})\`,
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background: "#1a1a1a",
            padding: 60,
            borderRadius: 20,
            border: "2px solid #00ff88",
          }}
        >
          <div style={{ fontSize: 32, color: "#00ff88", marginBottom: 30 }}>
            Invoice Draft Created
          </div>

          <div style={{ fontSize: 28, color: "#cccccc", lineHeight: 2 }}>
            <div><strong>Invoice ID:</strong> #1</div>
            <div><strong>Customer:</strong> Hammad Hafeez</div>
            <div><strong>Amount:</strong> 15,000 PKR</div>
            <div><strong>Description:</strong> Urgent Job Invoice - Gold Tier</div>
            <div><strong>Status:</strong> <span style={{ color: "#00ff88" }}>Draft</span></div>
          </div>

          {/* Success checkmark */}
          {frame > 180 && (
            <div
              style={{
                marginTop: 40,
                textAlign: "center",
                transform: \`scale(\${checkmarkScale})\`,
              }}
            >
              <div
                style={{
                  fontSize: 100,
                  color: "#00ff88",
                }}
              >
                ✅
              </div>
              <div style={{ fontSize: 32, color: "#ffffff", marginTop: 20 }}>
                Invoice Created Successfully
              </div>
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
`;

fs.writeFileSync(path.join(scenesDir, 'OdooScene.tsx'), odooScene);

// Generate ConclusionScene
const conclusionScene = `import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont();

export const ConclusionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({
    frame,
    fps,
    config: {
      damping: 100,
    },
  });

  const statsOpacity = interpolate(frame, [60, 90], [0, 1]);
  const alhamdulillahOpacity = interpolate(frame, [180, 210], [0, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        fontFamily,
      }}
    >
      {/* Main title */}
      <div
        style={{
          transform: \`scale(\${titleScale})\`,
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: "#00ff88",
            margin: 0,
            textShadow: "0 0 40px #00ff8860",
          }}
        >
          Gold Tier Complete
        </h1>
      </div>

      {/* Stats */}
      <div
        style={{
          opacity: statsOpacity,
          marginTop: 80,
          display: "flex",
          gap: 60,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, color: "#00ff88", fontWeight: 900 }}>3</div>
          <div style={{ fontSize: 28, color: "#cccccc" }}>MCP Servers</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, color: "#00ff88", fontWeight: 900 }}>100%</div>
          <div style={{ fontSize: 28, color: "#cccccc" }}>Autonomous</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, color: "#00ff88", fontWeight: 900 }}>24/7</div>
          <div style={{ fontSize: 28, color: "#cccccc" }}>Monitoring</div>
        </div>
      </div>

      {/* Alhamdulillah */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          opacity: alhamdulillahOpacity,
        }}
      >
        <div
          style={{
            fontSize: 48,
            color: "#ffffff",
            fontWeight: 300,
            fontStyle: "italic",
          }}
        >
          Alhamdulillah ✨
        </div>
      </div>
    </AbsoluteFill>
  );
};
`;

fs.writeFileSync(path.join(scenesDir, 'ConclusionScene.tsx'), conclusionScene);

console.log('✅ All video components generated successfully!');
console.log();
console.log('=' .repeat(80));
console.log('🎉 Remotion Video Maker Setup Complete!');
console.log('=' .repeat(80));
console.log();
console.log('📁 Project created in: remotion-demo/');
console.log();
console.log('🚀 Next Steps:');
console.log();
console.log('1. Navigate to the project:');
console.log('   cd remotion-demo');
console.log();
console.log('2. Preview the video (opens browser):');
console.log('   npm start');
console.log();
console.log('3. Render final MP4:');
console.log('   npm run build');
console.log('   (Output: out/AIEmployeeDemo.mp4)');
console.log();
console.log('4. Custom render command:');
console.log('   npx remotion render Video AIEmployeeDemo out/demo.mp4');
console.log();
console.log('=' .repeat(80));
console.log('📹 Video Structure:');
console.log('   0-10s:  Intro - Gold Tier Complete');
console.log('   10-25s: Email → Task Flow');
console.log('   25-40s: Ralph Wiggum Orchestrator');
console.log('   40-50s: Odoo Auto Invoice');
console.log('   50-60s: Conclusion + Alhamdulillah');
console.log('=' .repeat(80));
console.log();
console.log('💡 Tips:');
console.log('   - Edit scenes in: remotion-demo/src/scenes/');
console.log('   - Adjust timing in: remotion-demo/src/MyVideo.tsx');
console.log('   - Add music: Place audio file in public/ and import in scenes');
console.log('   - Dark theme with green accents (#00ff88) already configured');
console.log();
console.log('✅ Ready to create your demo video!');
console.log();
