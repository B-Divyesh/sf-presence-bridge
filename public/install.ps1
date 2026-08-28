$ErrorActionPreference = "Stop"
$release = Invoke-RestMethod "https://api.github.com/repos/B-Divyesh/sf-presence-bridge/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '\.exe$' } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (-not $asset -or -not $sums) { throw "No Windows release is published yet." }
$dest = Join-Path $env:LOCALAPPDATA "PresenceBridge"
New-Item -ItemType Directory -Force $dest | Out-Null
$file = Join-Path $dest "PresenceBridge.exe"
$sumFile = Join-Path $env:TEMP "presence-bridge-SHA256SUMS"
Invoke-WebRequest $asset.browser_download_url -OutFile $file
Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile
$expected = ((Get-Content $sumFile | Select-String $asset.name).Line -split '\s+')[0]
$actual = (Get-FileHash $file -Algorithm SHA256).Hash
if ($expected -ne $actual) { Remove-Item $file; throw "Checksum failed." }
Write-Host "Installed Presence Bridge at $file"
