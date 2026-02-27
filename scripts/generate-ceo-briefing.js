const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Paths
const VAULT_PATH = path.join(__dirname, '../vault');
const DONE_PATH = path.join(VAULT_PATH, 'Done');
const BRIEFINGS_PATH = path.join(VAULT_PATH, 'Briefings');
const BUSINESS_GOALS_PATH = path.join(VAULT_PATH, 'Business_Goals.md');
const LOG_PATH = path.join(__dirname, '../logs/ceo-briefing.log');

// MCP Server URLs
const ODOO_MCP_URL = 'http://localhost:3002';

// Ensure directories exist
if (!fs.existsSync(BRIEFINGS_PATH)) {
    fs.mkdirSync(BRIEFINGS_PATH, { recursive: true });
}

// Logging function
function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_PATH, logMessage);
}

// Get current week info
function getWeekInfo() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    return {
        year: now.getFullYear(),
        week: weekNumber,
        date: now.toISOString().split('T')[0]
    };
}

// Read Business Goals
function readBusinessGoals() {
    try {
        if (fs.existsSync(BUSINESS_GOALS_PATH)) {
            return fs.readFileSync(BUSINESS_GOALS_PATH, 'utf8');
        }
        return 'No business goals file found.';
    } catch (error) {
        log(`ERROR: Failed to read business goals - ${error.message}`);
        return 'Error reading business goals.';
    }
}

