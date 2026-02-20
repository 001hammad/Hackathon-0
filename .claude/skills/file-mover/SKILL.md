---
name: file-mover
version: 0.1
tier: bronze
description: Core skill for moving completed tasks to Done folder and maintaining workflow state
capabilities:
  - Move files between vault status folders
  - Update file metadata on status changes
  - Archive completed tasks to Done folder
  - Maintain audit trail of file movements
  - Clean up temporary or obsolete files
when_to_use: When the task involves marking work as complete or changing task status
safety_rules:
  - Never perform external actions without approval file
  - Always move completed tasks to /Done/
  - Log every step in /Logs/
---

# Skill Constitution
- Rule 1: Always check file type before moving - only move .md files within vault/
- Rule 2: Claim task by moving from Needs_Action/ to In_Progress/file-mover/ (claim-by-move pattern)
- Rule 3: On successful completion, move file from In_Progress/ to Done/
- Rule 4: For sensitive actions (payments, external comms), move to Pending_Approval/ and stop
- Rule 5: When file appears in Approved/, trigger the action then move to Done/
- Rule 6: Never delete or overwrite files - only move them between folders
- Rule 7: Log every move to vault/Logs/moves.log with timestamp, source, destination, reason
- Rule 8: On error or failure, move file to Rejected/ with error note in frontmatter
- Rule 9: Verify destination folder exists before moving; create if needed
- Rule 10: Preserve original file content and metadata during all moves

# How to activate this skill
Invoke this skill when a task is completed and needs to be archived, or when changing the status of any task file in the workflow.
