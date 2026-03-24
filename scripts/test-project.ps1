Write-Host 'Validando backend...' -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'test-backend.ps1')

if ($LASTEXITCODE -ne 0) {
  throw 'Falha ao validar o backend.'
}

Write-Host 'Validando frontend...' -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'test-frontend.ps1')

if ($LASTEXITCODE -ne 0) {
  throw 'Falha ao validar o frontend.'
}

Write-Host 'Projeto validado com sucesso.' -ForegroundColor Green

