---
name: action-router
version: 0.1
tier: bronze
description: Core skill for routing incoming tasks to appropriate handlers and workflows
capabilities:
  - Parse incoming task requests and classify them
  - Route tasks to appropriate skill handlers
  - Determine task priority and urgency
  - Create initial task files in Needs_Action folder
  - Validate task structure and requirements
when_to_use: When the task involves processing new requests or determining which skill should handle a task
safety_rules:
  - Never perform external actions without approval file
  - Always move completed tasks to /Done/
  - Log every step in /Logs/
---

# Skill Constitution
- Rule 1: Always create a task file in Needs_Action/ for new incoming requests
- Rule 2: Classify tasks by type: research, action, approval-required, or informational
- Rule 3: Never route tasks requiring external actions without creating approval workflow
- Rule 4: Include clear task metadata: priority, type, estimated complexity
- Rule 5: Log all routing decisions to vault/Logs/
- Rule 6: Validate task completeness before routing
- Rule 7: Create task dependencies map when multiple tasks are related
- Rule 8: Always provide routing rationale in task file

# How to activate this skill
Invoke this skill when receiving new user requests or when determining how to handle an incoming task. This is the entry point for all work items.
