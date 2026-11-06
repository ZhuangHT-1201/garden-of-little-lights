$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$shortTemp = 'C:\jtmp'

if (-not (Test-Path $shortTemp)) {
  New-Item -ItemType Directory -Path $shortTemp -Force | Out-Null
}

$env:TEMP = $shortTemp
$env:TMP = $shortTemp
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME

$jdkRoots = @(
  (Join-Path $env:ProgramFiles 'Microsoft'),
  (Join-Path $env:ProgramFiles 'Eclipse Adoptium'),
  (Join-Path $env:ProgramFiles 'Java'),
  (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft'),
  (Join-Path $env:ProgramFiles 'Android\Android Studio\jbr')
)
$jdk21 = $jdkRoots |
  Where-Object { Test-Path -LiteralPath $_ } |
  ForEach-Object { Get-ChildItem -LiteralPath $_ -Directory -ErrorAction SilentlyContinue } |
  Where-Object { $_.Name -match '^(jdk-?21|21\.)' } |
  Select-Object -First 1

if (-not $jdk21) {
  throw 'Android build requires JDK 21. Install Microsoft OpenJDK 21 or Android Studio JBR.'
}

$env:JAVA_HOME = $jdk21.FullName
$env:Path = "$(Join-Path $env:JAVA_HOME 'bin');$env:Path"

$androidEnvFile = Join-Path $root '.env.android'
if (Test-Path -LiteralPath $androidEnvFile) {
  Get-Content -LiteralPath $androidEnvFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
      $parts = $line.Split('=', 2)
      if ($parts.Count -eq 2) {
        [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), 'Process')
      }
    }
  }
}

$requiredSigning = @(
  'GUITING_KEYSTORE_PATH',
  'GUITING_STORE_PASSWORD',
  'GUITING_KEY_ALIAS',
  'GUITING_KEY_PASSWORD'
)
$missingSigning = $requiredSigning | Where-Object {
  -not [Environment]::GetEnvironmentVariable($_, 'Process')
}
if ($missingSigning.Count -gt 0) {
  throw "Missing Android signing settings: $($missingSigning -join ', '). Copy .env.android.example to .env.android."
}

Push-Location $root
try {
  npm run build
  npx cap sync android

  Push-Location (Join-Path $root 'android')
  try {
    .\gradlew.bat assembleRelease --no-daemon
  }
  finally {
    Pop-Location
  }

  $releaseDir = Join-Path $root 'releases'
  New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
  $source = Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
  $appName = -join @([char]0x6842, [char]0x5EAD, [char]0x62FE, [char]0x5149)
  $target = Join-Path $releaseDir "$appName-Android-1.0.0.apk"
  Copy-Item -LiteralPath $source -Destination $target -Force
  Write-Output "APK: $target"
}
finally {
  Pop-Location
}
