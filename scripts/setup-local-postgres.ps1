[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$startedAt = Get-Date
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot '.env'
$postgresRoot = 'C:\Program Files\PostgreSQL\18'
$postgresBin = Join-Path $postgresRoot 'bin'
$psql = Join-Path $postgresBin 'psql.exe'
$createdb = Join-Path $postgresBin 'createdb.exe'
$tempRoot = Join-Path $env:TEMP 'lb-developers-postgresql-18'
$installerPath = Join-Path $tempRoot 'postgresql-18.6-1-windows-x64.exe'
$optionPath = Join-Path $tempRoot 'install-options.txt'
$roleSqlPath = Join-Path $tempRoot 'create-roles.sql'
$installerLog = Join-Path $env:TEMP 'install-postgresql.log'
$hbaPath = Join-Path $postgresRoot 'data\pg_hba.conf'
$installerUrl = 'https://get.enterprisedb.com/postgresql/postgresql-18.6-1-windows-x64.exe'
$installerSha256 = 'CAE561E98D09F3F4A1A95759249240F86F66D71DCF33D14B6F7BE894078401D1'

function New-SecureValue {
  $bytes = New-Object byte[] 32
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $generator.GetBytes($bytes)
  } finally {
    $generator.Dispose()
  }
  return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Set-DotEnvValue {
  param(
    [Parameter(Mandatory = $true)][string]$Key,
    [Parameter(Mandatory = $true)][string]$Value,
    [Parameter(Mandatory = $true)][System.Collections.Generic.List[string]]$Lines
  )
  $replacement = "$Key=$Value"
  for ($index = 0; $index -lt $Lines.Count; $index += 1) {
    if ($Lines[$index] -match "^$([Regex]::Escape($Key))=") {
      $Lines[$index] = $replacement
      return
    }
  }
  $Lines.Add($replacement)
}

function Invoke-DatabaseSetup {
  Push-Location $projectRoot
  try {
    & npm.cmd run db:setup
    if ($LASTEXITCODE -ne 0) { throw 'Database migrations or seed failed.' }
  } finally {
    Pop-Location
  }
}

function Remove-ObsoleteAdminSecrets {
  if (-not (Test-Path -LiteralPath $envPath)) { return }
  $retainedLines = [IO.File]::ReadAllLines($envPath) | Where-Object { $_ -notmatch '^(ADMIN_INITIAL_PASSWORD|ADMIN_PASSWORD|ADMIN_SESSION_SECRET)=' }
  [IO.File]::WriteAllLines($envPath, $retainedLines, [Text.UTF8Encoding]::new($false))
}

$superPassword = New-SecureValue
$migrationPassword = New-SecureValue
$runtimePassword = New-SecureValue
$temporaryTrustEnabled = $false
$originalHba = $null

try {
  $databaseUrlConfigured = (Test-Path -LiteralPath $envPath) -and [bool](Select-String -LiteralPath $envPath -Pattern '^DATABASE_URL=postgresql://' -Quiet)
  if ((Test-Path -LiteralPath $psql) -and $databaseUrlConfigured) {
    Invoke-DatabaseSetup
    Remove-ObsoleteAdminSecrets
    Write-Output 'The existing PostgreSQL installation is configured and database setup completed.'
    return
  }

  if (-not (Test-Path -LiteralPath $psql)) {
    New-Item -ItemType Directory -Path $tempRoot -Force | Out-Null
    Invoke-WebRequest -UseBasicParsing -Uri $installerUrl -OutFile $installerPath
    $actualHash = (Get-FileHash -LiteralPath $installerPath -Algorithm SHA256).Hash
    if ($actualHash -ne $installerSha256) {
      throw 'The PostgreSQL installer checksum did not match the trusted package manifest.'
    }

    $installOptions = @(
      'mode=unattended'
      'unattendedmodeui=none'
      "prefix=$postgresRoot"
      "datadir=$postgresRoot\data"
      'serverport=5432'
      'servicename=postgresql-x64-18'
      'superaccount=postgres'
      "superpassword=$superPassword"
      "servicepassword=$superPassword"
      'create_shortcuts=0'
      'disable-components=pgAdmin,stackbuilder'
    )
    [IO.File]::WriteAllLines($optionPath, $installOptions, [Text.UTF8Encoding]::new($false))
    $installer = Start-Process -FilePath $installerPath -ArgumentList '--optionfile', $optionPath -Wait -PassThru -WindowStyle Hidden
    if ($installer.ExitCode -ne 0) { throw "PostgreSQL installer exited with code $($installer.ExitCode)." }
  }

  if (-not (Test-Path -LiteralPath $psql) -or -not (Test-Path -LiteralPath $createdb)) {
    throw 'PostgreSQL command-line tools were not found after installation.'
  }

  if (Test-Path -LiteralPath $hbaPath) {
    $originalHba = [IO.File]::ReadAllText($hbaPath)
    $temporaryTrustEnabled = $true
    $temporaryHba = "# Temporary local recovery rule created by LB CodeBase setup`r`nhost all postgres 127.0.0.1/32 trust`r`nhost all postgres ::1/128 trust`r`n$originalHba"
    [IO.File]::WriteAllText($hbaPath, $temporaryHba, [Text.UTF8Encoding]::new($false))
    Restart-Service -Name 'postgresql-x64-18'
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  } else {
    $env:PGPASSWORD = $superPassword
  }
  $roleSql = @(
    "DO `$roles`$"
    'BEGIN'
    "  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lb_migrator') THEN"
    "    CREATE ROLE lb_migrator LOGIN PASSWORD '$migrationPassword' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;"
    '  ELSE'
    "    ALTER ROLE lb_migrator WITH LOGIN PASSWORD '$migrationPassword' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;"
    '  END IF;'
    "  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'lb_app') THEN"
    "    CREATE ROLE lb_app LOGIN PASSWORD '$runtimePassword' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;"
    '  ELSE'
    "    ALTER ROLE lb_app WITH LOGIN PASSWORD '$runtimePassword' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION;"
    '  END IF;'
    'END'
    "`$roles`$;"
  )
  [IO.File]::WriteAllLines($roleSqlPath, $roleSql, [Text.UTF8Encoding]::new($false))
  & $psql --host 127.0.0.1 --port 5432 --username postgres --dbname postgres --set ON_ERROR_STOP=1 --file $roleSqlPath | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL role provisioning failed.' }

  $databaseExists = (& $psql --host 127.0.0.1 --port 5432 --username postgres --dbname postgres --tuples-only --no-align --command "SELECT 1 FROM pg_database WHERE datname = 'lb_developers'" | Out-String).Trim()
  if ($databaseExists -ne '1') {
    & $createdb --host 127.0.0.1 --port 5432 --username postgres --owner lb_migrator --encoding UTF8 lb_developers
    if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL database creation failed.' }
  }
  & $psql --host 127.0.0.1 --port 5432 --username postgres --dbname postgres --set ON_ERROR_STOP=1 --command 'REVOKE ALL ON DATABASE lb_developers FROM PUBLIC' | Out-Null
  & $psql --host 127.0.0.1 --port 5432 --username postgres --dbname postgres --set ON_ERROR_STOP=1 --command 'GRANT CONNECT ON DATABASE lb_developers TO lb_migrator, lb_app' | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL database permission setup failed.' }

  if ($temporaryTrustEnabled) {
    [IO.File]::WriteAllText($hbaPath, $originalHba, [Text.UTF8Encoding]::new($false))
    Restart-Service -Name 'postgresql-x64-18'
    $temporaryTrustEnabled = $false
  }

  $envLines = [System.Collections.Generic.List[string]]::new()
  if (Test-Path -LiteralPath $envPath) {
    foreach ($line in [IO.File]::ReadAllLines($envPath)) { $envLines.Add($line) }
  }
  Set-DotEnvValue -Key 'DATABASE_URL' -Value "postgresql://lb_app:$runtimePassword@127.0.0.1:5432/lb_developers" -Lines $envLines
  Set-DotEnvValue -Key 'DATABASE_MIGRATION_URL' -Value "postgresql://lb_migrator:$migrationPassword@127.0.0.1:5432/lb_developers" -Lines $envLines
  Set-DotEnvValue -Key 'DATABASE_SSL' -Value 'false' -Lines $envLines
  Set-DotEnvValue -Key 'DATABASE_SSL_REJECT_UNAUTHORIZED' -Value 'true' -Lines $envLines
  Set-DotEnvValue -Key 'DB_POOL_MAX' -Value '10' -Lines $envLines
  $saltLine = $envLines | Where-Object { $_ -match '^IP_HASH_SALT=' } | Select-Object -First 1
  if (-not $saltLine -or $saltLine -match 'replace-with|^IP_HASH_SALT=$') {
    Set-DotEnvValue -Key 'IP_HASH_SALT' -Value (New-SecureValue) -Lines $envLines
  }
  [IO.File]::WriteAllLines($envPath, $envLines, [Text.UTF8Encoding]::new($false))

  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  Invoke-DatabaseSetup
  Remove-ObsoleteAdminSecrets
  Write-Output 'PostgreSQL is installed, isolated roles are configured, and database setup completed.'
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  if ($temporaryTrustEnabled -and $null -ne $originalHba) {
    [IO.File]::WriteAllText($hbaPath, $originalHba, [Text.UTF8Encoding]::new($false))
    Restart-Service -Name 'postgresql-x64-18'
  }
  foreach ($secretFile in @($optionPath, $roleSqlPath)) {
    if (Test-Path -LiteralPath $secretFile) { Remove-Item -LiteralPath $secretFile -Force }
  }
  if (Test-Path -LiteralPath $installerLog) {
    $logInfo = Get-Item -LiteralPath $installerLog
    if ($logInfo.LastWriteTime -ge $startedAt) { Remove-Item -LiteralPath $installerLog -Force }
  }
  if ((Test-Path -LiteralPath $psql) -and (Test-Path -LiteralPath $installerPath)) {
    Remove-Item -LiteralPath $installerPath -Force
  }
}
