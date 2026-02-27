const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const app = express();
app.use(express.json());

const PORT = 3002;
const LOG_PATH = path.join(__dirname, '../logs/odoo-mcp.log');

// // Odoo Configuration
// const ODOO_URL = process.env.ODOO_URL || 'http://localhost:8069';
// const ODOO_DB = process.env.ODOO_DB || 'odoo';
// const ODOO_USERNAME = process.env.ODOO_USERNAME || 'admin';
// const ODOO_PASSWORD = process.env.ODOO_PASSWORD || 'admin';
const ODOO_URL = 'http://localhost:8069';
const ODOO_DB = 'hackathon0-odoo';  // ya jo database name daala tha
const ODOO_USERNAME = 'hammadhafeez435@gmail.com';  // exact jo login mein use kiya
const ODOO_PASSWORD = 'Shabangodoo112244';     // exact jo login mein daala

let odooUid = null;

// Create axios instance with cookie jar support
const jar = new CookieJar();
const axiosInstance = wrapper(axios.create({ jar }));

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

// Authenticate with Odoo
async function authenticateOdoo() {
    try {
        log('Authenticating with Odoo...');

        const response = await axiosInstance.post(`${ODOO_URL}/web/session/authenticate`, {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                db: ODOO_DB,
                login: ODOO_USERNAME,
                password: ODOO_PASSWORD
            }
        });

        if (response.data.result && response.data.result.uid) {
            odooUid = response.data.result.uid;
            log(`Successfully authenticated with Odoo. UID: ${odooUid}`);
            return true;
        } else {
            log('ERROR: Authentication failed - no UID returned');
            return false;
        }
    } catch (error) {
        log(`ERROR: Odoo authentication failed - ${error.message}`);
        return false;
    }
}

// Call Odoo JSON-RPC API
async function callOdoo(model, method, args = [], kwargs = {}) {
    try {
        if (!odooUid) {
            const authenticated = await authenticateOdoo();
            if (!authenticated) {
                throw new Error('Failed to authenticate with Odoo');
            }
        }

        const response = await axiosInstance.post(`${ODOO_URL}/web/dataset/call_kw`, {
            jsonrpc: '2.0',
            method: 'call',
            params: {
                model: model,
                method: method,
                args: args,
                kwargs: kwargs
            }
        });

        if (response.data.error) {
            throw new Error(response.data.error.data.message || 'Odoo API error');
        }

        return response.data.result;
    } catch (error) {
        log(`ERROR: Odoo API call failed - ${error.message}`);
        throw error;
    }
}

