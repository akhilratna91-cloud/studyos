$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot ".runtime"
$urlFile = Join-Path $runtimeDir "public-url.txt"
$errLog = Join-Path $runtimeDir "cloudflared.err.log"

if (Test-Path $urlFile) {
  Get-Content $urlFile
  exit 0
}

if (Test-Path $errLog) {
  $match = Select-String -Path $errLog -Pattern "https://[-a-z0-9]+\.trycloudflare\.com" -AllMatches -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($match) {
    $match.Matches[0].Value
    exit 0
  }
}

throw "No public tunnel URL found. Start one with: npm run public:start"
