# Gold Tier Architecture Documentation

## System Overview

The Personal AI Employee (Gold Tier) is a fully autonomous digital FTE that integrates personal and business operations across multiple domains:

- **Email Management** (Gmail via OAuth2)
- **Business Operations** (Odoo ERP)
- **Social Media** (Facebook, Instagram, Twitter/X)
- **Task Orchestration** (Obsidian vault-based workflow)
- **Executive Reporting** (Automated CEO briefings)

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Claude Code (AI Engine)                  │
│                    Sonnet 4.6 Model                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─── Custom Skills ───┐
                     │                      │
                     │    ┌─────────────────┴──────────────┐
                     │    │ - action-router                │
                     │    │ - file-mover                   │
                     │    │ - ralph-wiggum (autonomous)    │
                     │    │ - vault-management             │
                     │    └────────────────────────────────┘
                     │
                     ├─── MCP Servers ───┐
                     │                    │
                     │    ┌───────────────┴────────────────┐
                     │    │ Email MCP (Port 3001)          │
                     │    │ - Gmail OAuth2                 │
                     │    │ - Draft/Send emails            │
                     │    │                                │
                     │    │ Odoo MCP (Port 3002)           │
                     │    │ - JSON-RPC API                 │
                     │    │ - Invoice management           │
                     │    │ - Financial data               │
                     │    │                                │
                     │    │ Social MCP (Port 3003)         │
                     │    │ - Facebook Graph API           │
                     │    │ - Instagram API                │
                     │    │ - Twitter API v2               │
                     │    └────────────────────────────────┘
                     │
                     ├─── Obsidian Vault ───┐
                     │                       │
                     │    ┌──────────────────┴─────────────┐
                     │    │ Needs_Action/  (Incoming)      │
                     │    │ Plans/         (Planning)      │
                     │    │ Approved/      (Ready)         │
                     │    │ Done/          (Completed)     │
                     │    │ Briefings/     (Reports)       │
                     │    │ Logs/          (Audit trail)   │
                     │    └────────────────────────────────┘
                     │
                     └─── External Services ───┐
                                               │
                          ┌────────────────────┴────────────┐
                          │ Gmail (Google Workspace)        │
                          │ Odoo 19 (Docker)                │
                          │ Facebook/Instagram              │
                          │ Twitter/X                       │
                          └─────────────────────────────────┘
