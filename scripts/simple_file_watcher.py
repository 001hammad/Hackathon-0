#!/usr/bin/env python3
"""
Simple File Watcher for Personal AI Employee
Monitors vault/Needs_Action/ folder for new markdown files
"""

import os
import sys
import time
import logging
import subprocess
from datetime import datetime
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configure logging
LOG_DIR = Path(__file__).parent.parent / "logs"
LOG_DIR.mkdir(exist_ok=True)
LOG_FILE = LOG_DIR / "watcher.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)

# Define the directory to watch
VAULT_DIR = Path(__file__).parent.parent / "vault"
WATCH_DIR = VAULT_DIR / "Needs_Action"
QUEUE_FILE = VAULT_DIR / "Queue" / "pending_tasks.md"


class MarkdownFileHandler(FileSystemEventHandler):
    """Handler for markdown file events in Needs_Action folder"""

    def __init__(self):
        super().__init__()
        logger.info("MarkdownFileHandler initialized")

    def append_to_queue(self, task_id, priority, source, created, prompt, file_path):
        """Append a task to the queue file"""
        try:
            # Ensure queue file exists
            QUEUE_FILE.parent.mkdir(parents=True, exist_ok=True)
            if not QUEUE_FILE.exists():
                QUEUE_FILE.touch()

            # Build task entry
            task_entry = f"""
---
task_id: {task_id}
priority: {priority}
source: {source}
created: {created}
---
Prompt: {prompt}
File: {file_path}
---
"""

            # Append to queue file
            with open(QUEUE_FILE, 'a', encoding='utf-8') as f:
                f.write(task_entry)

            logger.info(f"Task {task_id} appended to queue")
            return True

        except Exception as e:
            logger.error(f"Failed to append task to queue: {e}", exc_info=True)
            return False

    def on_created(self, event):
        """Called when a file or directory is created"""
        # Ignore directory creation events
        if event.is_directory:
            return

        # Only process markdown files
        if not event.src_path.endswith('.md'):
            return

        try:
            file_path = Path(event.src_path)
            file_name = file_path.name
            timestamp = datetime.now().isoformat()

            logger.info(f"NEW TASK DETECTED: {file_name}")
            logger.info(f"  Path: {file_path}")
            logger.info(f"  Time: {timestamp}")

            # Read file content to check priority
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except Exception as read_error:
                logger.error(f"Failed to read file {file_name}: {read_error}")
                return

            # Check if this is a high priority task
            is_high_priority = any(keyword in content.lower() for keyword in [
                'priority: high',
                'type: task',
                'urgent'
            ])

            if is_high_priority:
                # Build Claude prompt
                claude_prompt = f"""You are my AI Employee.
New task: {file_path}
Read fully.
Follow Company_Handbook.md.
If needed, plan in Plans/.
If sensitive, create Pending_Approval/ file.
When complete: move to Done/."""

                # Generate task ID
                task_id = f"task_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

                # Append to queue
                queue_success = self.append_to_queue(
                    task_id=task_id,
                    priority='high',
                    source='file',
                    created=timestamp,
                    prompt=claude_prompt,
                    file_path=str(file_path)
                )

                # Log to console for visibility
                print(f"\n{'='*60}")
                print(f"[!] HIGH PRIORITY TASK DETECTED!")
                print(f"{'='*60}")
                print(f"Task ID: {task_id}")
                print(f"File: {file_name}")
                print(f"Path: {file_path}")
                print(f"Time: {timestamp}")
                print(f"Queue Status: {'✅ Added to queue' if queue_success else '❌ Failed to queue'}")
                print(f"\n[*] Claude prompt:")
                print(f"{'-'*60}")
                print(claude_prompt)
                print(f"{'-'*60}")
                print(f"{'='*60}\n")

                logger.info(f"High priority task {task_id} -> Added to queue with prompt: {claude_prompt}")

            else:
                logger.info(f"Ignored low-priority file: {file_name}")
                print(f"[INFO] Ignored low-priority file: {file_name}")

        except Exception as e:
            logger.error(f"Error processing file creation: {e}", exc_info=True)

    def on_modified(self, event):
        """Called when a file or directory is modified"""
        if event.is_directory or not event.src_path.endswith('.md'):
            return

        file_name = Path(event.src_path).name
        logger.debug(f"File modified: {file_name}")

    def on_deleted(self, event):
        """Called when a file or directory is deleted"""
        if event.is_directory or not event.src_path.endswith('.md'):
            return

        file_name = Path(event.src_path).name
        logger.info(f"File deleted: {file_name}")


def validate_directories():
    """Validate that required directories exist"""
    if not VAULT_DIR.exists():
        logger.error(f"Vault directory not found: {VAULT_DIR}")
        return False

    if not WATCH_DIR.exists():
        logger.error(f"Watch directory not found: {WATCH_DIR}")
        logger.info("Creating Needs_Action directory...")
        WATCH_DIR.mkdir(parents=True, exist_ok=True)

    logger.info(f"Watching directory: {WATCH_DIR}")
    return True


def main():
    """Main function to start the file watcher"""
    logger.info("="*60)
    logger.info("Personal AI Employee - File Watcher Starting")
    logger.info("="*60)

    # Validate directories
    if not validate_directories():
        logger.error("Directory validation failed. Exiting.")
        sys.exit(1)

    # Create event handler and observer
    event_handler = MarkdownFileHandler()
    observer = Observer()
    observer.schedule(event_handler, str(WATCH_DIR), recursive=False)

    try:
        # Start the observer
        observer.start()
        logger.info("File watcher started successfully")
        logger.info(f"Monitoring: {WATCH_DIR}")
        logger.info("Press Ctrl+C to stop")

        # Keep the script running
        while True:
            time.sleep(1)

    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received. Stopping watcher...")
        observer.stop()

    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        observer.stop()
        sys.exit(1)

    finally:
        observer.join()
        logger.info("File watcher stopped")
        logger.info("="*60)


if __name__ == "__main__":
    main()
