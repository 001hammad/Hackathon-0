#!/usr/bin/env python3
"""
Orchestrator for processing pending tasks from pending_tasks.md
Handles both file-watcher and email-watcher task formats
"""

import re
from pathlib import Path
from typing import List, Dict, Optional


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
    """Main orchestrator for processing pending tasks"""

    def __init__(self, vault_path: str = "vault"):
        self.vault_path = Path(vault_path)
        self.pending_tasks_file = self.vault_path / "Queue" / "pending_tasks.md"
        self.parser = TaskParser(str(self.pending_tasks_file))

    def run(self):
        """Main orchestration loop"""
        print("=" * 80)
        print("TASK ORCHESTRATOR - Scanning for pending tasks...")
        print("=" * 80)
        print()

        tasks = self.parser.parse_tasks()

        if not tasks:
            print("[INFO] No pending tasks found.")
            return

        print(f"[INFO] Found {len(tasks)} pending task(s)\n")

        for i, task in enumerate(tasks, 1):
            self._display_task(i, task)
            print()

        print("=" * 80)
        print(f"[SUMMARY] Total pending tasks: {len(tasks)}")
        print("=" * 80)

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
    orchestrator = TaskOrchestrator()
    orchestrator.run()


if __name__ == "__main__":
    main()
