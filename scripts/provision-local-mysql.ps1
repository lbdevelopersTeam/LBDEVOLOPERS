$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$mysqlBase = 'C:\Program Files\MySQL\MySQL Server 8.4'
$mysqld = Join-Path $mysqlBase 'bin\mysqld.exe'
$mysql = Join-Path $mysqlBase 'bin\mysql.exe'
foreach ($executable in @($mysqld, $mysql)) {
  if (-not (Test-Path -LiteralPath $executable -PathType Leaf)) {
    throw "Required MySQL executable was not found: $executable"
  }
}

$localAppData = [Environment]::GetFolderPath([Environment+SpecialFolder]::LocalApplicationData)
$instanceRoot = [IO.Path]::GetFullPath((Join-Path $localAppData 'LBDevelopers\mysql84'))
$allowedRoot = [IO.Path]::GetFullPath($localAppData).TrimEnd('\') + '\'
if (-not $instanceRoot.StartsWith($allowedRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Refusing to provision outside LocalApplicationData: $instanceRoot"
}

$dataDirectory = Join-Path $instanceRoot 'data'
$configPath = Join-Path $instanceRoot 'my.ini'
$errorLog = Join-Path $instanceRoot 'mysql-error.log'
$pidFile = Join-Path $instanceRoot 'mysql.pid'
$rootSecretPath = Join-Path $instanceRoot '.root-password'
$provisionedMarker = Join-Path $instanceRoot '.provisioned'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$environmentPath = Join-Path $projectRoot '.env'

New-Item -ItemType Directory -Path $instanceRoot -Force | Out-Null
New-Item -ItemType Directory -Path $dataDirectory -Force | Out-Null

$forwardBase = $mysqlBase.Replace('\', '/')
$forwardData = $dataDirectory.Replace('\', '/')
$forwardLog = $errorLog.Replace('\', '/')
$forwardPid = $pidFile.Replace('\', '/')
$configuration = @"
[mysqld]
basedir=$forwardBase
datadir=$forwardData
port=3306
bind-address=127.0.0.1
mysqlx=0
character-set-server=utf8mb4
collation-server=utf8mb4_0900_ai_ci
default-time-zone=+00:00
secure-file-priv=NULL
log-error=$forwardLog
pid-file=$forwardPid

[client]
port=3306
host=127.0.0.1
default-character-set=utf8mb4
"@
[IO.File]::WriteAllText($configPath, $configuration, [Text.UTF8Encoding]::new($false))

if (-not (Test-Path -LiteralPath (Join-Path $dataDirectory 'mysql') -PathType Container)) {
  & $mysqld --initialize-insecure "--basedir=$mysqlBase" "--datadir=$dataDirectory"
  if ($LASTEXITCODE -ne 0) { throw "MySQL initialization failed with exit code $LASTEXITCODE." }
}

$listener = Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not $listener) {
  $server = Start-Process -FilePath $mysqld -ArgumentList "--defaults-file=`"$configPath`"" -WindowStyle Hidden -PassThru
  $ready = $false
  for ($attempt = 0; $attempt -lt 40; $attempt++) {
    Start-Sleep -Milliseconds 500
    if ($server.HasExited) { throw "MySQL stopped during startup. Inspect $errorLog." }
    if (Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue) {
      $ready = $true
      break
    }
  }
  if (-not $ready -and -not (Test-Path -LiteralPath $provisionedMarker)) {
    throw "MySQL did not become ready. Inspect $errorLog."
  }
}

function New-DatabasePassword {
  $bytes = [byte[]]::new(36)
  $generator = [Security.Cryptography.RandomNumberGenerator]::Create()
  try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
  return [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Set-EnvironmentValues([Collections.Specialized.OrderedDictionary]$updates) {
  $lines = [Collections.Generic.List[string]]::new()
  if (Test-Path -LiteralPath $environmentPath) {
    foreach ($line in Get-Content -LiteralPath $environmentPath) { $lines.Add([string]$line) }
  }
  $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  for ($index = 0; $index -lt $lines.Count; $index++) {
    if ($lines[$index] -match '^([A-Z][A-Z0-9_]*)=') {
      $key = $Matches[1]
      if ($updates.Contains($key)) {
        $lines[$index] = "$key=$($updates[$key])"
        [void]$seen.Add($key)
      }
    }
  }
  foreach ($key in $updates.Keys) {
    if (-not $seen.Contains([string]$key)) { $lines.Add("$key=$($updates[$key])") }
  }
  [IO.File]::WriteAllText($environmentPath, (($lines -join "`r`n") + "`r`n"), [Text.UTF8Encoding]::new($false))
}

if (-not (Test-Path -LiteralPath $provisionedMarker -PathType Leaf)) {
  $existingRootSecret = Test-Path -LiteralPath $rootSecretPath -PathType Leaf
  $rootPassword = if ($existingRootSecret) { (Get-Content -Raw -LiteralPath $rootSecretPath).Trim() } else { New-DatabasePassword }
  $migrationPassword = New-DatabasePassword
  $runtimePassword = New-DatabasePassword
  $adminPassword = New-DatabasePassword

  $provisionSql = @"
ALTER USER 'root'@'localhost' IDENTIFIED BY '$rootPassword';
CREATE DATABASE IF NOT EXISTS lb_developers_v3 CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'lb_v3_migrator'@'127.0.0.1' IDENTIFIED BY '$migrationPassword';
ALTER USER 'lb_v3_migrator'@'127.0.0.1' IDENTIFIED BY '$migrationPassword';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX, REFERENCES, CREATE TEMPORARY TABLES, LOCK TABLES ON lb_developers_v3.* TO 'lb_v3_migrator'@'127.0.0.1';
CREATE USER IF NOT EXISTS 'lb_v3_app'@'127.0.0.1' IDENTIFIED BY '$runtimePassword';
ALTER USER 'lb_v3_app'@'127.0.0.1' IDENTIFIED BY '$runtimePassword';
GRANT SELECT, INSERT, UPDATE, DELETE ON lb_developers_v3.* TO 'lb_v3_app'@'127.0.0.1';
FLUSH PRIVILEGES;
"@
  $processInfo = [Diagnostics.ProcessStartInfo]::new()
  $processInfo.FileName = $mysql
  $processInfo.Arguments = '--protocol=tcp --host=127.0.0.1 --port=3306 --user=root --batch'
  $processInfo.UseShellExecute = $false
  $processInfo.CreateNoWindow = $true
  $processInfo.RedirectStandardInput = $true
  $processInfo.RedirectStandardError = $true
  if ($existingRootSecret) { $processInfo.EnvironmentVariables['MYSQL_PWD'] = $rootPassword }
  $client = [Diagnostics.Process]::new()
  $client.StartInfo = $processInfo
  [void]$client.Start()
  $client.StandardInput.WriteLine($provisionSql)
  $client.StandardInput.Close()
  $errors = $client.StandardError.ReadToEnd()
  $client.WaitForExit()
  if ($client.ExitCode -ne 0) { throw "MySQL account provisioning failed: $errors" }

  [IO.File]::WriteAllText($rootSecretPath, $rootPassword, [Text.UTF8Encoding]::new($false))
  & icacls.exe $rootSecretPath /inheritance:r /grant:r "${env:USERNAME}:(F)" | Out-Null

  $encodedMigrationPassword = [Uri]::EscapeDataString($migrationPassword)
  $encodedRuntimePassword = [Uri]::EscapeDataString($runtimePassword)
  $updates = [Collections.Specialized.OrderedDictionary]::new()
  $updates['MYSQL_DATABASE_URL'] = "mysql://lb_v3_app:$encodedRuntimePassword@127.0.0.1:3306/lb_developers_v3"
  $updates['MYSQL_MIGRATION_URL'] = "mysql://lb_v3_migrator:$encodedMigrationPassword@127.0.0.1:3306/lb_developers_v3"
  $updates['MYSQL_SSL'] = 'false'
  $updates['MYSQL_SSL_REJECT_UNAUTHORIZED'] = 'true'
  $updates['MYSQL_POOL_MAX'] = '10'
  $updates['MYSQL_ADMIN_INITIAL_PASSWORD'] = $adminPassword
  $updates['API_CURSOR_SECRET'] = New-DatabasePassword
  $updates['API_V3_REQUIRED'] = 'true'
  Set-EnvironmentValues $updates
  [IO.File]::WriteAllText($provisionedMarker, (Get-Date).ToUniversalTime().ToString('O'), [Text.UTF8Encoding]::new($false))
}

$startupDirectory = [Environment]::GetFolderPath([Environment+SpecialFolder]::Startup)
$startupPath = Join-Path $startupDirectory 'LBDevelopersMySQL84.cmd'
$startupCommand = "@echo off`r`nstart `"`" /B `"$mysqld`" --defaults-file=`"$configPath`"`r`n"
[IO.File]::WriteAllText($startupPath, $startupCommand, [Text.ASCIIEncoding]::new())

Write-Output 'Local MySQL 8.4 provisioned on 127.0.0.1:3306. Credentials were stored locally and were not printed.'
