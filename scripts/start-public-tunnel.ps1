$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot ".runtime"
$outLog = Join-Path $runtimeDir "cloudflared.out.log"
$errLog = Join-Path $runtimeDir "cloudflared.err.log"
$urlFile = Join-Path $runtimeDir "public-url.txt"
$pidFile = Join-Path $runtimeDir "cloudflared.pid"

New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null

$cloudflaredPath = $null
$candidates = @(
  "C:\Program Files (x86)\cloudflared\cloudflared.exe",
  "C:\Program Files\cloudflared\cloudflared.exe"
)

foreach ($candidate in $candidates) {
  if (Test-Path $candidate) {
    $cloudflaredPath = $candidate
    break
  }
}

if (-not $cloudflaredPath) {
  $command = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($command) {
    $cloudflaredPath = $command.Source
  }
}

if (-not $cloudflaredPath) {
  throw "cloudflared is not installed. Install it first with: winget install --id Cloudflare.cloudflared"
}

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force

foreach ($file in @($outLog, $errLog, $urlFile, $pidFile)) {
  if (Test-Path $file) {
    Remove-Item $file -Force
  }
}

$process = Start-Process `
  -FilePath $cloudflaredPath `
  -ArgumentList "tunnel", "--url", "http://localhost:3000", "--no-autoupdate", "--loglevel", "info" `
  -RedirectStandardOutput $outLog `
  -RedirectStandardError $errLog `
  -WindowStyle Hidden `
  -PassThru

$process.Id | Set-Content -Path $pidFile

$publicUrl = $null
for ($attempt = 0; $attempt -lt 30; $attempt++) {
  Start-Sleep -Seconds 1

  if (Test-Path $errLog) {
    $match = Select-String -Path $errLog -Pattern "https://[-a-z0-9]+\.trycloudflare\.com" -AllMatches -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($match) {
      $publicUrl = $match.Matches[0].Value
      break
    }
  }
}

if (-not $publicUrl) {
  throw "Tunnel started but no public URL was found in time. Check .runtime\\cloudflared.err.log"
}

$publicUrl | Set-Content -Path $urlFile
Write-Output $publicUrl
