@echo off
echo Checking Gold Tier Setup...
echo.

REM Check Node.js
echo 1. Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    node --version
    echo    [OK] Node.js installed
) else (
    echo    [ERROR] Node.js not found
)

REM Check Docker
echo.
echo 2. Checking Docker...
where docker >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    docker --version
    echo    [OK] Docker installed

    REM Check if Docker is running
    docker ps >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] Docker is running

        REM Check Odoo containers
        docker ps | findstr "odoo_19" >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo    [OK] Odoo container is running
        ) else (
            echo    [WARNING] Odoo container not running
            echo              Run: docker-compose up -d
        )
    ) else (
        echo    [WARNING] Docker is not running
    )
) else (
    echo    [ERROR] Docker not found
)

REM Check dependencies
echo.
echo 3. Checking Node dependencies...
if exist "mcp-servers\node_modules" (
    echo    [OK] Node modules installed
) else (
    echo    [ERROR] Node modules not installed
    echo            Run: cd mcp-servers ^&^& npm install
)

REM Check MCP servers
echo.
echo 4. Checking MCP servers...

curl -s http://localhost:3001/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Email MCP (3001) is running
) else (
    echo    [WARNING] Email MCP (3001) not responding
)

curl -s http://localhost:3002/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Odoo MCP (3002) is running
) else (
    echo    [WARNING] Odoo MCP (3002) not responding
)

curl -s http://localhost:3003/health >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Social MCP (3003) is running
) else (
    echo    [WARNING] Social MCP (3003) not responding
)

REM Check configuration
echo.
echo 5. Checking configuration...
if exist "mcp-servers\.env" (
    echo    [OK] .env file exists
) else (
    echo    [WARNING] .env file not found
    echo              Copy from .env.example
)

REM Check vault structure
echo.
echo 6. Checking vault structure...
if exist "vault\Needs_Action" (echo    [OK] vault\Needs_Action exists) else (echo    [WARNING] vault\Needs_Action not found)
if exist "vault\Done" (echo    [OK] vault\Done exists) else (echo    [WARNING] vault\Done not found)
if exist "vault\Briefings" (echo    [OK] vault\Briefings exists) else (echo    [WARNING] vault\Briefings not found)
if exist "vault\Logs" (echo    [OK] vault\Logs exists) else (echo    [WARNING] vault\Logs not found)

echo.
echo ================================================================
echo Setup check complete!
echo.
echo Next steps:
echo   - If MCP servers not running: cd mcp-servers ^&^& npm run start:all
echo   - If Odoo not running: docker-compose up -d
echo   - Test CEO briefing: node scripts\generate-ceo-briefing.js
echo ================================================================
pause