// Create invoice draft endpoint
app.post('/create_invoice', async (req, res) => {
    try {
        const { partner_name, partner_email, amount, description, invoice_lines } = req.body;

        if (!partner_name || !amount) {
            log('ERROR: Missing required fields for create_invoice');
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: partner_name, amount'
            });
        }

        log(`Creating invoice draft for: ${partner_name}, amount: ${amount}`);

        // Search for partner by name or email
        let partnerId;
        const partnerSearchDomain = partner_email
            ? [['email', '=', partner_email]]
            : [['name', 'ilike', partner_name]];

        const partners = await callOdoo('res.partner', 'search_read', [partnerSearchDomain], {
            fields: ['id', 'name', 'email'],
            limit: 1
        });

        if (partners && partners.length > 0) {
            partnerId = partners[0].id;
            log(`Found existing partner: ${partners[0].name} (ID: ${partnerId})`);
        } else {
            // Create new partner if not found
            log(`Creating new partner: ${partner_name}`);
            partnerId = await callOdoo('res.partner', 'create', [{
                name: partner_name,
                email: partner_email || '',
                customer_rank: 1
            }]);
            log(`Created new partner with ID: ${partnerId}`);
        }

        // Prepare invoice lines
        const lines = invoice_lines || [{
            name: description || 'Service',
            quantity: 1,
            price_unit: amount
        }];

        const invoiceLineCommands = lines.map(line => [0, 0, {
            name: line.name || line.description || 'Service',
            quantity: line.quantity || 1,
            price_unit: line.price_unit || line.amount || amount
        }]);

        // Create invoice draft
        const invoiceData = {
            partner_id: partnerId,
            move_type: 'out_invoice',
            invoice_line_ids: invoiceLineCommands,
            state: 'draft'
        };

        const invoiceId = await callOdoo('account.move', 'create', [invoiceData]);

        log(`SUCCESS: Invoice draft created with ID: ${invoiceId}`);

        res.json({
            success: true,
            invoiceId: invoiceId,
            partnerId: partnerId,
            message: 'Invoice draft created successfully'
        });

    } catch (error) {
        log(`ERROR: Failed to create invoice - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get invoice details endpoint
app.get('/invoice/:id', async (req, res) => {
    try {
        const invoiceId = parseInt(req.params.id);

        log(`Fetching invoice details for ID: ${invoiceId}`);

        const invoice = await callOdoo('account.move', 'read', [[invoiceId]], {
            fields: ['name', 'partner_id', 'amount_total', 'state', 'invoice_date', 'invoice_line_ids']
        });

        if (!invoice || invoice.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Invoice not found'
            });
        }

        log(`SUCCESS: Retrieved invoice ${invoice[0].name}`);

        res.json({
            success: true,
            invoice: invoice[0]
        });

    } catch (error) {
        log(`ERROR: Failed to fetch invoice - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// List invoices endpoint
app.get('/invoices', async (req, res) => {
    try {
        const { state, limit } = req.query;

        log(`Fetching invoices list (state: ${state || 'all'}, limit: ${limit || 10})`);

        const domain = state ? [['state', '=', state]] : [];

        const invoices = await callOdoo('account.move', 'search_read', [domain], {
            fields: ['name', 'partner_id', 'amount_total', 'state', 'invoice_date'],
            limit: parseInt(limit) || 10,
            order: 'create_date desc'
        });

        log(`SUCCESS: Retrieved ${invoices.length} invoices`);

        res.json({
            success: true,
            count: invoices.length,
            invoices: invoices
        });

    } catch (error) {
        log(`ERROR: Failed to fetch invoices - ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Check installed modules endpoint
app.get('/check_modules', async (req, res) => {
    try {
        log('Checking installed modules...');

        // Search for accounting-related modules
        const modules = await callOdoo('ir.module.module', 'search_read',
            [[['name', 'in', ['account', 'account_accountant', 'sale', 'purchase']]]],
            {
                fields: ['name', 'state', 'shortdesc']
            }
        );

        log(`Found ${modules.length} relevant modules`);

        res.json({
            success: true,
            modules: modules
        });
    } catch (error) {
        log(`ERROR: Failed to check modules - ${error.message}`);
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Install accounting module endpoint
app.post('/install_accounting', async (req, res) => {
    try {
        log('Installing accounting module...');

        // Search for the account module
        const modules = await callOdoo('ir.module.module', 'search_read',
            [[['name', '=', 'account']]],
            {
                fields: ['id', 'name', 'state']
            }
        );

        if (modules.length === 0) {
            throw new Error('Accounting module not found');
        }

        const moduleId = modules[0].id;
        const currentState = modules[0].state;

        if (currentState === 'installed') {
            log('Accounting module already installed');
            return res.json({
                success: true,
                message: 'Accounting module already installed'
            });
        }

        // Install the module
        await callOdoo('ir.module.module', 'button_immediate_install', [[moduleId]]);

        log('SUCCESS: Accounting module installation initiated');

        res.json({
            success: true,
            message: 'Accounting module installation initiated'
        });
    } catch (error) {
        log(`ERROR: Failed to install accounting module - ${error.message}`);
        res.json({
            success: false,
            error: error.message
        });
    }
});

// Test accounting module endpoint
app.get('/test_accounting', async (req, res) => {
    try {
        log('Testing accounting module access...');

        // Try to search for any invoice
        const invoices = await callOdoo('account.move', 'search_read', [[]], {
            fields: ['name', 'state'],
            limit: 1
        });

        log(`SUCCESS: Accounting module accessible, found ${invoices.length} invoices`);

        res.json({
            success: true,
            accounting_installed: true,
            sample_count: invoices.length
        });
    } catch (error) {
        log(`ERROR: Accounting module test failed - ${error.message}`);
        res.json({
            success: false,
            accounting_installed: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        // Test Odoo connection
        const authenticated = await authenticateOdoo();

        res.json({
            status: authenticated ? 'ok' : 'error',
            service: 'odoo-mcp',
            port: PORT,
            odoo_url: ODOO_URL,
            odoo_connected: authenticated
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            service: 'odoo-mcp',
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    log(`Odoo MCP server started on http://localhost:${PORT}`);
    console.log(`\n✅ Odoo MCP Server Running`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Odoo URL: ${ODOO_URL}`);
    console.log(`   Endpoints:`);
    console.log(`   - POST /create_invoice`);
    console.log(`   - GET /invoice/:id`);
    console.log(`   - GET /invoices`);
    console.log(`   - GET /health`);
    console.log(`\n   Logs: ${LOG_PATH}\n`);

    // Test authentication on startup
    authenticateOdoo();
});
