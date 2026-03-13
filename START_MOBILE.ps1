Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting SmartRoad Mobile App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Add Node.js to PATH
$env:Path += ";C:\Program Files\nodejs\"

Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = & npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm not found!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Navigating to mobile directory..." -ForegroundColor Yellow
Set-Location -Path "mobile"

Write-Host ""
Write-Host "Starting Expo development server..." -ForegroundColor Yellow
Write-Host "This may take a minute..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Once started, you will see:" -ForegroundColor Cyan
Write-Host "- A QR code to scan with Expo Go app" -ForegroundColor White
Write-Host "- Press 'w' to open in web browser" -ForegroundColor White
Write-Host "- Press 'a' for Android emulator" -ForegroundColor White
Write-Host "- Press 'i' for iOS simulator" -ForegroundColor White
Write-Host ""

& npm start

Read-Host "Press Enter to exit"
