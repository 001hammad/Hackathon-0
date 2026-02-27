# Gold Tier Quick Start Guide

## 🎯 Objective

Get your Personal AI Employee running with full cross-domain integration in under 30 minutes.

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] Docker Desktop installed and running
- [ ] Gmail account with API access
- [ ] Claude Code CLI installed
- [ ] Basic understanding of terminal/command line

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies (5 minutes)

```bash
cd hackathon-0/mcp-servers
npm install
```

**Expected output:** All packages installed successfully

### Step 2: Configure Environment (5 minutes)

```bash
# Copy example environment file
cp .env.example .env

# Edit with your credentials
# Use your preferred text editor
notepad .env  # Windows
```

**Required configurations:**
- Gmail credentials path (if using email integration)
- Odoo credentials (default: admin/admin)
- Social media tokens (optional for now)

### Step 3: Start Odoo ERP (10 minutes)

```bash
# From project root
cd ..
docker-compose up -d
```

**Wait for containers to start:**
```bash
docker-compose logs -f odoo
# Wait for "odoo.service.server: HTTP service (werkzeug) running"
# Press Ctrl+C to exit logs
```

**Access Odoo:**
1. Open browser: http://localhost:8069
2. Create database:
   - Database name: `odoo`
   - Email: your-email@example.com
   - Password: `admin`
   - Uncheck "Demo data"
3. Click "Create database"
4. Install "Invoicing" module

### Step 4: Start MCP Servers (2 minutes)

```bash
cd mcp-servers
npm run start:all
```

**Expected output:**
```
✅ Email MCP Server Running (Port 3001)
✅ Odoo MCP Server Running (Port 3002)
✅ Social Media MCP Server Running (Port 3003)
```

### Step 5: Verify Installation (3 minutes)

Open new terminal and test each server:

```bash
# Test Email MCP
curl http://localhost:3001/health

# Test Odoo MCP
curl http://localhost:3002/health

# Test Social MCP
curl http://localhost:3003/health
```

**Expected:** All should return `{"status":"ok",...}`

### Step 6: Test CEO Briefing (2 minutes)

```bash
node scripts/generate-ceo-briefing.js
```

**Expected output:**
```
✅ CEO Briefing Generated Successfully!
   File: vault/Briefings/CEO_Briefing_2026_W08_2026-02-23.md
```

### Step 7: Test Invoice Creation (3 minutes)

```bash
curl -X POST http://localhost:3002/create_invoice \
  -H "Content-Type: application/json" \
  -d '{
    "partner_name": "Test Customer",
    "partner_email": "test@example.com",
    "amount": 1000,
    "description": "Test Invoice"
  }'
```

**Expected:** `{"success":true,"invoiceId":...}`

**Verify in Odoo:**
1. Go to http://localhost:8069
2. Navigate to Invoicing → Customers → Invoices
3. You should see the draft invoice

## ✅ Success Criteria

You've successfully set up Gold Tier if:

- [ ] All 3 MCP servers are running
- [ ] Odoo is accessible at http://localhost:8069
- [ ] Health checks return "ok" status
- [ ] CEO briefing generates successfully
- [ ] Test invoice creates in Odoo

## 🎉 Next Steps

### Test Email Integration

1. Configure Gmail OAuth2 credentials
2. Place credentials in `credentials/gmail_credentials.json`
3. Run authentication flow
4. Test email draft creation

### Test Social Media Integration

1. Get API credentials for Facebook/Instagram/Twitter
2. Add to `.env` file
3. Restart social MCP server
4. Test posting endpoints

### Enable Autonomous Operation

1. Review `vault/Business_Goals.md`
2. Add tasks to `vault/Needs_Action/`
3. Use Claude Code with ralph-wiggum skill
4. Monitor task processing

### Schedule Weekly Briefings

**Windows (Task Scheduler):**
```bash
# Create scheduled task to run every Sunday at 9 AM
schtasks /create /tn "CEO Briefing" /tr "node C:\path\to\scripts\generate-ceo-briefing.js" /sc weekly /d SUN /st 09:00
```

**Linux/Mac (cron):**
```bash
# Add to crontab
0 9 * * 0 cd /path/to/hackathon-0 && node scripts/generate-ceo-briefing.js
```

## 🐛 Troubleshooting

### MCP Server Won't Start

**Problem:** Port already in use
```bash
# Find process using port
netstat -ano | findstr :3001

# Kill process (Windows)
taskkill /PID <process_id> /F
```

### Odoo Container Won't Start

**Problem:** Docker not running
```bash
# Check Docker status
docker ps

# Restart Docker Desktop
# Then retry: docker-compose up -d
```

### Odoo Authentication Failed

**Problem:** Wrong credentials
```bash
# Check Odoo logs
docker-compose logs odoo

# Reset by recreating database
docker-compose down -v
docker-compose up -d
```

### CEO Briefing Fails

**Problem:** Missing dependencies
```bash
# Reinstall dependencies
cd mcp-servers
npm install axios
```

## 📚 Additional Resources

- **Full Architecture:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Odoo Details:** See [ODOO_SETUP.md](ODOO_SETUP.md)
- **Progress Tracking:** See [GOLD.md](GOLD.md)

## 💡 Tips

1. **Keep MCP servers running** in a dedicated terminal
2. **Monitor logs** in `logs/` directory for debugging
3. **Start with Odoo** before testing invoice features
4. **Use health endpoints** to verify server status
5. **Check Docker** if Odoo integration fails

## 🎓 Learning Path

1. ✅ Get everything running (this guide)
2. 📖 Read ARCHITECTURE.md to understand the system
3. 🧪 Experiment with API endpoints
4. 🤖 Enable autonomous operation with Claude Code
5. 📊 Review weekly CEO briefings
6. 🔧 Customize for your specific needs

---

**Estimated Total Time:** 30 minutes
**Difficulty:** Intermediate
**Support:** Check logs/ directory for detailed error messages
