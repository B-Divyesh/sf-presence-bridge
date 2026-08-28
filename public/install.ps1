$ErrorActionPreference = "Stop"
$release = Invoke-RestMethod "https://api.github.com/repos/B-Divyesh/sf-presence-bridge/releases/latest"
$asset = $release.assets | Where-Object { $_.name -match '_x64-setup\.exe$' } | Select-Object -First 1
$sums = $release.assets | Where-Object { $_.name -eq 'SHA256SUMS' } | Select-Object -First 1
if (-not $asset -or -not $sums) { throw "No Windows setup release is published yet." }

$tempDir = Join-Path ([IO.Path]::GetTempPath()) ("presence-bridge-" + [guid]::NewGuid())
New-Item -ItemType Directory -Force $tempDir | Out-Null

try {
  # Keep the release filename: the checksum file identifies the setup by this name.
  $installer = Join-Path $tempDir $asset.name
  $sumFile = Join-Path $tempDir "SHA256SUMS"
  Invoke-WebRequest $asset.browser_download_url -OutFile $installer
  Invoke-WebRequest $sums.browser_download_url -OutFile $sumFile

  $escapedName = [regex]::Escape($asset.name)
  $sumLine = Get-Content $sumFile | Where-Object { $_ -match "\s+$escapedName$" } | Select-Object -First 1
  if (-not $sumLine) { throw "The release checksum does not list $($asset.name)." }
  $expected = ($sumLine -split '\s+')[0].ToUpperInvariant()
  $actual = (Get-FileHash $installer -Algorithm SHA256).Hash.ToUpperInvariant()
  if ($expected -ne $actual) { throw "Checksum failed. The setup was not run." }

  $setup = Start-Process -FilePath $installer -ArgumentList "/S" -Wait -PassThru
  if ($setup.ExitCode -ne 0) { throw "Presence Bridge setup exited with code $($setup.ExitCode)." }

  $installRoots = @(
    (Join-Path $env:LOCALAPPDATA "Presence Bridge"),
    (Join-Path $env:LOCALAPPDATA "Programs\Presence Bridge"),
    (Join-Path $env:ProgramFiles "Presence Bridge"),
    (Join-Path ${env:ProgramFiles(x86)} "Presence Bridge")
  ) | Where-Object { $_ }
  $registeredRoots = @(
    'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
    'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
  ) | ForEach-Object { Get-ItemProperty $_ -ErrorAction SilentlyContinue } |
    Where-Object { $_.DisplayName -eq "Presence Bridge" } |
    ForEach-Object { $_.InstallLocation } |
    Where-Object { $_ }
  $candidateApps = @($installRoots + $registeredRoots) | ForEach-Object {
    @((Join-Path $_ "presence-bridge.exe"), (Join-Path $_ "Presence Bridge.exe"))
  }
  $installedApp = $candidateApps | Where-Object { $_ -and (Test-Path $_ -PathType Leaf) } | Select-Object -First 1
  if (-not $installedApp) { throw "Setup finished, but the installed Presence Bridge app was not found." }

  Start-Process -FilePath $installedApp | Out-Null
  Write-Host "Installed and opened Presence Bridge from $installedApp"
}
finally {
  Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}
