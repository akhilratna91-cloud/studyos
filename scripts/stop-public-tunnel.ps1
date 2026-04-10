$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$runtimeDir = Join-Path $projectRoot ".runtime"
$pidFile = Join-Path $runtimeDir "cloudflared.pid"
$urlFile = Join-Path $runtimeDir "public-url.txt"

$stopped = $false

if (Test-Path $pidFile) {
  $pidValue = (Get-Content $pidFile | Select-Object -First 1).Trim()
  if ($pidValue) {
    $process = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
    if ($process) {
      $process | Stop-Process -Force
      $stopped = $true
    }
  }
}

if (-not $stopped) {
  $processes = Get-Process cloudflared -ErrorAction SilentlyContinue
  if ($processes) {
    $processes | Stop-Process -Force
    $stopped = $true
  }
}

foreach ($file in @($pidFile, $urlFile)) {
  if (Test-Path $file) {
    Remove-Item $file -Force
  }
}

if ($stopped) {
  Write-Output "Cloudflare tunnel stopped."
} else {
  Write-Output "No running Cloudflare tunnel was found."
}
