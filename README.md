# Personal AI Employee - Hackathon-0

**Status:** 🥇 Gold Tier - Full Cross-Domain Integration

**Goal:** Autonomous Digital FTE using Claude Code + Obsidian vault + Multi-Domain Integration

## Overview

This project implements a fully autonomous Personal AI Employee (Digital FTE) that integrates:
- **Personal Operations:** Gmail email management with OAuth2
- **Business Operations:** Odoo ERP for invoicing and accounting
- **Social Media:** Facebook, Instagram, Twitter/X posting
- **Executive Reporting:** Automated weekly CEO briefings
- **Autonomous Operation:** Self-healing, multi-step task completion

## Architecture

Built on Claude Code (Sonnet 4.6) with:
- **AI Engine:** Claude Code for intelligence and decision-making
- **Task Management:** Obsidian vault for workflow and state
- **Custom Skills:** Autonomous operation and routing
- **MCP Servers:** External service integrations
- **Docker:** Containerized Odoo ERP

## Quick Start

### Prerequisites
- Node.js 18+
- Docker Desktop
- Gmail OAuth2 credentials
- Claude Code CLI

### Installation

```bash
# 1. Install dependencies
cd mcp-servers
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start Odoo (optional)
docker-compose up -d

# 4. Start MCP servers
npm run start:all
```

### Verify Installation

```bash
# Check MCP servers
curl http://localhost:3001/health  # Email MCP
curl http://localhost:3002/health  # Odoo MCP
curl http://localhost:3003/health  # Social MCP

# Generate test CEO briefing
node scripts/generate-ceo-briefing.js
```

## Project Structure

```
hackathon-0/
├── .claude/skills/          # Custom Claude Code skills
│   ├── action-router/       # Task routing and classification
│   ├── file-mover/          # Task lifecycle management
│   ├── ralph-wiggum/        # Autonomous loop
│   └── vault-management/    # Vault organization
├── vault/                   # Obsidian vault
│   ├── Needs_Action/        # Incoming tasks
│   ├── Done/                # Completed tasks
│   ├── Briefings/           # CEO reports
│   └── Business_Goals.md    # Business objectives
├── mcp-servers/             # MCP server implementations
│   ├── email-mcp.js         # Gmail integration
│   ├── odoo-mcp.js          # Odoo ERP integration
│   ├── social-mcp.js        # Social media integration
│   └── start-all.js         # Start all servers
├── scripts/                 # Automation scripts
│   └── generate-ceo-briefing.js
├── logs/                    # System logs
├── docker-compose.yml       # Odoo Docker setup
├── ARCHITECTURE.md          # Detailed architecture docs
├── ODOO_SETUP.md           # Odoo setup guide
└── GOLD.md                 # Gold tier progress
```

## Vault Workflow

Tasks flow through these folders:
1. **Needs_Action/** - Incoming tasks awaiting processing
2. **Plans/** - Tasks being planned
3. **Pending_Approval/** - Tasks awaiting user approval
4. **Approved/** - Approved tasks ready for execution
5. **Done/** - Completed tasks (archive)
6. **Rejected/** - Rejected or cancelled tasks
7. **Logs/** - System operation logs
8. **Briefings/** - CEO briefings and reports

## Features

### ✅ Email Management (Silver Tier)
- Gmail OAuth2 integration
- Draft and send emails
- Automatic email-to-task conversion

### ✅ Business Operations (Gold Tier)
- Odoo Community 19 ERP integration
- Automated invoice draft creation
- Financial data retrieval
- Partner/customer management

### ✅ Social Media (Gold Tier)
- Multi-platform posting (Facebook, Instagram, Twitter/X)
- Automatic content summarization
- Platform-specific formatting

### ✅ Executive Reporting (Gold Tier)
- Weekly CEO briefings
- Task completion analysis
- Financial metrics from Odoo
- Business goal tracking

### ✅ Autonomous Operation (Gold Tier)
- Ralph Wiggum continuous loop
- Self-healing and error recovery
- Multi-step task completion
- Comprehensive audit logging

## MCP Servers

### Email MCP (Port 3001)
- Gmail integration via OAuth2
- Draft and send capabilities
- Endpoints: `/draft_email`, `/send_email`, `/health`

### Odoo MCP (Port 3002)
- Odoo JSON-RPC API integration
- Invoice management
- Endpoints: `/create_invoice`, `/invoice/:id`, `/invoices`, `/health`

### Social MCP (Port 3003)
- Multi-platform social media posting
- Content optimization
- Endpoints: `/facebook/post`, `/instagram/post`, `/twitter/post`, `/post/multi`, `/health`

## Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Comprehensive system architecture
- **[ODOO_SETUP.md](ODOO_SETUP.md)** - Odoo installation and configuration
- **[GOLD.md](GOLD.md)** - Gold tier goals and progress
- **[SILVER.md](SILVER.md)** - Silver tier completion
- **[BRONZE.md](vault/BRONZE.md)** - Bronze tier foundation

## Tier Progress

- ✅ **Bronze Tier** - Skeleton setup and core skills
- ✅ **Silver Tier** - Gmail integration and orchestration
- 🚧 **Gold Tier** - Full cross-domain integration (In Progress)

## Usage Examples

### Create Invoice from Email
Email subject: "Invoice for ABC Corp - $5,000"
→ Automatically creates draft invoice in Odoo

### Multi-Platform Social Post
Task: "Post announcement to all platforms"
→ Posts to Facebook, Instagram, Twitter with optimized content

### Weekly CEO Briefing
```bash
node scripts/generate-ceo-briefing.js
```
→ Generates comprehensive weekly report in `vault/Briefings/`

## Troubleshooting

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed troubleshooting guide.

Common issues:
- **MCP server won't start:** Check port availability and dependencies
- **Odoo connection failed:** Ensure Docker containers are running
- **Email integration issues:** Refresh OAuth2 token

## Contributing

This is a hackathon project demonstrating autonomous AI employee capabilities.

## License

MIT
