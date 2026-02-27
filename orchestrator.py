#!/usr/bin/env python3
"""
Orchestrator for processing pending tasks from pending_tasks.md
Handles both file-watcher and email-watcher task formats
Implements Ralph Wiggum autonomous loop for automatic task completion
"""

import re
import subprocess
import time
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime


class TaskParser:
    """Parser for pending_tasks.md supporting multiple task formats"""

    def __init__(self, pending_tasks_path: str):
        self.pending_tasks_path = Path(pending_tasks_path)

    def parse_tasks(self) -> List[Dict[str, str]]:
        """Parse all tasks from pending_tasks.md"""
        if not self.pending_tasks_path.exists():
            print(f"[WARNING] File not found: {self.pending_tasks_path}")
            return []

        content = self.pending_tasks_path.read_text(encoding='utf-8')

        # Split by --- separator or by ## Email Task headings
        task_sections = self._split_into_sections(content)

        tasks = []
        for section in task_sections:
            section = section.strip()
            if not section or section == "# Pending Tasks Queue":
                continue

            task = self._parse_section(section)
            if task:
                tasks.append(task)

        return tasks

    def _split_into_sections(self, content: str) -> List[str]:
        """Split content into task sections"""
        # First try splitting by ---
        sections = re.split(r'\n---+\n', content)

        # If we have sections with ## Email Task, further split those
        final_sections = []
        for section in sections:
            # Check if this section contains multiple email tasks
            email_tasks = re.split(r'(?=\n## Email Task)', section)
            final_sections.extend(email_tasks)

        return final_sections

    def _parse_section(self, section: str) -> Optional[Dict[str, str]]:
        """Parse a single task section (email or file format)"""
        lines = section.strip().split('\n')

        # Detect task type
        if any(line.startswith('## Email Task') for line in lines):
            return self._parse_email_task(section)
        else:
            return self._parse_file_task(section)

    def _parse_email_task(self, section: str) -> Optional[Dict[str, str]]:
        """Parse email-watcher task format"""
        task = {'type': 'email'}

        # Extract subject from heading
        subject_match = re.search(r'## Email Task - (.+)', section)
        if subject_match:
            task['subject'] = subject_match.group(1).strip()

        # Extract fields
        task['type_field'] = self._extract_field(section, 'Type')
        task['from'] = self._extract_field(section, 'From')
        task['priority'] = self._extract_field(section, 'Priority', default='normal')
        task['file'] = self._extract_field(section, 'File')
        task['created'] = self._extract_field(section, 'Created')
        task['snippet'] = self._extract_field(section, 'Snippet')

        # Extract prompt (could be in various formats)
        task['prompt'] = self._extract_prompt(section)

        # Validate essential fields
        if not task.get('file'):
            return None

        return task

    def _parse_file_task(self, section: str) -> Optional[Dict[str, str]]:
        """Parse file-watcher task format"""
        task = {'type': 'file'}

        # Extract fields
        task['task_id'] = self._extract_field(section, 'task_id')
        task['priority'] = self._extract_field(section, 'priority', default='normal')
        task['source'] = self._extract_field(section, 'source')
        task['created'] = self._extract_field(section, 'created')
        task['file'] = self._extract_field(section, 'File')

        # Extract prompt
        task['prompt'] = self._extract_prompt(section)

        # Validate essential fields
        if not task.get('file'):
            return None

        return task

    def _extract_field(self, text: str, field_name: str, default: str = '') -> str:
        """Extract a field value from text (handles various formats)"""
        # Try "Field: value" format
        pattern1 = rf'^{field_name}:\s*(.+)$'
        match = re.search(pattern1, text, re.MULTILINE | re.IGNORECASE)
        if match:
            return match.group(1).strip()

        # Try "**Field:** value" format
        pattern2 = rf'\*\*{field_name}:\*\*\s*(.+)$'
        match = re.search(pattern2, text, re.MULTILINE | re.IGNORECASE)
        if match:
            return match.group(1).strip()

        return default

    def _extract_prompt(self, text: str) -> str:
        """Extract prompt text from various formats"""
        # Try "Prompt: ..." format
        prompt_match = re.search(r'Prompt:\s*(.+?)(?:\n[A-Z][a-z]+:|$)', text, re.DOTALL | re.IGNORECASE)
        if prompt_match:
            return prompt_match.group(1).strip()

        # Try code block format
        code_block_match = re.search(r'```(?:\w+)?\n(.+?)\n```', text, re.DOTALL)
        if code_block_match:
            return code_block_match.group(1).strip()

        # Try to find any quoted text
        quote_match = re.search(r'"(.+?)"', text, re.DOTALL)
        if quote_match:
            return quote_match.group(1).strip()

        return ''


