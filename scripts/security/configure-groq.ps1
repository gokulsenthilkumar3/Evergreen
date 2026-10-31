param(
  [ValidateSet('private','public','admin','customer','marketing')][string]$Scope = 'private',
  [string]$Model = 'openai/gpt-oss-20b'
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Security
if ($Model -notmatch '^[a-zA-Z0-9._/-]{1,100}$') { throw 'Invalid Groq model identifier' }
$directory = Join-Path $env:LOCALAPPDATA 'EverGreen\owner-host'
$file = Join-Path $directory 'groq.dpapi'
$config = @{}
if (Test-Path -LiteralPath $file) {
  $bytes = [Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($file),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  $stored = [Text.Encoding]::UTF8.GetString($bytes) | ConvertFrom-Json
  foreach ($property in $stored.PSObject.Properties) { $config[$property.Name] = $property.Value }
}
Write-Host "Configure the $Scope Groq assistant key for this Windows owner. Input is hidden."
$secure = Read-Host 'Paste your Groq API key' -AsSecureString
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
  $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer).Trim()
  if ($key.Length -lt 20 -or $key -match '\s') { throw 'A valid Groq key is required' }
  $name = @{ private = 'GROQ_API_KEY'; public = 'GROQ_PUBLIC_API_KEY'; admin = 'GROQ_ADMIN_API_KEY'; customer = 'GROQ_CUSTOMER_API_KEY'; marketing = 'GROQ_MARKETING_API_KEY' }[$Scope]
  $config[$name] = $key
  $config['GROQ_MODEL'] = $Model
  [IO.Directory]::CreateDirectory($directory) | Out-Null
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
  & icacls.exe $directory /inheritance:r /grant:r "${identity}:(OI)(CI)F" | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Unable to protect the owner configuration directory' }
  $plain = [Text.Encoding]::UTF8.GetBytes(($config | ConvertTo-Json -Compress))
  $encrypted = [Security.Cryptography.ProtectedData]::Protect($plain,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)
  $temporary = Join-Path $directory ('groq-' + [Guid]::NewGuid().ToString('N') + '.tmp')
  [IO.File]::WriteAllBytes($temporary,$encrypted)
  Move-Item -LiteralPath $temporary -Destination $file -Force
  Write-Host 'Protected configuration saved. Restart with npm run owner:start. The key was not displayed.'
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  $key = $null
  $config = $null
}
