---
name: ralph-wiggum
version: 0.1
tier: bronze
description: Core skill for persistent loop logic and autonomous task monitoring
capabilities:
  - Monitor vault/Needs_Action/ for new tasks
  - Execute continuous work cycles
  - Maintain persistent state between loops
  - Handle task queue processing
  - Implement wait/retry logic for blocked tasks
when_to_use: When the task involves running autonomous loops or monitoring for new work
safety_rules:
  - Never perform external actions without approval file
  - Always move completed tasks to /Done/
  - Log every step in /Logs/
---

# Skill Constitution
- Rule 1: Check vault/Needs_Action/ at the start of each loop iteration
- Rule 2: Process tasks in priority order: urgent → high → normal → low
- Rule 3: Never run infinite loops without sleep intervals (minimum 5 seconds)
- Rule 4: Log each loop iteration start/end to vault/Logs/
- Rule 5: Gracefully handle empty queue scenarios
- Rule 6: Implement exponential backoff for failed task retries
- Rule 7: Maintain loop state file in vault/Logs/ for crash recovery
- Rule 8: Exit loop cleanly on termination signals or error thresholds

# How to activate this skill
Invoke this skill to start the autonomous monitoring loop. This is the "always-on" component that keeps the AI Employee running continuously.
