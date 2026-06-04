<div align="center">
  <h1>BurnOut</h1>
  <p><strong>Solana Wallet Diagnostics & Rent Reclamation Dashboard</strong></p>
  <p><em>Scan wallets for trapped rent. Decode failed transactions. Read the network in real time.</em></p>
</div>

---

## What it is

BurnOut is a browser-based diagnostics tool for Solana wallets. Paste any public address and it queries the chain to surface:

- **Reclaimable rent** locked in empty SPL token accounts (Token Program + Token-2022)
- **Failed transaction diagnostics** â€” raw VM errors translated into plain English with suggested recovery steps
- **Live network telemetry** â€” TPS, congestion, priority fees, block height, active validators

Built as a learning + portfolio project to explore Solana RPC, account model internals, and wallet adapter integration.

---

## Status

**Current build:** read-only scanner with wallet connect.
- âœ… Scans any address for empty token accounts and computes total reclaimable SOL
- âœ… Connects Phantom / Solflare via wallet adapter
- âœ… Displays failed-transaction diagnostics and network telemetry
- âœ… Server-side RPC proxy so the RPC endpoint key is never exposed in the browser
- ðŸš§ **Live account closure (signing) is in progress.** The UI flow exists; signing + on-chain submission is not yet wired end-to-end
- ðŸš§ **Wallet ownership check** before exposing close actions is on the roadmap

If you want to test reclamation logic today, the scanner accurately reports what *would* be reclaimable for a given address.

---

## Features

### Rent reclamation scanner
- Queries `getTokenAccountsByOwner` for both Token Program and Token-2022
- Filters for empty accounts (balance = 0) holding rent-exempt SOL (~0.00203928 SOL per account)
- Aggregates total recoverable amount and lists every account

### Transaction diagnostics console
- Maps raw Solana VM error codes to readable explanations
- Covers common program failures (Jupiter, Metaplex, SPL)
- Suggests recovery actions per error type

### Network telemetry
- Live TPS, 5-minute average, ping
- Priority fee tiers (low / medium / high / extreme) in micro-lamports
- Block height, epoch progression, validator count

---

## Tech stack

| Layer | Tools |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Motion |
| Wallets | `@solana/wallet-adapter-react`, Phantom, Solflare |
| Blockchain | `@solana/web3.js`, `@solana/spl-token` |
| Backend | Express.js RPC proxy (Node + tsx) â€” keeps RPC credentials server-side |

---

## Quick start

```bash
git clone https://github.com/impeccable548/BurnOut.git
cd BurnOut
npm install
```

Create a `.env.local` in the project root:

```env
VITE_SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

Note: the RPC URL is read server-side. The browser only talks to the local Express proxy, not the RPC provider directly.

Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## How it works

```
User pastes address
        â†“
Express RPC proxy
        â†“
Solana RPC
  â”œâ”€â”€ getBalance
  â”œâ”€â”€ getTokenAccountsByOwner (Token Program)
  â””â”€â”€ getTokenAccountsByOwner (Token-2022)
        â†“
Filter empty accounts â†’ compute reclaimable SOL
        â†“
Render dashboard (scan results, diagnostics, telemetry)
```

When closure signing lands, connected wallets matching the scanned address will be able to sign a batched `closeAccount` transaction.

---

## Roadmap

- [ ] Wire wallet-side signing for `closeAccount` instructions
- [ ] Ownership check: only show close UI when connected wallet matches scanned address
- [ ] Transaction simulation before signing
- [ ] Priority-fee suggestion based on live network telemetry
- [ ] Confirmation polling with retry/backoff
- [ ] Devnet support for safe testing
- [ ] Unit tests for the diagnostics decoder

---

## Why I built it

I wanted a project that pushed me into the actual Solana account model â€” rent exemption, the difference between Token and Token-2022, how RPC responses are shaped, and how wallet adapters handle transaction signing without ever touching a private key. The diagnostics console came from being frustrated by opaque transaction failures while learning.

---

## License

MIT