```

## Component Details

### 1. Claude Code (AI Engine)

**Model:** Claude Sonnet 4.6
**Role:** Central intelligence and decision-making

**Capabilities:**
- Natural language understanding
- Task planning and execution
- Code generation and modification
- Multi-step reasoning
- Error recovery

### 2. Custom Skills

#### action-router
- Routes incoming tasks to appropriate handlers
- Determines task type and priority
- Delegates to specialized skills

#### file-mover
- Manages task lifecycle through vault folders
- Moves completed tasks to Done/
- Maintains workflow state

#### ralph-wiggum
- Autonomous loop for continuous operation
- Monitors for new tasks
- Self-healing and error recovery
- Multi-step task completion

#### vault-management
- Obsidian vault structure management
- File organization and cleanup
- Metadata management

### 3. MCP Servers

#### Email MCP (Port 3001)

**Technology:** Express.js + Google APIs
**Authentication:** OAuth2

**Endpoints:**
- `POST /draft_email` - Create email draft
- `POST /send_email` - Send email
- `POST /email` - Combined endpoint with isDraft flag
- `GET /health` - Health check

**Features:**
- Gmail integration via OAuth2
- Draft and send capabilities
- Base64 email encoding
- Comprehensive logging

#### Odoo MCP (Port 3002)

**Technology:** Express.js + Axios (JSON-RPC)
**Integration:** Odoo Community 19

**Endpoints:**
- `POST /create_invoice` - Create invoice draft
- `GET /invoice/:id` - Get invoice details
- `GET /invoices` - List invoices
- `GET /health` - Health check with Odoo connection status

**Features:**
- JSON-RPC API communication
- Partner (customer) management
- Invoice draft creation
- Financial data retrieval
- Automatic authentication

**Odoo Models Used:**
- `res.partner` - Customer/contact management
- `account.move` - Invoice management

#### Social MCP (Port 3003)

**Technology:** Express.js + Platform APIs
**Platforms:** Facebook, Instagram, Twitter/X

**Endpoints:**
- `POST /facebook/post` - Create Facebook post
- `POST /instagram/post` - Create Instagram post
- `POST /twitter/post` - Create tweet
- `POST /post/multi` - Multi-platform posting
- `GET /health` - Health check with platform status

**Features:**
- Multi-platform posting
- Automatic content summarization
- Platform-specific formatting
- Character limit handling

### 4. Obsidian Vault Workflow

**Folder Structure:**

```
vault/
├── Needs_Action/     # Incoming tasks (from email, manual)
├── Plans/            # Tasks being planned
├── Pending_Approval/ # Tasks awaiting user approval
├── Approved/         # Approved tasks ready for execution
├── Done/             # Completed tasks (archive)
├── Rejected/         # Rejected or cancelled tasks
├── Logs/             # System operation logs
├── Briefings/        # CEO briefings and reports
├── Queue/            # Task queue management
├── Business_Goals.md # Business objectives
├── Company_Handbook.md
└── Dashboard.md      # Status overview
```

**Task Lifecycle:**

1. **Intake:** Task arrives in `Needs_Action/`
2. **Routing:** action-router skill analyzes and categorizes
3. **Planning:** Complex tasks moved to `Plans/`
4. **Approval:** If needed, moved to `Pending_Approval/`
5. **Execution:** Approved tasks processed
6. **Completion:** file-mover moves to `Done/`

### 5. CEO Briefing System

**Script:** `scripts/generate-ceo-briefing.js`
**Schedule:** Weekly (Sunday recommended)

**Data Sources:**
- Business_Goals.md
- Done/ folder (completed tasks)
- Odoo financial data (via MCP)

**Output:**
- Comprehensive weekly report
- Task completion analysis
- Financial metrics
- System health status
- Recommendations

**Sections:**
1. Executive Summary
2. Business Goals Status
3. Task Completion Analysis
4. Financial & Accounting Overview
5. System Health & Operations
6. Next Week Priorities

### 6. Error Recovery & Graceful Degradation

**Strategies:**

1. **MCP Server Failures:**
   - Health check endpoints
   - Timeout handling
   - Fallback to manual processing
   - Detailed error logging

2. **API Failures:**
   - Retry logic with exponential backoff
   - Authentication refresh
   - Graceful error messages

3. **Task Processing Errors:**
   - Error captured in logs
   - Task remains in current state
   - User notification
   - Manual intervention option

4. **Data Integrity:**
   - Atomic file operations
   - Backup before modifications
   - Transaction-like behavior

### 7. Audit Logging

**Log Files:**
- `logs/email-mcp.log` - Email operations
- `logs/odoo-mcp.log` - Odoo operations
- `logs/social-mcp.log` - Social media operations
- `logs/ceo-briefing.log` - Briefing generation
- `logs/orchestrator.log` - Main orchestration

**Log Format:**
```
[ISO-8601 Timestamp] LEVEL: Message
```

**Levels:**
- INFO: Normal operations
- WARNING: Non-critical issues
- ERROR: Failures requiring attention
- SUCCESS: Successful completions

## Data Flow Examples

### Example 1: Email to Invoice

1. Email arrives: "Create invoice for ABC Corp - $5,000"
2. Gmail watcher detects email
3. Email saved to `Needs_Action/email_2026-02-23_Invoice.md`
4. action-router detects "invoice" keyword
5. Claude processes email content
6. Odoo MCP called: `POST /create_invoice`
7. Invoice draft created in Odoo
8. Task moved to `Done/`
9. Logged in `odoo-mcp.log`

### Example 2: Multi-Platform Social Post

1. User creates task: "Post announcement to all platforms"
2. Task in `Needs_Action/`
3. action-router identifies social media task
4. Claude generates platform-optimized content
5. Social MCP called: `POST /post/multi`
6. Posts created on Facebook, Instagram, Twitter
7. Results logged
8. Task moved to `Done/`

### Example 3: Weekly CEO Briefing

1. Sunday trigger (manual or cron)
2. Script runs: `node scripts/generate-ceo-briefing.js`
3. Reads Business_Goals.md
4. Analyzes Done/ folder
5. Fetches Odoo financial data
6. Generates comprehensive report
7. Saves to `Briefings/CEO_Briefing_2026_W08.md`
8. Available for review

## Deployment

### Prerequisites

- Node.js 18+
- Docker Desktop
- Gmail OAuth2 credentials
- Odoo 19 (via Docker)
- Social media API credentials (optional)

### Setup Steps

1. **Clone and Install:**
   ```bash
   cd hackathon-0
   cd mcp-servers
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start Odoo:**
   ```bash
   docker-compose up -d
   # Access: http://localhost:8069
   ```

