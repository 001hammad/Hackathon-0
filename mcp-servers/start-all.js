const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting All MCP Servers...\n');

const servers = [
    { name: 'Email MCP', script: 'email-mcp.js', port: 3001 },
    { name: 'Odoo MCP', script: 'odoo-mcp.js', port: 3002 },
    { name: 'Social MCP', script: 'social-mcp.js', port: 3003 }
];

const processes = [];

servers.forEach(server => {
    console.log(`Starting ${server.name} on port ${server.port}...`);

    const proc = spawn('node', [path.join(__dirname, server.script)], {
        stdio: 'inherit',
        shell: true
    });

    proc.on('error', (error) => {
        console.error(`❌ ${server.name} failed to start:`, error.message);
    });

    proc.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ ${server.name} exited with code ${code}`);
        }
    });

    processes.push({ name: server.name, process: proc });
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down all MCP servers...');
    processes.forEach(({ name, process }) => {
        console.log(`Stopping ${name}...`);
        process.kill('SIGINT');
    });
    process.exit(0);
});

console.log('\n✅ All MCP servers started successfully!');
console.log('Press Ctrl+C to stop all servers.\n');
