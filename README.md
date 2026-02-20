# Personal AI Employee - Hackathon-0

Status: Bronze Tier - Skeleton Setup

Goal: Autonomous FTE using Claude Code + Obsidian vault

## Architecture

This project implements a Personal AI Employee (Digital FTE) using:
- Claude Code as the AI engine
- Obsidian vault for task management and state persistence
- Custom skills for autonomous operation
- MCP servers for external integrations

## Structure

```
hackathon-0/
├── .claude/skills/     # Custom Claude Code skills
├── vault/              # Obsidian vault for task management
├── scripts/            # Automation scripts
├── mcp-servers/        # MCP server implementations
└── logs/               # System logs
```

## Vault Workflow

Tasks flow through these folders:
1. **Needs_Action/** - Incoming tasks awaiting processing
2. **Plans/** - Tasks being planned
3. **Pending_Approval/** - Tasks awaiting user approval
4. **Approved/** - Approved tasks ready for execution
5. **Done/** - Completed tasks
6. **Rejected/** - Rejected or cancelled tasks
7. **Logs/** - System operation logs
8. **Briefings/** - Status reports and summaries

## Current Tier: All Tier Completed

Bronze tier provides the foundational skeleton and core skills for autonomous operation.
