# Remotion Video Maker Skill

Create professional demo videos using Remotion for the AI Employee Gold Tier project.

## Description

This skill automates the creation of a 60-second demo video showcasing the Personal AI Employee system. It sets up Remotion, generates all necessary components, and creates a cinematic presentation with smooth animations.

## Usage

```bash
# From project root
claude --skill remotion-video-maker
```

## What This Skill Does

1. Creates `remotion-demo/` folder in project root
2. Initializes Remotion with TypeScript template
3. Generates complete video components:
   - Main Video.tsx composition
   - Scene components (Intro, EmailFlow, Orchestrator, Odoo, Conclusion)
   - Styling with dark theme and green accents
4. Sets up animations (Fade, Zoom, Slide)
5. Configures Google Fonts (Inter)
6. Provides preview and render commands

## Video Structure (60 seconds)

- **0-10s**: Intro - "Gold Tier Complete" with logo animation
- **10-25s**: Gmail → Task Flow - Email monitoring and task creation
- **25-40s**: Orchestrator + Claude - Ralph Wiggum autonomous loop
- **40-50s**: Odoo Auto Invoice - Invoice creation demonstration
- **50-60s**: Conclusion - "Alhamdulillah" and project summary

## Commands After Setup

```bash
# Navigate to remotion-demo
cd remotion-demo

# Preview video (opens browser)
npm start

# Render final MP4
npm run build

# Render with custom output
npx remotion render Video out/demo.mp4
```

## Technical Details

- **Framework**: Remotion 4.x with TypeScript
- **Theme**: Dark background (#0a0a0a) with green accents (#00ff88)
- **Font**: Inter (via @remotion/google-fonts)
- **FPS**: 30
- **Resolution**: 1920x1080
- **Duration**: 60 seconds (1800 frames)

## Skill Implementation

When invoked, this skill will:

1. Check if remotion-demo exists, create if not
2. Run `npx create-video@latest` with hello-world-typescript template
3. Install additional dependencies (@remotion/google-fonts)
4. Generate all video components with proper TypeScript types
5. Create scene components with animations
6. Set up proper composition configuration
7. Provide next steps and commands

## Notes

- Does not modify any files in hackathon-0 root
- All Remotion files contained in remotion-demo/ subdirectory
- Safe to delete remotion-demo/ folder to start fresh
- Music note included as placeholder (add your own audio file)
