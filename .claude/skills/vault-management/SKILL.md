---
name: vault-management
version: 0.1
tier: bronze
description: Core skill for managing Obsidian vault structure and file organization
capabilities:
  - Create and organize markdown files in vault folders
  - Move files between vault status folders
  - Maintain vault folder structure integrity
  - Read and parse vault markdown files
  - Generate status reports from vault contents
when_to_use: When the task involves creating, moving, or organizing files within the Obsidian vault
safety_rules:
  - Never perform external actions without approval file
  - Always move completed tasks to /Done/
  - Log every step in /Logs/
---

# Skill Constitution
- Rule 1: Never modify files outside the vault/ directory without explicit user permission
- Rule 2: Always preserve markdown frontmatter when moving or editing vault files
- Rule 3: Maintain the folder hierarchy: Needs_Action → Plans → Pending_Approval → Approved → Done
- Rule 4: Log all file operations to vault/Logs/ with timestamp in ISO 8601 format
- Rule 5: Never delete files; only move them to appropriate status folders
- Rule 6: Validate folder structure exists before performing operations
- Rule 7: Create backup references when moving files between folders
- Rule 8: Always read a file before editing it to preserve existing content
- Rule 9: Use descriptive filenames with timestamps for log entries (YYYY-MM-DD_operation.md)
- Rule 10: Verify file operations succeeded by checking file existence after write/move

# Core Functions I Can Perform

## File Reading Operations
```
Read tool: Read vault files to analyze content
- Read("vault/Needs_Action/task-001.md")
- Parse frontmatter and content
- Extract task metadata
```

## File Writing Operations
```
Write tool: Create new vault files
- Write("vault/Plans/plan-2026-02-16.md", content)
- Always include proper frontmatter
- Use markdown formatting
```

## File Moving Operations
```
Bash tool: Move files between workflow folders
- mv "vault/Approved/task-001.md" "vault/Done/task-001.md"
- Update file metadata after move
- Log the operation
```

## File Listing Operations
```
Bash tool: List files in vault folders
- ls vault/Needs_Action/
- find vault/ -name "*.md" -type f
- Get file counts per folder
```

## Logging Operations
```
Write tool: Create log entries
- Write("vault/Logs/2026-02-16_file-operations.md", log_content)
- Include timestamp, operation, source, destination, status
```

## Example Tool Call Pattern
```
# Step 1: Read existing file
Read("vault/Needs_Action/task-001.md")

# Step 2: Process and create plan
Write("vault/Plans/plan-task-001.md", plan_content)

# Step 3: Move original to Plans folder
Bash: mv "vault/Needs_Action/task-001.md" "vault/Plans/task-001.md"

# Step 4: Log the operation
Write("vault/Logs/2026-02-16_operations.md", log_entry)
```

# How to activate this skill
Invoke this skill when you need to organize tasks, create new vault entries, or move files through the workflow pipeline. Use for any vault file system operations.