class TaskOrchestrator:
    """Main orchestrator for processing pending tasks with Ralph Wiggum autonomous loop"""

    def __init__(self, vault_path: str = "vault", max_iterations: int = 15):
        self.vault_path = Path(vault_path)
        self.pending_tasks_file = self.vault_path / "Queue" / "pending_tasks.md"
        self.done_path = self.vault_path / "Done"
        self.parser = TaskParser(str(self.pending_tasks_file))
        self.max_iterations = max_iterations
        self.log_file = Path("logs") / "orchestrator.log"
        self.log_file.parent.mkdir(exist_ok=True)

    def log(self, message: str):
        """Log message to file and console"""
        timestamp = datetime.now().isoformat()
        log_message = f"[{timestamp}] {message}\n"
        print(log_message.strip())
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(log_message)

    def check_task_complete(self, task: Dict[str, str]) -> bool:
        """Check if task file has been moved to Done/ folder"""
        task_file = task.get('file', '')
        if not task_file:
            return False

        # Check if file exists in Done/ folder
        filename = Path(task_file).name
        done_file = self.done_path / filename

        return done_file.exists()

    def run_claude_with_prompt(self, prompt: str, task_file: str) -> tuple[bool, str]:
        """Run Claude with the given prompt and return success status and output"""
        try:
            self.log(f"Running Claude with prompt: {prompt[:100]}...")

            # Build Claude command
            cmd = ['claude', '--prompt', prompt]

            # Run Claude command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )

            output = result.stdout + result.stderr

            # Check for completion promise
            if '<promise>TASK_COMPLETE</promise>' in output:
                self.log("✅ Task marked as COMPLETE by Claude")
                return True, output

            # Check if file moved to Done/
            if self.check_task_complete({'file': task_file}):
                self.log("✅ Task file moved to Done/ folder")
                return True, output

            return False, output

        except subprocess.TimeoutExpired:
            self.log("⚠️ Claude command timed out")
            return False, "Command timed out"
        except Exception as e:
            self.log(f"❌ Error running Claude: {str(e)}")
            return False, str(e)

    def process_task_with_ralph_wiggum(self, task: Dict[str, str]) -> bool:
        """Process a single task using Ralph Wiggum autonomous loop"""
        task_type = task.get('type', 'unknown')
        task_name = task.get('subject', task.get('file', 'Unknown'))
        task_file = task.get('file', '')
        prompt = task.get('prompt', '')

        if not prompt:
            self.log(f"⚠️ No prompt found for task: {task_name}")
            return False

        self.log("=" * 80)
        self.log(f"🤖 RALPH WIGGUM LOOP STARTED")
        self.log(f"Task: {task_name}")
        self.log(f"Type: {task_type}")
        self.log(f"File: {task_file}")
        self.log("=" * 80)

        iteration = 0
        completed = False

        while iteration < self.max_iterations and not completed:
            iteration += 1
            self.log(f"\n--- Iteration {iteration}/{self.max_iterations} ---")

            # Check if already complete before running
            if self.check_task_complete(task):
                self.log("✅ Task already completed (file in Done/)")
                completed = True
                break

            # Run Claude with the prompt
            success, output = self.run_claude_with_prompt(prompt, task_file)

            if success:
                self.log(f"✅ Task completed successfully in {iteration} iteration(s)")
                completed = True
                break
            else:
                self.log(f"⏳ Task not yet complete, continuing...")
                time.sleep(2)  # Brief pause between iterations

        if not completed:
            self.log(f"⚠️ Task did not complete after {self.max_iterations} iterations")
            self.log(f"   Manual intervention may be required")

        self.log("=" * 80)
        self.log(f"🤖 RALPH WIGGUM LOOP ENDED")
        self.log("=" * 80)

        return completed

    def run(self, autonomous: bool = False):
        """Main orchestration loop

        Args:
            autonomous: If True, automatically process tasks with Ralph Wiggum loop
        """
        self.log("=" * 80)
        self.log("TASK ORCHESTRATOR - Scanning for pending tasks...")
        self.log("=" * 80)
        print()

        tasks = self.parser.parse_tasks()

        if not tasks:
            self.log("[INFO] No pending tasks found.")
            return

        self.log(f"[INFO] Found {len(tasks)} pending task(s)\n")

        if autonomous:
            self.log("🤖 AUTONOMOUS MODE ENABLED - Ralph Wiggum will process tasks automatically")
            print()

            for i, task in enumerate(tasks, 1):
                self.log(f"\n{'='*80}")
                self.log(f"Processing Task {i}/{len(tasks)}")
                self.log(f"{'='*80}")
                self._display_task(i, task)
                print()

                # Process with Ralph Wiggum loop
                success = self.process_task_with_ralph_wiggum(task)

                if success:
                    self.log(f"✅ Task {i} completed successfully")
                else:
                    self.log(f"⚠️ Task {i} requires manual attention")

                print()
        else:
            # Manual mode - just display tasks
            for i, task in enumerate(tasks, 1):
                self._display_task(i, task)
                print()

        self.log("=" * 80)
        self.log(f"[SUMMARY] Total pending tasks: {len(tasks)}")
        if autonomous:
            completed = sum(1 for task in tasks if self.check_task_complete(task))
            self.log(f"[SUMMARY] Completed: {completed}/{len(tasks)}")
        self.log("=" * 80)

    def _display_task(self, index: int, task: Dict[str, str]):
        """Display task information in formatted output"""
        task_type = task.get('type', 'unknown')

        # Determine display name
        if task_type == 'email':
            display_name = task.get('subject', 'Unknown Subject')
        else:
            display_name = task.get('file', 'Unknown File')

        priority = task.get('priority', 'normal').lower()
        file_path = task.get('file', 'N/A')
        prompt = task.get('prompt', 'No prompt specified')

        print(f"[PENDING TASK #{index}] Type: {task_type} | Subject/File: {display_name}")
        print(f"  Priority: {priority}")
        print(f"  File: {file_path}")
        print(f"  Prompt: {prompt}")

        # Generate action command
        if prompt and prompt != 'No prompt specified':
            # Escape quotes in prompt for command line
            escaped_prompt = prompt.replace('"', '\\"')
            print(f'  [ACTION REQUIRED] Run manually: claude --prompt "{escaped_prompt}"')
        else:
            print(f"  [ACTION REQUIRED] Review task manually - no prompt available")


def main():
    """Entry point"""
    import sys

    # Check for autonomous mode flag
    autonomous = '--autonomous' in sys.argv or '--ralph' in sys.argv

    orchestrator = TaskOrchestrator()

    if autonomous:
        print("\n🤖 RALPH WIGGUM AUTONOMOUS MODE ACTIVATED")
        print("Tasks will be processed automatically until completion")
        print("Max iterations per task: 15")
        print("=" * 80)
        print()

    orchestrator.run(autonomous=autonomous)

    if not autonomous:
        print("\n💡 TIP: Run with --autonomous or --ralph flag to enable automatic task processing")


if __name__ == "__main__":
    main()