4. **Start MCP Servers:**
   ```bash
   npm run start:all
   # Or individually:
   npm run start:email
   npm run start:odoo
   npm run start:social
   ```

5. **Configure Gmail OAuth:**
   - Place credentials in `credentials/gmail_credentials.json`
   - Run authentication flow
   - Token saved to `credentials/token.json`

6. **Test Integration:**
   ```bash
   curl http://localhost:3001/health
   curl http://localhost:3002/health
   curl http://localhost:3003/health
   ```

### Production Considerations

1. **Security:**
   - Use environment variables for all credentials
   - Enable HTTPS for MCP servers
   - Implement rate limiting
   - Regular security audits

2. **Reliability:**
   - Process manager (PM2, systemd)
   - Automatic restart on failure
   - Health monitoring
   - Backup strategies

3. **Scalability:**
   - Horizontal scaling for MCP servers
   - Database optimization (Odoo)
   - Caching layer
   - Load balancing

4. **Monitoring:**
   - Log aggregation (ELK stack)
   - Metrics collection (Prometheus)
   - Alerting (PagerDuty, Slack)
   - Performance tracking

## Lessons Learned

### What Worked Well

1. **Modular Architecture:** Separation of concerns via MCP servers
2. **Obsidian Vault:** File-based workflow is simple and transparent
3. **Claude Code Skills:** Custom skills enable autonomous operation
4. **Docker for Odoo:** Easy setup and isolation
5. **Comprehensive Logging:** Essential for debugging and auditing

### Challenges

1. **OAuth2 Complexity:** Gmail authentication requires careful setup
2. **Odoo Learning Curve:** JSON-RPC API documentation sparse
3. **Error Handling:** Requires extensive testing across failure modes
4. **State Management:** File-based state can have race conditions
5. **API Rate Limits:** Social media APIs have strict limits

### Future Improvements

1. **Database Backend:** Replace file-based state with PostgreSQL
2. **Queue System:** Redis or RabbitMQ for task queue
3. **Web Dashboard:** Real-time monitoring UI
4. **Mobile App:** Push notifications and mobile control
5. **AI Model Fine-tuning:** Custom model for specific business domain
6. **Multi-tenant:** Support multiple users/businesses
7. **Advanced Analytics:** ML-based insights and predictions
8. **Voice Interface:** Alexa/Google Home integration

## Maintenance

### Daily Tasks

- Monitor MCP server logs
- Check task completion rate
- Verify Odoo connection

### Weekly Tasks

- Review CEO briefing
- Analyze task patterns
- Update business goals
- Clean up old logs

### Monthly Tasks

- Security updates
- Performance optimization
- Backup verification
- Capacity planning

## Support & Troubleshooting

### Common Issues

**MCP Server Won't Start:**
- Check port availability
- Verify dependencies installed
- Review error logs

**Odoo Connection Failed:**
- Ensure Docker containers running
- Verify credentials in .env
- Check network connectivity

**Email Integration Issues:**
- Refresh OAuth2 token
- Check Gmail API quotas
- Verify credentials file

**Task Not Processing:**
- Check ralph-wiggum loop status
- Review orchestrator logs
- Verify file permissions

### Debug Mode

Enable verbose logging:
```bash
DEBUG=* node mcp-servers/email-mcp.js
```

## Conclusion

The Gold Tier Personal AI Employee represents a fully integrated autonomous system capable of managing personal and business operations across multiple domains. The modular architecture, comprehensive logging, and error recovery mechanisms ensure reliable operation while maintaining transparency and user control.
