#!/usr/bin/env bash
# Generate a self-signed certificate for local HTTPS development.
# Usage: ./certs/generate-dev-cert.sh [extra-hostnames-or-ips ...]
#
# Creates certs/dev.crt and certs/dev.key valid for 365 days.
# SANs always include localhost, 127.0.0.1, and the mDNS .local hostname.
# Auto-detects local LAN IPs (192.168.x.x, 10.x.x.x) and adds them.
# Pass additional hostnames or IPs as arguments if needed.

set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")" && pwd)"
CERT_FILE="$CERT_DIR/dev.crt"
KEY_FILE="$CERT_DIR/dev.key"

if [ -f "$CERT_FILE" ] && [ -f "$KEY_FILE" ]; then
  echo "Certs already exist at $CERT_DIR — delete them first to regenerate."
  exit 0
fi

# Build SAN list starting with localhost
SAN="DNS:localhost,IP:127.0.0.1"

# Auto-detect mDNS .local hostname (macOS)
MDNS_HOST=$(scutil --get LocalHostName 2>/dev/null | tr '[:upper:]' '[:lower:]' || true)
if [ -n "$MDNS_HOST" ]; then
  SAN="$SAN,DNS:${MDNS_HOST}.local"
fi

# Auto-detect LAN IPs (macOS and Linux compatible)
LAN_IPS=$(ifconfig 2>/dev/null | grep 'inet ' | awk '{print $2}' | grep -E '^(192\.168\.|10\.)' || true)
for ip in $LAN_IPS; do
  SAN="$SAN,IP:$ip"
done

# Add any extra hostnames or IPs passed as arguments
for arg in "$@"; do
  if echo "$arg" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$'; then
    SAN="$SAN,IP:$arg"
  else
    SAN="$SAN,DNS:$arg"
  fi
done

echo "Generating cert with SANs: $SAN"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout "$KEY_FILE" \
  -out "$CERT_FILE" \
  -subj "/CN=localhost" \
  -addext "subjectAltName=$SAN"

echo "Created $CERT_FILE and $KEY_FILE"
