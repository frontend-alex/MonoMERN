# ============================================
# MonoMERN Deploy Script (Windows PowerShell)
# ============================================
# Quick deploy: .\scripts\deployment\deploy.ps1
# ============================================

$ErrorActionPreference = "Stop"

# Navigate to repo root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $RootDir

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║       MonoMERN Deployment            ║" -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ----- Step 1: Check prerequisites -----
Write-Host "[1/4] Checking prerequisites..." -ForegroundColor Yellow

try {
    docker --version | Out-Null
    Write-Host "  ✓ Docker found" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker is not installed. Install Docker Desktop." -ForegroundColor Red
    Write-Host "  → https://docs.docker.com/get-docker/"
    exit 1
}

try {
    docker compose version | Out-Null
    Write-Host "  ✓ Docker Compose found" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Docker Compose is not available." -ForegroundColor Red
    exit 1
}

# ----- Step 2: Environment file -----
Write-Host "[2/4] Setting up environment..." -ForegroundColor Yellow

$EnvFile = "docker\.env.docker"
$EnvExample = "docker\.env.docker.example"

if (-not (Test-Path $EnvFile)) {
    Copy-Item $EnvExample $EnvFile
    Write-Host "  ✓ Created $EnvFile from template" -ForegroundColor Green
    Write-Host "  ⚠ Please edit $EnvFile with your configuration." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Required changes:"
    Write-Host "    • DOMAIN              → Your domain (e.g., myapp.com)" -ForegroundColor Cyan
    Write-Host "    • SESSION_SECRET      → Random secret string" -ForegroundColor Cyan
    Write-Host "    • JWT_SECRET          → Random secret string" -ForegroundColor Cyan
    Write-Host "    • JWT_REFRESH_SECRET  → Random secret string" -ForegroundColor Cyan
    Write-Host "    • OTP_EMAIL           → Email for OTP verification" -ForegroundColor Cyan
    Write-Host "    • OTP_EMAIL_PASSWORD  → App password for email" -ForegroundColor Cyan
    Write-Host "    • CORS_ORIGINS        → https://yourdomain.com" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "  Press Enter when you've finished editing $EnvFile"
} else {
    Write-Host "  ✓ $EnvFile already exists" -ForegroundColor Green
}

# ----- Step 3: Generate secrets -----
Write-Host "[3/4] Checking secrets..." -ForegroundColor Yellow

function New-Secret {
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

$envContent = Get-Content $EnvFile -Raw

if ($envContent -match "CHANGE_ME_RANDOM_SECRET") {
    $secret = New-Secret
    $envContent = $envContent -replace "CHANGE_ME_RANDOM_SECRET", $secret
    Write-Host "  ✓ Generated SESSION_SECRET" -ForegroundColor Green
}

if ($envContent -match "CHANGE_ME_JWT_SECRET") {
    $secret = New-Secret
    $envContent = $envContent -replace "CHANGE_ME_JWT_SECRET", $secret
    Write-Host "  ✓ Generated JWT_SECRET" -ForegroundColor Green
}

if ($envContent -match "CHANGE_ME_JWT_REFRESH_SECRET") {
    $secret = New-Secret
    $envContent = $envContent -replace "CHANGE_ME_JWT_REFRESH_SECRET", $secret
    Write-Host "  ✓ Generated JWT_REFRESH_SECRET" -ForegroundColor Green
}

Set-Content $EnvFile $envContent -NoNewline

# ----- Step 4: Deploy -----
Write-Host "[4/4] Building and deploying..." -ForegroundColor Yellow
Write-Host ""

docker compose -f docker/docker-compose.yml up --build -d

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║       ✓ Deployment Complete!         ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  App:    http://localhost" -ForegroundColor Cyan
Write-Host "  API:    http://localhost/api/v1" -ForegroundColor Cyan
Write-Host "  Health: http://localhost/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Useful commands:" -ForegroundColor Yellow
Write-Host "    docker compose -f docker/docker-compose.yml logs -f    # View logs" -ForegroundColor Cyan
Write-Host "    docker compose -f docker/docker-compose.yml restart    # Restart" -ForegroundColor Cyan
Write-Host "    docker compose -f docker/docker-compose.yml down       # Stop all" -ForegroundColor Cyan
Write-Host ""
Write-Host "  To enable HTTPS (Linux/macOS only):" -ForegroundColor Yellow
Write-Host "    ./scripts/deployment/init-ssl.sh" -ForegroundColor Cyan
Write-Host ""
