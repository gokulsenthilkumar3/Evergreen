param([Parameter(Mandatory=$true)][string]$ProjectRoot)
$ErrorActionPreference = 'Stop'
$resolvedRoot = [IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
$verifiedProcesses = @()
# Include booting or failed processes that have not acquired their port yet.
$apiPaths = @((Join-Path $resolvedRoot 'apps\api\dist\main.js'), (Join-Path $resolvedRoot 'apps\admin-api\dist\main.js'))
foreach ($projectProcess in @(Get-CimInstance Win32_Process -Filter "Name = 'node.exe'")) {
  $projectCommand = ([string]$projectProcess.CommandLine).Replace('/','\')
  foreach ($apiPath in $apiPaths) {
    if ($projectCommand.ToLowerInvariant().Contains($apiPath.ToLowerInvariant())) { $verifiedProcesses += $projectProcess.ProcessId; break }
  }
}
$listeners = @(Get-NetTCPConnection -State Listen -ErrorAction Stop)
foreach ($port in @(4300,4301,5555)) {
  $connections = @($listeners | Where-Object { $_.LocalPort -eq $port })
  foreach ($processId in @($connections.OwningProcess | Select-Object -Unique)) {
    if (!$processId -or $processId -eq $PID) { continue }
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $processId"
    $command = ([string]$process.CommandLine).Replace('/','\')
    $expected = if ($port -eq 4301) { Join-Path $resolvedRoot 'apps\api\dist\main.js' } elseif ($port -eq 4300) { Join-Path $resolvedRoot 'apps\admin-api\dist\main.js' } else { Join-Path $resolvedRoot 'node_modules\prisma\build\index.js' }
    if (!$command.ToLowerInvariant().Contains($expected.ToLowerInvariant()) -or ($port -eq 5555 -and !$command.Contains('studio'))) { throw 'A target port belongs to an unverified process; no process was stopped on that port.' }
    $verifiedProcesses += $processId
  }
}
foreach ($processId in @($verifiedProcesses | Select-Object -Unique)) { Stop-Process -Id $processId -ErrorAction Stop }
