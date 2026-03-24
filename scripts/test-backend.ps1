$npm = (Get-Command npm -ErrorAction SilentlyContinue).Source

if (-not $npm) {
  $npm = 'C:\Program Files\nodejs\npm.cmd'
}

if (-not (Test-Path $npm)) {
  throw 'Nao foi possivel localizar o npm. Verifique se o Node.js esta instalado.'
}

$nodeDirectory = Split-Path $npm
$env:Path = "$nodeDirectory;$env:Path"

$backendPath = Join-Path $PSScriptRoot '..\backend'
$backendPath = (Resolve-Path $backendPath).Path

Write-Host 'Executando build do backend...' -ForegroundColor Cyan
Set-Location $backendPath
& $npm run db:generate

if ($LASTEXITCODE -ne 0) {
  throw 'Falha ao gerar o client do Prisma.'
}

& $npm run db:validate

if ($LASTEXITCODE -ne 0) {
  throw 'Falha ao validar o schema do Prisma.'
}

& $npm run build

if ($LASTEXITCODE -ne 0) {
  throw 'Falha na compilacao do backend.'
}

Write-Host 'Executando teste de fumaca da autenticacao...' -ForegroundColor Cyan
& $npm run test:smoke

if ($LASTEXITCODE -ne 0) {
  throw 'Falha no teste de fumaca do backend.'
}

Write-Host 'Backend validado com sucesso.' -ForegroundColor Green
