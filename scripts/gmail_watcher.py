#!/usr/bin/env python3
"""
Gmail Watcher - Monitors Gmail for unread important emails and creates tasks
"""

import os
import json
import time
import logging
from datetime import datetime
from pathlib import Path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Gmail API scopes - includes read, send, and compose permissions
SCOPES = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose'
]

# Paths
BASE_DIR = Path(__file__).parent.parent
CREDENTIALS_DIR = BASE_DIR / 'credentials'
CREDENTIALS_FILE = CREDENTIALS_DIR / 'gmail_credentials.json'
TOKEN_FILE = CREDENTIALS_DIR / 'token.json'
VAULT_DIR = BASE_DIR / 'vault'
NEEDS_ACTION_DIR = VAULT_DIR / 'Needs_Action'
QUEUE_DIR = VAULT_DIR / 'Queue'
PENDING_TASKS_FILE = QUEUE_DIR / 'pending_tasks.md'

# Configuration
POLL_INTERVAL = 30  # seconds
SEARCH_QUERY = 'is:unread is:important'

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(BASE_DIR / 'logs' / 'gmail_watcher.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('GmailWatcher')


class GmailWatcher:
    """Watches Gmail for unread important emails and creates tasks"""

    def __init__(self):
        self.service = None
        self.processed_ids = set()
        self._ensure_directories()

    def _ensure_directories(self):
        """Ensure required directories exist"""
        NEEDS_ACTION_DIR.mkdir(parents=True, exist_ok=True)
        QUEUE_DIR.mkdir(parents=True, exist_ok=True)
        (BASE_DIR / 'logs').mkdir(exist_ok=True)

        # Ensure pending_tasks.md exists
        if not PENDING_TASKS_FILE.exists():
            PENDING_TASKS_FILE.write_text('# Pending Tasks\n\n')
            logger.info(f"Created {PENDING_TASKS_FILE}")

    def authenticate(self):
        """Authenticate with Gmail API using OAuth"""
        creds = None

        # Load existing token if available
        if TOKEN_FILE.exists():
            try:
                creds = Credentials.from_authorized_user_file(str(TOKEN_FILE), SCOPES)
                logger.info("Loaded existing credentials from token.json")
            except Exception as e:
                logger.warning(f"Failed to load token: {e}")

        # Refresh or get new credentials
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    logger.info("Refreshing expired token...")
                    creds.refresh(Request())
                    logger.info("Token refreshed successfully")
                except Exception as e:
                    logger.error(f"Token refresh failed: {e}")
                    creds = None

            if not creds:
                if not CREDENTIALS_FILE.exists():
                    raise FileNotFoundError(
                        f"Credentials file not found: {CREDENTIALS_FILE}\n"
                        "Please download OAuth credentials from Google Cloud Console"
                    )

                logger.info("Starting OAuth flow - browser will open for login...")
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(CREDENTIALS_FILE), SCOPES
                )
                creds = flow.run_local_server(port=0)
                logger.info("OAuth flow completed successfully")

            # Save credentials for next run
            TOKEN_FILE.write_text(creds.to_json())
            logger.info(f"Saved credentials to {TOKEN_FILE}")

        self.service = build('gmail', 'v1', credentials=creds)
        logger.info("Gmail API service initialized")

    def get_unread_important_emails(self):
        """Fetch unread important emails"""
        try:
            results = self.service.users().messages().list(
                userId='me',
                q=SEARCH_QUERY,
                maxResults=10
            ).execute()

            messages = results.get('messages', [])
            logger.info(f"Found {len(messages)} unread important emails")
            return messages

        except HttpError as e:
            if e.resp.status == 429:
                logger.warning("Rate limit hit, waiting before retry...")
                time.sleep(60)
            else:
                logger.error(f"HTTP error fetching emails: {e}")
            return []
        except Exception as e:
            logger.error(f"Error fetching emails: {e}")
            return []

    def get_email_details(self, msg_id):
        """Get detailed information about an email"""
        try:
            message = self.service.users().messages().get(
                userId='me',
                id=msg_id,
                format='full'
            ).execute()

            headers = message['payload']['headers']
            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), 'No Subject')
            from_email = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            date = next((h['value'] for h in headers if h['name'] == 'Date'), '')

            snippet = message.get('snippet', '')

            return {
                'id': msg_id,
                'subject': subject,
                'from': from_email,
                'date': date,
                'snippet': snippet
            }

        except HttpError as e:
            logger.error(f"HTTP error fetching email {msg_id}: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching email {msg_id}: {e}")
            return None

    def determine_priority(self, subject, snippet):
        """Determine priority based on subject and snippet content"""
        text = f"{subject} {snippet}".lower()
        urgent_keywords = ['urgent', 'payment', 'invoice', 'asap', 'immediate', 'critical']

        for keyword in urgent_keywords:
            if keyword in text:
                return 'high'
        return 'normal'

    def create_email_task(self, email_data):
        """Create markdown file for email task"""
        timestamp = datetime.now().isoformat()
        priority = self.determine_priority(email_data['subject'], email_data['snippet'])

        # Sanitize filename
        safe_subject = "".join(c for c in email_data['subject'] if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_subject = safe_subject[:50]  # Limit length
        filename = f"email_{timestamp[:10]}_{safe_subject}.md"
        filepath = NEEDS_ACTION_DIR / filename

        # Create markdown content
        content = f"""---
type: email
from: {email_data['from']}
subject: {email_data['subject']}
received: {timestamp}
priority: {priority}
status: pending
---

# Email: {email_data['subject']}

**From:** {email_data['from']}
**Received:** {email_data['date']}
**Priority:** {priority}

## Email Content

{email_data['snippet']}

## Suggested Actions

- [ ] Reply
- [ ] Archive
- [ ] Forward
- [ ] Mark as done
"""

        filepath.write_text(content, encoding='utf-8')
        logger.info(f"Created email task file: {filename}")

        # Append to pending tasks
        self._append_to_pending_tasks(email_data, filename, priority)

        return filepath

    def _append_to_pending_tasks(self, email_data, filename, priority):
        """Append task to pending_tasks.md"""
        try:
            task_entry = f"""
## Email Task - {email_data['subject']}

**Type:** Email
**From:** {email_data['from']}
**Priority:** {priority}
**File:** `Needs_Action/{filename}`
**Created:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

**Snippet:** {email_data['snippet'][:200]}...

---

"""

            with open(PENDING_TASKS_FILE, 'a', encoding='utf-8') as f:
                f.write(task_entry)

            logger.info(f"Appended task to {PENDING_TASKS_FILE}")

        except Exception as e:
            logger.error(f"Error appending to pending tasks: {e}")

    def process_new_emails(self):
        """Process new unread important emails"""
        messages = self.get_unread_important_emails()

        new_count = 0
        for msg in messages:
            msg_id = msg['id']

            # Skip if already processed
            if msg_id in self.processed_ids:
                continue

            # Get email details
            email_data = self.get_email_details(msg_id)
            if not email_data:
                continue

            # Create task
            try:
                self.create_email_task(email_data)
                self.processed_ids.add(msg_id)
                new_count += 1
                logger.info(f"New email task created: {email_data['subject']}")
            except Exception as e:
                logger.error(f"Error creating task for email {msg_id}: {e}")

        if new_count > 0:
            logger.info(f"Processed {new_count} new emails")

        return new_count

    def run(self):
        """Main loop - poll for emails continuously"""
        logger.info("=" * 60)
        logger.info("Gmail Watcher Started")
        logger.info(f"Polling interval: {POLL_INTERVAL} seconds")
        logger.info(f"Search query: {SEARCH_QUERY}")
        logger.info("=" * 60)

        # Authenticate
        try:
            self.authenticate()
        except Exception as e:
            logger.error(f"Authentication failed: {e}")
            return

        # Main loop
        while True:
            try:
                logger.info("Checking for new emails...")
                self.process_new_emails()
                logger.info(f"Waiting {POLL_INTERVAL} seconds until next check...")
                time.sleep(POLL_INTERVAL)

            except KeyboardInterrupt:
                logger.info("Gmail Watcher stopped by user")
                break
            except Exception as e:
                logger.error(f"Unexpected error in main loop: {e}")
                logger.info("Waiting 60 seconds before retry...")
                time.sleep(60)


def main():
    """Entry point"""
    watcher = GmailWatcher()
    watcher.run()


if __name__ == '__main__':
    main()
