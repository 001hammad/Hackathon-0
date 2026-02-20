const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 3001;
const CREDENTIALS_PATH = path.join(__dirname, '../credentials/gmail_credentials.json');
const TOKEN_PATH = path.join(__dirname, '../credentials/token.json');
const LOG_PATH = path.join(__dirname, '../logs/email-mcp.log');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_PATH, logMessage);
}

// Load OAuth2 client
function getOAuth2Client() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_id, client_secret, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
    );

    // Load token
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);

    return oAuth2Client;
}

// Create email in base64 format
function createEmail(to, subject, body) {
    const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        body
    ].join('\n');

    return Buffer.from(email)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Draft email endpoint
app.post('/draft_email', async (req, res) => {
    try {
        const { to, subject, body } = req.body;

        if (!to || !subject || !body) {
            log('ERROR: Missing required fields for draft_email');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to, subject, body'
            });
        }

        log(`Creating draft email to: ${to}, subject: "${subject}"`);

        const auth = getOAuth2Client();
        const gmail = google.gmail({ version: 'v1', auth });

        const encodedMessage = createEmail(to, subject, body);

        const draft = await gmail.users.drafts.create({
            userId: 'me',
            requestBody: {
                message: {
                    raw: encodedMessage
                }
            }
        });

        log(`SUCCESS: Draft created with ID: ${draft.data.id}`);

        res.json({
            success: true,
            draftId: draft.data.id,
            message: 'Draft created successfully'
        });

    } catch (error) {
        log(`ERROR: Failed to create draft - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Send email endpoint
app.post('/send_email', async (req, res) => {
    try {
        const { to, subject, body } = req.body;

        if (!to || !subject || !body) {
            log('ERROR: Missing required fields for send_email');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to, subject, body'
            });
        }

        log(`Sending email to: ${to}, subject: "${subject}"`);

        const auth = getOAuth2Client();
        const gmail = google.gmail({ version: 'v1', auth });

        const encodedMessage = createEmail(to, subject, body);

        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        log(`SUCCESS: Email sent with ID: ${result.data.id}`);

        res.json({
            success: true,
            messageId: result.data.id,
            message: 'Email sent successfully'
        });

    } catch (error) {
        log(`ERROR: Failed to send email - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Combined endpoint (supports isDraft parameter)
app.post('/email', async (req, res) => {
    const { isDraft } = req.body;

    if (isDraft) {
        return app._router.handle(
            { ...req, url: '/draft_email', method: 'POST' },
            res
        );
    } else {
        return app._router.handle(
            { ...req, url: '/send_email', method: 'POST' },
            res
        );
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'email-mcp', port: PORT });
});

// Start server
app.listen(PORT, () => {
    log(`Email MCP server started on http://localhost:${PORT}`);
    console.log(`\n✅ Email MCP Server Running`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Endpoints:`);
    console.log(`   - POST /draft_email`);
    console.log(`   - POST /send_email`);
    console.log(`   - POST /email (with isDraft: true/false)`);
    console.log(`   - GET /health`);
    console.log(`\n   Logs: ${LOG_PATH}\n`);
});