// Analyze completed tasks from Done folder
function analyzeCompletedTasks() {
    try {
        const files = fs.readdirSync(DONE_PATH);
        const tasks = [];

        files.forEach(file => {
            if (file.endsWith('.md')) {
                const filePath = path.join(DONE_PATH, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const stats = fs.statSync(filePath);

                tasks.push({
                    filename: file,
                    completedDate: stats.mtime,
                    content: content
                });
            }
        });

        // Sort by completion date (most recent first)
        tasks.sort((a, b) => b.completedDate - a.completedDate);

        return tasks;
    } catch (error) {
        log(`ERROR: Failed to analyze completed tasks - ${error.message}`);
        return [];
    }
}

// Get Odoo financial data
async function getOdooFinancialData() {
    try {
        // Check if Odoo MCP is available
        const healthCheck = await axios.get(`${ODOO_MCP_URL}/health`, { timeout: 5000 });

        if (!healthCheck.data.odoo_connected) {
            return { available: false, message: 'Odoo not connected' };
        }

        // Get invoices
        const invoicesResponse = await axios.get(`${ODOO_MCP_URL}/invoices?limit=50`);
        const invoices = invoicesResponse.data.invoices || [];

        // Calculate financial metrics
        const draftInvoices = invoices.filter(inv => inv.state === 'draft');
        const postedInvoices = invoices.filter(inv => inv.state === 'posted');
        const paidInvoices = invoices.filter(inv => inv.state === 'paid');

        const totalDraft = draftInvoices.reduce((sum, inv) => sum + (inv.amount_total || 0), 0);
        const totalPosted = postedInvoices.reduce((sum, inv) => sum + (inv.amount_total || 0), 0);
        const totalPaid = paidInvoices.reduce((sum, inv) => sum + (inv.amount_total || 0), 0);

        return {
            available: true,
            invoices: {
                total: invoices.length,
                draft: draftInvoices.length,
                posted: postedInvoices.length,
                paid: paidInvoices.length
            },
            amounts: {
                draft: totalDraft,
                posted: totalPosted,
                paid: totalPaid,
                total: totalDraft + totalPosted + totalPaid
            }
        };
    } catch (error) {
        log(`WARNING: Failed to fetch Odoo data - ${error.message}`);
        return { available: false, message: error.message };
    }
}

// Generate CEO Briefing
async function generateCEOBriefing() {
    log('Starting CEO briefing generation...');

    const weekInfo = getWeekInfo();
    const businessGoals = readBusinessGoals();
    const completedTasks = analyzeCompletedTasks();
    const odooData = await getOdooFinancialData();

    // Build briefing content
    let briefing = `---
type: ceo_briefing
week: ${weekInfo.week}
year: ${weekInfo.year}
generated: ${new Date().toISOString()}
---

# CEO Weekly Briefing - Week ${weekInfo.week}, ${weekInfo.year}

**Generated:** ${new Date().toLocaleString()}

## Executive Summary

This briefing provides a comprehensive overview of business operations, task completion, and financial status for the week.

---

## 1. Business Goals Status

${businessGoals}

---

## 2. Task Completion Analysis

**Total Completed Tasks:** ${completedTasks.length}

### Recent Completions (Last 7 Days)

`;

    // Filter tasks from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentTasks = completedTasks.filter(task => task.completedDate >= sevenDaysAgo);

    if (recentTasks.length > 0) {
        recentTasks.forEach((task, index) => {
            briefing += `${index + 1}. **${task.filename}**\n`;
            briefing += `   - Completed: ${task.completedDate.toLocaleString()}\n`;

            // Extract task type if available
            const typeMatch = task.content.match(/type:\s*(\w+)/);
            if (typeMatch) {
                briefing += `   - Type: ${typeMatch[1]}\n`;
            }
            briefing += '\n';
        });
    } else {
        briefing += '*No tasks completed in the last 7 days.*\n\n';
    }

    briefing += `### Task Categories

`;

    // Categorize tasks
    const emailTasks = completedTasks.filter(t => t.filename.includes('email'));
    const invoiceTasks = completedTasks.filter(t => t.content.toLowerCase().includes('invoice'));
    const otherTasks = completedTasks.filter(t => !t.filename.includes('email') && !t.content.toLowerCase().includes('invoice'));

    briefing += `- Email Tasks: ${emailTasks.length}\n`;
    briefing += `- Invoice Tasks: ${invoiceTasks.length}\n`;
    briefing += `- Other Tasks: ${otherTasks.length}\n\n`;

    briefing += `---

## 3. Financial & Accounting Overview

`;

    if (odooData.available) {
        briefing += `**Odoo Integration:** ✅ Connected

### Invoice Summary

- **Total Invoices:** ${odooData.invoices.total}
- **Draft Invoices:** ${odooData.invoices.draft}
- **Posted Invoices:** ${odooData.invoices.posted}
- **Paid Invoices:** ${odooData.invoices.paid}

### Financial Metrics

- **Draft Amount:** $${odooData.amounts.draft.toFixed(2)}
- **Posted Amount:** $${odooData.amounts.posted.toFixed(2)}
- **Paid Amount:** $${odooData.amounts.paid.toFixed(2)}
- **Total Revenue:** $${odooData.amounts.total.toFixed(2)}

### Key Insights

`;

        if (odooData.invoices.draft > 0) {
            briefing += `- ⚠️ ${odooData.invoices.draft} draft invoices pending review (${odooData.amounts.draft.toFixed(2)} value)\n`;
        }

        if (odooData.invoices.posted > 0) {
            briefing += `- 📊 ${odooData.invoices.posted} invoices posted and awaiting payment\n`;
        }

        if (odooData.invoices.paid > 0) {
            briefing += `- ✅ ${odooData.invoices.paid} invoices paid (${odooData.amounts.paid.toFixed(2)} collected)\n`;
        }

    } else {
        briefing += `**Odoo Integration:** ❌ Not Available

*Reason:* ${odooData.message || 'Unknown'}

*Action Required:* Ensure Odoo MCP server is running and connected.

`;
    }

    briefing += `
---

## 4. System Health & Operations

### MCP Servers Status

- **Email MCP (Port 3001):** Check manually
- **Odoo MCP (Port 3002):** ${odooData.available ? '✅ Running' : '❌ Down'}
- **Social MCP (Port 3003):** Check manually

### Recommendations

`;

    // Generate recommendations based on data
    const recommendations = [];

    if (recentTasks.length === 0) {
        recommendations.push('- Review task pipeline - no tasks completed in last 7 days');
    }

    if (odooData.available && odooData.invoices.draft > 5) {
        recommendations.push('- High number of draft invoices - review and finalize');
    }

    if (!odooData.available) {
        recommendations.push('- Restore Odoo integration for financial tracking');
    }

    if (emailTasks.length > 10) {
        recommendations.push('- Consider email workflow optimization - high volume detected');
    }

    if (recommendations.length > 0) {
        recommendations.forEach(rec => briefing += `${rec}\n`);
    } else {
        briefing += '- All systems operating normally\n';
    }

    briefing += `
---

## 5. Next Week Priorities

Based on current status and business goals:

1. **Task Management:** Continue monitoring and processing incoming tasks
2. **Financial Operations:** ${odooData.available ? 'Review and finalize draft invoices' : 'Restore Odoo integration'}
3. **System Maintenance:** Ensure all MCP servers remain operational
4. **Goal Alignment:** Review progress against business goals

---

*This briefing was automatically generated by the AI Employee System.*
*For questions or concerns, review the detailed logs in the logs/ directory.*
`;

    // Save briefing
    const filename = `CEO_Briefing_${weekInfo.year}_W${weekInfo.week}_${weekInfo.date}.md`;
    const filepath = path.join(BRIEFINGS_PATH, filename);

    fs.writeFileSync(filepath, briefing);

    log(`SUCCESS: CEO briefing generated - ${filename}`);
    console.log(`\n✅ CEO Briefing Generated Successfully!`);
    console.log(`   File: ${filepath}`);
    console.log(`   Week: ${weekInfo.week}, ${weekInfo.year}`);
    console.log(`   Tasks Analyzed: ${completedTasks.length}`);
    console.log(`   Odoo Data: ${odooData.available ? 'Included' : 'Not Available'}\n`);

    return filepath;
}

// Run if called directly
if (require.main === module) {
    generateCEOBriefing()
        .then(() => process.exit(0))
        .catch(error => {
            log(`FATAL ERROR: ${error.message}`);
            console.error('❌ Failed to generate CEO briefing:', error.message);
            process.exit(1);
        });
}

module.exports = { generateCEOBriefing };
