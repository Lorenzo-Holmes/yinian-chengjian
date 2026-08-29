[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$root = Split-Path -Parent $PSScriptRoot
$releaseDir = Join-Path $root 'release'
$stagingDir = Join-Path ([System.IO.Path]::GetTempPath()) 'yinian-chengjian-package-staging'
$zipPath = Join-Path $releaseDir 'yinian-chengjian-xhs.zip'

Push-Location $root
try {
    Write-Host 'Running production self-check...'
    & node (Join-Path $root 'scripts\selfcheck.js')
    if ($LASTEXITCODE -ne 0) {
        throw 'SELF_CHECK_FAILED: production package was not created.'
    }

    if (Test-Path -LiteralPath $stagingDir) {
        Remove-Item -LiteralPath $stagingDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path (Join-Path $stagingDir 'assets') -Force | Out-Null
    New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null

    Copy-Item -LiteralPath (Join-Path $root 'index.html') -Destination $stagingDir
    Copy-Item -LiteralPath (Join-Path $root 'styles.css') -Destination $stagingDir
    Copy-Item -LiteralPath (Join-Path $root 'app.js') -Destination $stagingDir
    Copy-Item -LiteralPath (Join-Path $root 'assets\favicon.svg') -Destination (Join-Path $stagingDir 'assets')

    if (Test-Path -LiteralPath $zipPath) {
        Remove-Item -LiteralPath $zipPath -Force
    }
    Compress-Archive -Path (Join-Path $stagingDir '*') -DestinationPath $zipPath -CompressionLevel Optimal

    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    try {
        $entries = @($archive.Entries | ForEach-Object { $_.FullName.TrimEnd('/') })
        $expected = @('index.html', 'styles.css', 'app.js', 'assets/favicon.svg')
        $actualFiles = @($entries | Where-Object { $_ -and -not $_.EndsWith('/') } | ForEach-Object { $_.Replace('\', '/') } | Sort-Object)
        $expectedSorted = @($expected | Sort-Object)
        if (($actualFiles -join '|') -ne ($expectedSorted -join '|')) {
            throw ('PACKAGE_CONTENT_INVALID: ' + ($actualFiles -join ', '))
        }
    }
    finally {
        $archive.Dispose()
    }

    Remove-Item -LiteralPath $stagingDir -Recurse -Force
    Write-Host ('PACKAGE_OK: ' + $zipPath)
}
finally {
    if (Test-Path -LiteralPath $stagingDir) {
        Remove-Item -LiteralPath $stagingDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    Pop-Location
}
