# Define the remote IP address
$remoteport = "172.30.69.53"

# Validate if the remoteport is a valid IP address
$found = $remoteport -match '^(?:\d{1,3}\.){3}\d{1,3}$'

if ($found) {
    $remoteport = $matches[0]
} else {
    Write-Output "The Script Exited, the IP address of WSL 2 cannot be found"
    exit
}

# Ports to be forwarded
$ports = @(22, 80, 443, 3000, 8000, 8042, 8080, 8081, 8888)
$addr = '0.0.0.0'

# Remove existing firewall exception rules
Remove-NetFireWallRule -DisplayName 'WSL 2 Firewall Unlock' -ErrorAction SilentlyContinue

# Add new firewall exception rules for inbound and outbound traffic for each port
foreach ($port in $ports) {
    New-NetFireWallRule -DisplayName "WSL 2 Firewall Unlock $port Inbound" -Direction Inbound -LocalPort $port -Action Allow -Protocol TCP
    New-NetFireWallRule -DisplayName "WSL 2 Firewall Unlock $port Outbound" -Direction Outbound -LocalPort $port -Action Allow -Protocol TCP
}

# Set up port forwarding rules
foreach ($port in $ports) {
    netsh interface portproxy delete v4tov4 listenport=$port listenaddress=$addr
    netsh interface portproxy add v4tov4 listenport=$port listenaddress=$addr connectport=$port connectaddress=$remoteport
}

# VcXsrv Firewall Rules
# Remove existing VcXsrv firewall exception rules
Remove-NetFireWallRule -DisplayName 'VcXsrv windows xserver' -ErrorAction SilentlyContinue
Remove-NetFireWallRule -DisplayName 'WSL 2 VcXsrv' -ErrorAction SilentlyContinue

# Add new VcXsrv firewall exception rule for inbound traffic
New-NetFireWallRule -DisplayName 'WSL 2 VcXsrv' -Direction Inbound -LocalPort 6000 -Action Allow -Protocol TCP -RemoteAddress 172.30.69.53/20
