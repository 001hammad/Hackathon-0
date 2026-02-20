#!/usr/bin/env python3
"""
Orchestrator - Silver Tier
Polls vault/Queue/pending_tasks.md and processes queued tasks
"""

import os
import sys
import time
import logging
from datetime import datetime
from pathlib import Path

# Configure logging
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "orchestrator.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Paths
VAULT_DIR = Path(__file__).parent.parent / "vault"
QUEUE_FILE = VAULT_DIR / "Queue" / "pending_tasks.md"
POLL_INTERVAL = 30  # seconds


def parse_pending_tasks(content):
    """Parse pending_tasks.md and extract task entries (both email and file formats)"""
    import re

    tasks = []

    # Split by --- separator
    sections = content.split('---')

    for section in sections:
        section = section.strip()
        if not section or section == '# Pending Tasks Queue':
            continue

        # Check if this is an email task
        if section.startswith('## Email Task'):
            task = parse_email_task(section)
            if task:
                tasks.append(task)
        # Check if this is a file task
        elif 'task_id:' in section or 'task_id :' in section:
            task = parse_file_task(section)
            if task:
                tasks.append(task)

    return tasks


def parse_email_task(section):
    """Parse email-watcher task format"""
    import re

    task = {'type': 'email'}

    # Extract subject from heading: ## Email Task - [subject]
    subject_match = re.search(r'## Email Task - (.+)', section)
    if subject_match:
        task['subject'] = subject_match.group(1).strip()
    else:
        task['subject'] = 'Unknown Subject'

    # Extract fields with **Field:** format
    lines = section.split('\n')
    for line in lines:
        line = line.strip()

        # Match **Field:** value or **Field:** `value`
        if line.startswith('**Type:**'):
            task['email_type'] = line.split('**Type:**', 1)[1].strip().strip('`')
        elif line.startswith('**From:**'):
            task['from'] = line.split('**From:**', 1)[1].strip()
        elif line.startswith('**Priority:**'):
            task['priority'] = line.split('**Priority:**', 1)[1].strip().lower()
        elif line.startswith('**File:**'):
            # Extract file path, removing backticks if present
            file_val = line.split('**File:**', 1)[1].strip()
            task['file_path'] = file_val.strip('`').strip()
        elif line.startswith('**Created:**'):
            task['created'] = line.split('**Created:**', 1)[1].strip()
        elif line.startswith('**Snippet:**'):
            task['snippet'] = line.split('**Snippet:**', 1)[1].strip()

    # For email tasks, prompt might be in the snippet or we generate one
    if 'snippet' in task:
        task['prompt'] = f"Process email: {task.get('subject', 'Unknown')} - {task['snippet'][:100]}"
    else:
        task['prompt'] = f"Process email: {task.get('subject', 'Unknown')}"

    # Validate essential fields
    if 'file_path' not in task:
        return None

    return task


def parse_file_task(section):
    """Parse file-watcher task format"""
    task = {'type': 'file'}

    lines = section.split('\n')
    for line in lines:
        line = line.strip()

        if line.startswith('task_id:') or line.startswith('task_id :'):
            task['task_id'] = line.split(':', 1)[1].strip()
        elif line.startswith('priority:') or line.startswith('priority :'):
            task['priority'] = line.split(':', 1)[1].strip().lower()
        elif line.startswith('source:') or line.startswith('source :'):
            task['source'] = line.split(':', 1)[1].strip()
        elif line.startswith('created:') or line.startswith('created :'):
            task['created'] = line.split(':', 1)[1].strip()
        elif line.startswith('Prompt:') or line.startswith('Prompt :'):
            task['prompt'] = line.split(':', 1)[1].strip()
        elif line.startswith('File:') or line.startswith('File :'):
            task['file_path'] = line.split(':', 1)[1].strip()

    # Validate essential fields
    if 'file_path' not in task:
        return None

    # Set defaults
    if 'priority' not in task:
        task['priority'] = 'normal'
    if 'prompt' not in task:
        task['prompt'] = 'No prompt specified'

    return task


def sanitize_for_console(text):
    """Remove or replace characters that can't be encoded in console"""
    if not text:
        return text
    # Try to encode with console encoding, replace problematic chars
    try:
        return text.encode(sys.stdout.encoding or 'utf-8', errors='replace').decode(sys.stdout.encoding or 'utf-8')
    except:
        # Fallback: remove non-ASCII characters
        return ''.join(char if ord(char) < 128 else '?' for char in text)


def process_tasks(tasks):
    """Process pending tasks - for now, just log and instruct user"""
    if not tasks:
        logger.debug("No pending tasks found")
        return

    logger.info(f"Found {len(tasks)} pending task(s)")

    for i, task in enumerate(tasks, 1):
        task_type = task.get('type', 'unknown')
        priority = task.get('priority', 'normal')
        prompt = sanitize_for_console(task.get('prompt', 'No prompt'))
        file_path = task.get('file_path', 'No file')

        # Determine display name based on task type
        if task_type == 'email':
            display_name = sanitize_for_console(task.get('subject', 'Unknown Subject'))
        else:
            display_name = file_path

        print(f"\n{'='*70}")
        print(f"[PENDING TASK] Type: {task_type} | Subject/File: {display_name}")
        print(f"Priority: {priority}")
        print(f"File: {file_path}")
        print(f"Prompt: {prompt}")
        print(f"\n[ACTION REQUIRED]")
        print(f"Run manually: claude --prompt \"{prompt}\"")
        print(f"{'='*70}\n")

        logger.info(f"Task #{i} ({task_type}): {display_name}")


def remove_processed_tasks():
    """Clear processed tasks from queue (for now, manual)"""
    # In Silver tier, we'll manually clear tasks
    # In Gold tier, this will be automated
    pass


def main():
    """Main orchestrator loop"""
    logger.info("="*70)
    logger.info("Orchestrator Starting - Silver Tier")
    logger.info("="*70)
    logger.info(f"Polling: {QUEUE_FILE}")
    logger.info(f"Interval: {POLL_INTERVAL} seconds")
    logger.info("Press Ctrl+C to stop")

    # Validate queue file exists
    if not QUEUE_FILE.exists():
        logger.error(f"Queue file not found: {QUEUE_FILE}")
        logger.info("Creating queue file...")
        QUEUE_FILE.parent.mkdir(parents=True, exist_ok=True)
        QUEUE_FILE.touch()

    try:
        while True:
            try:
                # Read queue file
                with open(QUEUE_FILE, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Parse and process tasks
                tasks = parse_pending_tasks(content)
                process_tasks(tasks)

            except Exception as e:
                logger.error(f"Error processing queue: {e}", exc_info=True)

            # Wait before next poll
            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        logger.info("\nKeyboard interrupt received. Stopping orchestrator...")

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        sys.exit(1)

    finally:
        logger.info("Orchestrator stopped")
        logger.info("="*70)


if __name__ == "__main__":
    main()
