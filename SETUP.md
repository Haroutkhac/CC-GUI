# Claude Code Guild - Setup Guide

## Quick Start (Local Only)

```bash
cd CC-GUI
npm run dev
```
Open http://localhost:5173

## Remote Access via Tailscale

Tailscale CLI is installed. The daemon runs in userspace mode.

### Start Tailscale daemon
```bash
/opt/homebrew/opt/tailscale/bin/tailscaled --tun=userspace-networking \
  --state=/tmp/tailscaled.state --socket=/tmp/tailscaled.sock \
  --socks5-server=localhost:1055 &
```

### Login (first time only)
```bash
tailscale --socket=/tmp/tailscaled.sock up
```
This prints a URL - open it in your browser and sign in.

### 🔴 Install Tailscale on your phone/other devices
- **iOS**: App Store → "Tailscale"
- **Android**: Play Store → "Tailscale"
- **Other Mac/PC**: https://tailscale.com/download
- Sign into the **same account** on every device

### Get your Tailscale IP
```bash
tailscale --socket=/tmp/tailscaled.sock ip -4
```

### Run the Guild server
```bash
cd CC-GUI
npm run build
npm start
```

### Access from anywhere
Open `http://[tailscale-ip]:3456` from any device on your Tailnet.

## Seed Test Data
To populate all 8 regions with 24 Pokemon:
```bash
node seed.js
```

## Controls
- **WASD / Arrow keys**: Walk around
- **Enter / Space**: Interact with Pokemon or tables
- **Click**: Click Pokemon to open terminal, click tables to manage
- **ESC**: Close terminal or dialog
