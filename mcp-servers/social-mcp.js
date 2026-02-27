const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const PORT = 3003;
const LOG_PATH = path.join(__dirname, '../logs/social-mcp.log');

// Social Media Configuration (from environment variables)
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || '';
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || '';
const TWITTER_API_KEY = process.env.TWITTER_API_KEY || '';
const TWITTER_API_SECRET = process.env.TWITTER_API_SECRET || '';
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN || '';
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET || '';

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

// Generate AI summary for social media post
function generateSummary(content, platform, maxLength) {
    // Simple summary generation (in production, this would call Claude API)
    let summary = content.trim();

    // Platform-specific formatting
    if (platform === 'twitter' && summary.length > 280) {
        summary = summary.substring(0, 277) + '...';
    } else if (platform === 'instagram' && summary.length > maxLength) {
        summary = summary.substring(0, maxLength - 3) + '...';
    }

    return summary;
}

// Facebook post endpoint
app.post('/facebook/post', async (req, res) => {
    try {
        const { message, link, generateSummary: autoSummary } = req.body;

        if (!message) {
            log('ERROR: Missing message for Facebook post');
            return res.status(400).json({
                success: false,
                error: 'Missing required field: message'
            });
        }

        if (!FACEBOOK_ACCESS_TOKEN) {
            log('ERROR: Facebook access token not configured');
            return res.status(500).json({
                success: false,
                error: 'Facebook integration not configured'
            });
        }

        log(`Creating Facebook post: "${message.substring(0, 50)}..."`);

        const postContent = autoSummary ? generateSummary(message, 'facebook', 5000) : message;

        // Facebook Graph API call (placeholder - requires actual implementation)
        // const response = await axios.post(
        //     `https://graph.facebook.com/v18.0/me/feed`,
        //     {
        //         message: postContent,
        //         link: link || undefined
        //     },
        //     {
        //         params: { access_token: FACEBOOK_ACCESS_TOKEN }
        //     }
        // );

        log(`SUCCESS: Facebook post created (simulated)`);

        res.json({
            success: true,
            platform: 'facebook',
            message: 'Post created successfully (simulated)',
            content: postContent
        });

    } catch (error) {
        log(`ERROR: Failed to create Facebook post - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Instagram post endpoint
app.post('/instagram/post', async (req, res) => {
    try {
        const { caption, imageUrl, generateSummary: autoSummary } = req.body;

        if (!caption || !imageUrl) {
            log('ERROR: Missing caption or imageUrl for Instagram post');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: caption, imageUrl'
            });
        }

        if (!INSTAGRAM_ACCESS_TOKEN) {
            log('ERROR: Instagram access token not configured');
            return res.status(500).json({
                success: false,
                error: 'Instagram integration not configured'
            });
        }

        log(`Creating Instagram post: "${caption.substring(0, 50)}..."`);

        const postCaption = autoSummary ? generateSummary(caption, 'instagram', 2200) : caption;

        // Instagram Graph API call (placeholder - requires actual implementation)
        log(`SUCCESS: Instagram post created (simulated)`);

        res.json({
            success: true,
            platform: 'instagram',
            message: 'Post created successfully (simulated)',
            caption: postCaption,
            imageUrl: imageUrl
        });

    } catch (error) {
        log(`ERROR: Failed to create Instagram post - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Twitter/X post endpoint
app.post('/twitter/post', async (req, res) => {
    try {
        const { text, generateSummary: autoSummary } = req.body;

        if (!text) {
            log('ERROR: Missing text for Twitter post');
            return res.status(400).json({
                success: false,
                error: 'Missing required field: text'
            });
        }

        if (!TWITTER_API_KEY || !TWITTER_ACCESS_TOKEN) {
            log('ERROR: Twitter API credentials not configured');
            return res.status(500).json({
                success: false,
                error: 'Twitter integration not configured'
            });
        }

        log(`Creating Twitter post: "${text.substring(0, 50)}..."`);

        const tweetText = autoSummary ? generateSummary(text, 'twitter', 280) : text;

        // Twitter API v2 call (placeholder - requires actual implementation)
        log(`SUCCESS: Twitter post created (simulated)`);

        res.json({
            success: true,
            platform: 'twitter',
            message: 'Tweet created successfully (simulated)',
            text: tweetText
        });

    } catch (error) {
        log(`ERROR: Failed to create Twitter post - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Multi-platform post endpoint
app.post('/post/multi', async (req, res) => {
    try {
        const { platforms, content, imageUrl } = req.body;

        if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing or invalid platforms array'
            });
        }

        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Missing content'
            });
        }

        log(`Creating multi-platform post for: ${platforms.join(', ')}`);

        const results = [];

        for (const platform of platforms) {
            try {
                let result;
                if (platform === 'facebook') {
                    result = await axios.post(`http://localhost:${PORT}/facebook/post`, {
                        message: content,
                        generateSummary: true
                    });
                } else if (platform === 'instagram' && imageUrl) {
                    result = await axios.post(`http://localhost:${PORT}/instagram/post`, {
                        caption: content,
                        imageUrl: imageUrl,
                        generateSummary: true
                    });
                } else if (platform === 'twitter') {
                    result = await axios.post(`http://localhost:${PORT}/twitter/post`, {
                        text: content,
                        generateSummary: true
                    });
                }

                results.push({
                    platform: platform,
                    success: true,
                    data: result?.data
                });
            } catch (error) {
                results.push({
                    platform: platform,
                    success: false,
                    error: error.message
                });
            }
        }

        log(`SUCCESS: Multi-platform post completed`);

        res.json({
            success: true,
            results: results
        });

    } catch (error) {
        log(`ERROR: Failed to create multi-platform post - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    const configured = {
        facebook: !!FACEBOOK_ACCESS_TOKEN,
        instagram: !!INSTAGRAM_ACCESS_TOKEN,
        twitter: !!(TWITTER_API_KEY && TWITTER_ACCESS_TOKEN)
    };

    res.json({
        status: 'ok',
        service: 'social-mcp',
        port: PORT,
        platforms: configured
    });
});

// Start server
app.listen(PORT, () => {
    log(`Social Media MCP server started on http://localhost:${PORT}`);
    console.log(`\n✅ Social Media MCP Server Running`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Endpoints:`);
    console.log(`   - POST /facebook/post`);
    console.log(`   - POST /instagram/post`);
    console.log(`   - POST /twitter/post`);
    console.log(`   - POST /post/multi`);
    console.log(`   - GET /health`);
    console.log(`\n   Configured Platforms:`);
    console.log(`   - Facebook: ${FACEBOOK_ACCESS_TOKEN ? '✅' : '❌'}`);
    console.log(`   - Instagram: ${INSTAGRAM_ACCESS_TOKEN ? '✅' : '❌'}`);
    console.log(`   - Twitter: ${TWITTER_API_KEY && TWITTER_ACCESS_TOKEN ? '✅' : '❌'}`);
    console.log(`\n   Logs: ${LOG_PATH}\n`);
});
