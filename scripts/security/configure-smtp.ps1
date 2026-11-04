param([ValidateSet('primary','secondary')][string]$Sender = 'primary')
$ErrorActionPreference = 'Stop'
$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$environmentFile = Join-Path $projectRoot 'apps/api/.env'
if (!(Test-Path -LiteralPath $environmentFile)) { throw 'Prepare apps/api/.env before configuring SMTP.' }
# Ensure a password will not be written to a tracked configuration file.
$ignored = & git -c "safe.directory=$projectRoot" -C $projectRoot check-ignore 'apps/api/.env' 2>$null
if ($LASTEXITCODE -ne 0 -or !$ignored) { throw 'apps/api/.env must be ignored by Git before storing credentials.' }
if ($Sender -eq 'primary') {
  $smtpHost = 'smtp.gmail.com'
  $smtpUser = 'gokulkangeyan@gmail.com'
  $smtpPort = '587'
  $smtpSecure = 'false'
} else {
  $smtpUser = 'gokulsenthilkumar3@zohomail.in'
  $smtpHost = (Read-Host 'Exact SMTP server shown in your Zoho mailbox settings').Trim().ToLowerInvariant()
  if ($smtpHost -notmatch '^(smtp|smtppro)\.zoho\.(com|in|eu|com\.au|jp|ca|sa|com\.cn)$') { throw 'Use the Zoho SMTP hostname from your account; no URL, path or port.' }
  $smtpPort = '465'
  $smtpSecure = 'true'
}
Write-Host "Configure $Sender sender $smtpUser through ${smtpHost}:$smtpPort."
$secretInput = Read-Host 'App password (hidden; not your normal account password)' -AsSecureString
$secretPointer = [IntPtr]::Zero
try {
  $secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretInput)
  $appSecret = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
  if ($Sender -eq 'primary') { $appSecret = $appSecret.Replace(' ', '') }
  if ($Sender -eq 'primary' -and $appSecret -notmatch '^[A-Za-z0-9]{16}$') { throw 'Enter the 16-character Google app password, not the regular account password.' }
  if (!$appSecret -or $appSecret -match '[\r\n"\\]') { throw 'The app password is empty or contains unsupported characters.' }
  $prefix = 'SMTP_' + $Sender.ToUpperInvariant() + '_'
  $settings = @{ HOST=$smtpHost; PORT=$smtpPort; SECURE=$smtpSecure; USER=$smtpUser; FROM=$smtpUser; PASSWORD=('"' + $appSecret + '"') }
  $environmentText = [IO.File]::ReadAllText($environmentFile)
  foreach ($setting in $settings.GetEnumerator()) {
    $key = $prefix + $setting.Key
    $line = $key + '=' + $setting.Value
    $pattern = '(?m)^' + [regex]::Escape($key) + '=.*$'
    if ([regex]::IsMatch($environmentText, $pattern)) {
      $environmentText = [regex]::Replace($environmentText, $pattern, [Text.RegularExpressions.MatchEvaluator]{ param($match) $line })
    } else { $environmentText += "`r`n$line" }
  }
  [IO.File]::WriteAllText($environmentFile, $environmentText, (New-Object Text.UTF8Encoding($false)))
  Write-Host 'Saved locally. Restart with npm run owner:start, then use Users > Invitations > Test SMTP connection.'
  Write-Host 'No message was sent and no password was printed.'
} finally {
  if ($secretPointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer) }
  $appSecret = $null; $environmentText = $null; $settings = $null
  $secretInput.Dispose()
}
