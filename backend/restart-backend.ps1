Write-Host "=== Restarting Backend Server ===" -ForegroundColor Cyan
Write-Host ""

# Stop any existing backend processes
Write-Host "Stopping existing Node.js processes on port 3000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        $proc = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  Stopping process: $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Yellow
            Stop-Process -Id $proc.Id -Force
        }
    }
    Start-Sleep -Seconds 2
}

# Verify FFmpeg is available
Write-Host ""
Write-Host "Checking FFmpeg installation..." -ForegroundColor Cyan
try {
    $ffmpegVersion = & ffmpeg -version 2>&1 | Select-Object -First 1
    Write-Host "  ✓ FFmpeg found: $ffmpegVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ FFmpeg NOT found! Please restart PowerShell and try again." -ForegroundColor Red
    Write-Host "  Or install FFmpeg using: winget install --id=Gyan.FFmpeg -e --accept-source-agreements" -ForegroundColor Yellow
    exit 1
}

# Start the backend
Write-Host ""
Write-Host "Starting backend server..." -ForegroundColor Cyan
Set-Location $PSScriptRoot
npm run dev
