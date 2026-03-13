# SmartRoad Dependencies Installation Script
Write-Host "=== SmartRoad Dependencies Installer ===" -ForegroundColor Green

# Check if Node.js is installed
Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if Python is installed
Write-Host "`nChecking Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✓ Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is NOT installed" -ForegroundColor Red
    Write-Host "Please install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Install Backend Dependencies
Write-Host "`n=== Installing Backend Dependencies ===" -ForegroundColor Cyan
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed" -ForegroundColor Red
}
Set-Location ..

# Install Mobile Dependencies
Write-Host "`n=== Installing Mobile Dependencies ===" -ForegroundColor Cyan
Set-Location mobile
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Mobile dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ Mobile installation failed" -ForegroundColor Red
}
Set-Location ..

# Install AI Dependencies
Write-Host "`n=== Installing AI Dependencies ===" -ForegroundColor Cyan
Set-Location ai
pip install -r requirements.txt
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ AI dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✗ AI installation failed" -ForegroundColor Red
}
Set-Location ..

Write-Host "`n=== Installation Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Start services with Docker: cd docker && docker-compose up -d"
Write-Host "2. Or run manually - see SETUP_GUIDE.md for details"
