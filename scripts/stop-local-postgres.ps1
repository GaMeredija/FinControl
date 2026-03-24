$pgCtl = Join-Path $PSScriptRoot '..\.local\postgresql-binaries\pgsql\bin\pg_ctl.exe'
$pgCtl = (Resolve-Path $pgCtl -ErrorAction SilentlyContinue).Path

if (-not $pgCtl) {
  throw 'Nao encontrei os binarios locais do PostgreSQL em .local\postgresql-binaries.'
}

$dataDir = Join-Path $PSScriptRoot '..\.local\postgres-data-prisma'
$dataDir = (Resolve-Path $dataDir -ErrorAction SilentlyContinue).Path

if (-not $dataDir) {
  throw 'Nao encontrei o diretorio de dados local em .local\postgres-data-prisma.'
}

Write-Host "Parando PostgreSQL local em $dataDir" -ForegroundColor Cyan
& $pgCtl -D $dataDir stop -m fast
