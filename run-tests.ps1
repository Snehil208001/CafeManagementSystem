# Cafe Management System - Run All Tests
# Prerequisites: Backend must be running (npm run dev in backend/)
# If backend is on port 3002: $env:API_PORT=3002

Write-Host "`n=== Cafe Management System - Test Runner ===`n" -ForegroundColor Cyan

# Check if backend is reachable
$port = if ($env:API_PORT) { $env:API_PORT } else { "3001" }
$baseUrl = "http://localhost:$port"

try {
    $null = Invoke-WebRequest -Uri "$baseUrl/api/menu" -Method GET -UseBasicParsing -TimeoutSec 3
    Write-Host "Backend is running on port $port`n" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Backend not reachable at $baseUrl" -ForegroundColor Red
    Write-Host "Start backend first: cd backend; npm run dev" -ForegroundColor Yellow
    Write-Host "If using port 3002: `$env:API_PORT=3002; .\run-tests.ps1`n" -ForegroundColor Yellow
    exit 1
}

# Run API tests
& "$PSScriptRoot\test-api.ps1"

# Frontend build check
Write-Host "`nVerifying frontend build..." -ForegroundColor Cyan
Push-Location $PSScriptRoot\frontend
try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[PASS] Frontend builds successfully`n" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Frontend build failed`n" -ForegroundColor Red
    }
} finally {
    Pop-Location
}

Write-Host "=== Tests complete. See TEST_RESULTS.md for details ===`n" -ForegroundColor Cyan
