#!/bin/bash

echo "🔍 Checking Gold Tier Setup..."
echo ""

# Check Node.js
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js installed: $NODE_VERSION"
else
    echo "   ❌ Node.js not found"
fi

# Check Docker
echo ""
echo "2. Checking Docker..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "   ✅ Docker installed: $DOCKER_VERSION"

    # Check if Docker is running
    if docker ps &> /dev/null; then
        echo "   ✅ Docker is running"

        # Check Odoo containers
        if docker ps | grep -q "odoo_19"; then
            echo "   ✅ Odoo container is running"
        else
            echo "   ⚠️  Odoo container not running (run: docker-compose up -d)"
        fi
    else
        echo "   ⚠️  Docker is not running"
    fi
else
    echo "   ❌ Docker not found"
fi

# Check dependencies
echo ""
echo "3. Checking Node dependencies..."
if [ -d "mcp-servers/node_modules" ]; then
    echo "   ✅ Node modules installed"

    # Check specific packages
    if [ -d "mcp-servers/node_modules/axios" ]; then
        echo "   ✅ axios installed"
    else
        echo "   ⚠️  axios not found"
    fi

    if [ -d "mcp-servers/node_modules/express" ]; then
        echo "   ✅ express installed"
    else
        echo "   ⚠️  express not found"
    fi
else
    echo "   ❌ Node modules not installed (run: cd mcp-servers && npm install)"
fi

# Check MCP servers
echo ""
echo "4. Checking MCP servers..."

# Email MCP
if curl -s http://localhost:3001/health &> /dev/null; then
    echo "   ✅ Email MCP (3001) is running"
else
    echo "   ⚠️  Email MCP (3001) not responding"
fi

# Odoo MCP
if curl -s http://localhost:3002/health &> /dev/null; then
    echo "   ✅ Odoo MCP (3002) is running"
else
    echo "   ⚠️  Odoo MCP (3002) not responding"
fi

# Social MCP
if curl -s http://localhost:3003/health &> /dev/null; then
    echo "   ✅ Social MCP (3003) is running"
else
    echo "   ⚠️  Social MCP (3003) not responding"
fi

# Check configuration
echo ""
echo "5. Checking configuration..."
if [ -f "mcp-servers/.env" ]; then
    echo "   ✅ .env file exists"
else
    echo "   ⚠️  .env file not found (copy from .env.example)"
fi

# Check vault structure
echo ""
echo "6. Checking vault structure..."
REQUIRED_DIRS=("vault/Needs_Action" "vault/Done" "vault/Briefings" "vault/Logs")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "   ✅ $dir exists"
    else
        echo "   ⚠️  $dir not found"
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Setup check complete!"
echo ""
echo "Next steps:"
echo "  • If MCP servers not running: cd mcp-servers && npm run start:all"
echo "  • If Odoo not running: docker-compose up -d"
echo "  • Test CEO briefing: node scripts/generate-ceo-briefing.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
