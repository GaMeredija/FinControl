$npm = (Get-Command npm -ErrorAction SilentlyContinue).Source

if (-not $npm) {
  $npm = 'C:\Program Files\nodejs\npm.cmd'
}

if (-not (Test-Path $npm)) {
  throw 'Nao foi possivel localizar o npm. Verifique se o Node.js esta instalado.'
}

$nodeDirectory = Split-Path $npm
$env:Path = "$nodeDirectory;$env:Path"
$env:DATA_PROVIDER = 'prisma'

$backendPath = Join-Path $PSScriptRoot '..\backend'
$backendPath = (Resolve-Path $backendPath).Path

Write-Host "Iniciando backend em modo Prisma em $backendPath" -ForegroundColor Cyan
Set-Location $backendPath
& $npm run dev
