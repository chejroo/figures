# Deploys the current working tree to home.pl over SFTP using a WinSCP
# saved site (credentials stay in WinSCP's stored session, never here).
#
# -Delete removes remote files with no local match. Leave it off until
# you've confirmed the remote folder only contains files this repo owns —
# home.pl may have placed its own .htaccess/default index there.
param(
  [string]$Site = "serwer2691768.hosting-home.pl",
  [string]$RemotePath = "/public_html",
  [switch]$Delete
)

$winscp = "C:\Program Files (x86)\WinSCP\WinSCP.com"
$deleteFlag = if ($Delete) { "-delete" } else { "" }

& $winscp /log="deploy.log" /command `
  "open `"$Site`"" `
  "synchronize remote $deleteFlag -filemask=|.git/; .gitignore; .git; deploy.ps1 $PWD $RemotePath" `
  "exit"
