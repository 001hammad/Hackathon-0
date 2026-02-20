# Email MCP Server

HTTP server for Gmail email operations using OAuth2 authentication.

## Features
- ✅ Draft emails
- ✅ Send emails
- ✅ OAuth2 authentication (uses existing token.json)
- ✅ Action logging
- ✅ Error handling

## Installation

```bash
cd mcp-servers
npm install
```

## Important: Update OAuth Scopes

The current `token.json` only has `gmail.readonly` scope. To send/draft emails, you need to:

1. Update the Gmail watcher script to request additional scopes
2. Delete `credentials/token.json`
3. Re-authenticate with broader permissions

**Required scopes:**
- `https://www.googleapis.com/auth/gmail.readonly` (already have)
- `https://www.googleapis.com/auth/gmail.send` (need to add)
- `https://www.googleapis.com/auth/gmail.compose` (need to add)

## Run Server

```bash
node email-mcp.js
```

Server will start on `http://localhost:3001`

## API Endpoints

### POST /draft_email
Create an email draft

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "body": "Email body content"
}
```

**Response:**
```json
{
  "success": true,
  "draftId": "r1234567890",
  "message": "Draft created successfully"
}
```

### POST /send_email
Send an email immediately

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "body": "Email body content"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "18d1234567890",
  "message": "Email sent successfully"
}
```

### POST /email
Combined endpoint with isDraft parameter

**Request:**
```json
{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "body": "Email body content",
  "isDraft": true
}
```

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "service": "email-mcp",
  "port": 3001
}
```

## Testing

```bash
# Test draft creation
curl -X POST http://localhost:3001/draft_email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test Draft","body":"This is a test draft"}'

# Test email sending
curl -X POST http://localhost:3001/send_email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test Email","body":"This is a test email"}'

# Test combined endpoint
curl -X POST http://localhost:3001/email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"Test","body":"Test body","isDraft":true}'
```

## Logs

All actions are logged to: `logs/email-mcp.log`

## Error Handling

The server returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad request (missing fields)
- `500` - Server error (OAuth issues, API errors)
