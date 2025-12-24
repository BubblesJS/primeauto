$ErrorActionPreference = 'Stop'

Set-Location (Split-Path -Parent $PSScriptRoot)

if (!(Test-Path .\node_modules)) {
  Write-Host 'node_modules missing; running npm install...'
  npm install | Out-Host
}

$env:PORT = '3006'
$env:NODE_ENV = 'development'

$outFile = Join-Path $env:TEMP 'primeauto-node-out.txt'
$errFile = Join-Path $env:TEMP 'primeauto-node-err.txt'
if (Test-Path $outFile) { Remove-Item $outFile -Force }
if (Test-Path $errFile) { Remove-Item $errFile -Force }

function Get-Url([string]$url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri $url -ErrorAction Stop
    return @{ status = [int]$r.StatusCode; body = $r.Content; error = $null }
  } catch {
    $ex = $_.Exception
    $resp = $ex.Response
    $status = $null
    $body = $null

    if ($resp -and $resp.StatusCode) { $status = [int]$resp.StatusCode }

    try {
      if ($resp -and $resp.GetResponseStream()) {
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $body = $reader.ReadToEnd()
      }
    } catch { }

    return @{ status = $status; body = $body; error = $ex.Message }
  }
}

$p = Start-Process -FilePath node -ArgumentList 'server.js' -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden -RedirectStandardOutput $outFile -RedirectStandardError $errFile

try {
  Start-Sleep -Seconds 2

  if ($p.HasExited) {
    Write-Host 'node_exited=true'
    Write-Host ('node_exitcode=' + $p.ExitCode)
    if (Test-Path $outFile) { Write-Host ('node_stdout=' + (Get-Content $outFile -Raw)) }
    if (Test-Path $errFile) { Write-Host ('node_stderr=' + (Get-Content $errFile -Raw)) }
    exit 1
  }

  $h = Get-Url 'http://127.0.0.1:3006/healthz'
  $s = Get-Url 'http://127.0.0.1:3006/api/_test/smtp'

  Write-Host ('healthz_status=' + $h.status)
  Write-Host ('healthz_body=' + $h.body)
  Write-Host ('smtp_status=' + $s.status)
  Write-Host ('smtp_body=' + $s.body)
  if ($s.error) { Write-Host ('smtp_error=' + $s.error) }

  if (Test-Path $errFile) {
    $stderr = Get-Content $errFile -Raw
    if ($stderr) { Write-Host ('node_stderr=' + $stderr) }
  }
} finally {
  if ($p -and !$p.HasExited) { Stop-Process -Id $p.Id -Force }
}
