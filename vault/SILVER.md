---
tier: Silver
status: In Progress
date: 2026-02-18
goals:
  - Queue system for task queuing
  - Orchestrator polling
  - Gmail watcher integration
  - Email MCP basic setup
---

# Silver Tier - Hackathon-0

## Overview
Silver Tier adds multi-source task ingestion, queue management, and basic orchestration.

## Components

### 1. Queue System
- **Location:** `vault/Queue/pending_tasks.md`
- **Purpose:** Central queue for tasks from multiple sources
- **Format:** Structured markdown with task metadata

### 2. Orchestrator
- **Script:** `scripts/orchestrator.py`
- **Function:** Polls queue every 30 seconds
- **Action:** Logs pending tasks and instructs manual Claude invocation
- **Status:** ✅ Implemented

### 3. Gmail Watcher
- **Script:** `scripts/gmail_watcher.py`
- **Function:** Polls Gmail for important unread emails
- **Action:** Creates task files in `Needs_Action/`
- **Status:** ✅ Skeleton implemented (requires OAuth setup)

### 4. Modified File Watcher
- **Script:** `scripts/simple_file_watcher.py`
- **Enhancement:** Now appends high-priority tasks to queue
- **Status:** ✅ Implemented

## Setup Requirements

### Gmail API Setup
1. Enable Gmail API in Google Cloud Console
2. Download OAuth credentials
3. Place in `credentials/token.json`
4. Install dependencies:
   ```bash
   pip install google-api-python-client google-auth
   ```

### Running Components
```bash
# Terminal 1: File Watcher
python scripts/simple_file_watcher.py

# Terminal 2: Orchestrator
python scripts/orchestrator.py

# Terminal 3: Gmail Watcher (optional)
python scripts/gmail_watcher.py
```

## Next Steps
1. Modify file watcher to append to queue
2. Set up Gmail OAuth credentials
3. Implement basic email MCP server
4. Add human-in-the-loop approval workflow
5. Implement basic scheduling

## Human-in-the-Loop Workflow
- Tasks requiring approval go to `Pending_Approval/`
- User reviews and approves/rejects
- Approved tasks move to queue for processing

## Success Criteria
- [x] Queue system created
- [x] Orchestrator polling implemented
- [x] Gmail watcher skeleton added
- [x] File watcher modified to use queue
- [ ] Email MCP server basic setup
- [ ] At least one end-to-end workflow tested

## Current Status
**Queue System:** ✅ Fully Implemented
- File watcher detects high-priority tasks
- Tasks automatically appended to `vault/Queue/pending_tasks.md`
- Orchestrator polls queue every 30 seconds
- Manual Claude invocation instructions provided

**Ready for Testing:** Create a high-priority file in `vault/Needs_Action/` and run orchestrator to see the workflow in action.

---
*Silver Tier Started: 2026-02-18*
