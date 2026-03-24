$npm = (Get-Command npm -ErrorAction SilentlyContinue).Source

if (-not $npm) {
  $npm = 'C:\Program Files\nodejs\npm.cmd'
}

if (-not (Test-Path $npm)) {
  throw 'Nao foi possivel localizar o npm. Verifique se o Node.js esta instalado.'
}

$nodeDirectory = Split-Path $npm
$env:Path = "$nodeDirectory;$env:Path"

$frontendPath = Join-Path $PSScriptRoot '..\frontend'
$frontendPath = (Resolve-Path $frontendPath).Path

Write-Host "Iniciando frontend de teste em $frontendPath" -ForegroundColor Cyan
Set-Location $frontendPath
& $npm run dev
