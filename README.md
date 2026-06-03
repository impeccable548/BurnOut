---

```markdown
<div align="center">
<img width="1200" height="475" alt="BurnOut Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# BurnOut // Solana Wallet Optimizer & Rent Reclamation Engine

> **Reclaim trapped capital. Diagnose VM state failures. Burn out legacy account bloat.**

BurnOut is a production-ready Solana utility that scans wallets for dormant token accounts, calculates recoverable rent-exempt SOL, and executes real on-chain account closures directly through connected wallets.

---

## 🔥 Features

### **Rent Reclamation Engine**
- Scan any Solana wallet address for **empty SPL token accounts**
- Identify accounts holding **0.00203928 SOL** in rent-exempt storage
- Execute live transactions to close unused token allocations
- Reclaim trapped capital back to your wallet **instantly**
- Support for both **Token Program** and **Token-2022 Program** accounts

### **Transaction Diagnostics Console**
- Map raw Solana Virtual Machine errors to human-readable explanations
- Decode cryptic instruction failures from Jupiter, Metaplex, and other programs
- Generate recovery strategies for failed swaps, mints, and DeFi interactions
- Historical transaction autopsy and root cause analysis

### **Network Telemetry Dashboard**
- Real-time Solana mainnet metrics (TPS, congestion, validators)
- Live priority fee scheduler across compute unit tiers
- Block height tracking and epoch progression validation
- Network health heuristics and uptime monitoring

### **Multi-Wallet Support**
- **Phantom Wallet** native integration
- **Solflare Wallet** adapter support
- Secure transaction signing via browser extension
- No private keys stored or transmitted

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- A Solana wallet (Phantom, Solflare, etc.)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/impeccable548/BurnOut.git
cd BurnOut
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the project root:
```env
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_SOLANA_NETWORK=mainnet-beta
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Build for production:**
```bash
npm run build
npm run start
```

The application will be available at `http://localhost:3000`.

---

## 📋 Architecture

### **Frontend Layer (React + TypeScript)**
- **React 19** with Vite for fast HMR and optimized builds
- **Motion.js** for fluid, interactive animations and state transitions
- **Tailwind CSS v4** for responsive, utility-first styling
- **Lucide React** for cohesive icon system
- **Wallet Adapter React** for seamless wallet integration

### **Backend Service Layer (Express.js + Node.js)**
- **Solana RPC Integration**: Direct blockchain communication for live account queries
- **Wallet Analysis Engine**: Scans addresses for unused token accounts and dust positions
- **Rent Computation**: Calculates reclaimable SOL from rent-exempt accounts
- **Transaction Simulation**: Pre-execution validation and error diagnosis
- **Network Telemetry**: Real-time TPS, priority fee, and congestion metrics

### **On-Chain Execution Layer**
- **Wallet Adapter Integration**: Phantom, Solflare, and compatible wallets
- **SPL Token Program**: Close account instructions via `@solana/spl-token`
- **Transaction Builder**: Atomic batching of multiple closure instructions
- **Signature Polling**: Confirmation tracking with automatic retries

---

## 📊 Data Flow & Processing Pipeline

```
User Input (Wallet Address)
    ↓
[Solana RPC Queries]
    ├→ getBalance (native SOL)
    ├→ getTokenAccountsByOwner (Token Program)
    └→ getTokenAccountsByOwner (Token-2022 Program)
    ↓
[Account State Analysis]
    ├→ Identify unused token accounts (balance = 0)
    ├→ Calculate rent-exempt SOL per account
    └→ Simulate reclamation transactions
    ↓
[Error Diagnostics & Optimization]
    ├→ Parse failed transaction logs
    ├→ Map VM instruction errors
    └→ Generate recovery strategies
    ↓
[Wallet Connection Check]
    ├→ Phantom/Solflare adapter status
    ├→ User signature authorization
    └→ Real transaction execution OR simulation fallback
    ↓
[Frontend Rendering]
    └→ Animated, real-time dashboard with transaction status
```

---

## 🔗 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Bundler** | Vite + esbuild | Fast HMR and production builds |
| **Runtime** | Node.js (tsx) | TypeScript-first backend execution |
| **API Framework** | Express.js | RESTful endpoint management |
| **Blockchain** | @solana/web3.js | RPC communication & transaction handling |
| **Wallets** | @solana/wallet-adapter-react | Phantom, Solflare, and compatible wallets |
| **SPL Token** | @solana/spl-token | Account closure instructions |
| **UI Components** | React + TypeScript | Type-safe component architecture |
| **Animations** | Motion (Framer Motion) | Responsive, animated design system |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |
| **Environment** | dotenv | Secure configuration management |

---

## 🔐 Type Safety & Contracts

The application implements strict TypeScript interfaces across the stack:

```typescript
// Empty token accounts eligible for closure
interface UnusedAccount {
  mint: string;
  mangled_mint: string;
  symbol: string;
  name: string;
  balance: number;
  reclaimable_sol: number;
  state: string;
}

// Structured error analysis with recovery actions
interface FailedTransactionDiagnostic {
  signature: string;
  program_id: string;
  program_name: string;
  error_code: string;
  error_message: string;
  human_cause: string;
  recovery_action: string;
  timestamp: string;
}

// Comprehensive wallet assessment report
interface AnalysisResult {
  address: string;
  is_valid: boolean;
  reclamation: {
    total_reclaimable_sol: number;
    dead_accounts_count: number;
    reclaimable_accounts: UnusedAccount[];
  };
  failed_transactions: FailedTransactionDiagnostic[];
  optimizations: string[];
  is_real_data?: boolean;
  real_sol_balance?: number;
  reclamation_simulated?: boolean;
}

// Real-time blockchain network telemetry
interface NetworkStatus {
  status: string;
  congestion_level: string;
  current_tps: number;
  average_tps_5m: number;
  ping_time_ms: number;
  priority_fees: {
    low: number;
    medium: number;
    high: number;
    extreme: number;
    priority_fee_micro_lamports: {
      low: number;
      medium: number;
      high: number;
      extreme: number;
    };
  };
  block_height: number;
  active_validators: number;
}
```

---

## 💡 How It Works

### **Step 1: Analyze Wallet**
```
1. Enter Solana wallet address (public key)
2. BurnOut queries the blockchain for all token accounts owned by address
3. Filters for empty accounts (0 balance) holding rent-exempt SOL
4. Displays total recoverable capital and account breakdown
```

### **Step 2: Connect Wallet**
```
1. Click "Connect Wallet" button
2. Approve connection in Phantom/Solflare extension
3. Your public key is loaded into the application
4. Ready for transaction signing
```

### **Step 3: Execute Reclamation**
```
1. Review empty accounts to be closed
2. Click "BURN OUT RENT" button
3. Application builds a multi-instruction transaction
4. Phantom/Solflare prompts for signature approval
5. Transaction is submitted to Solana mainnet
6. BurnOut polls for confirmation
7. Success! Reclaimed SOL is added to your wallet
```

### **Fallback: Simulation Mode**
```
- If wallet is NOT connected, reclamation runs in simulation mode
- UI animates account closures for demo/testing purposes
- No real blockchain activity occurs
- Perfect for understanding the process without signing
```

---

## 🛡️ Safety & Best Practices

### **Account Closure is Safe Because:**
- ✅ Only closes empty accounts (0 balance)
- ✅ All reclaimed SOL returns to your wallet
- ✅ If you receive the token again, new ATA is created automatically
- ✅ No data loss — token history remains on-chain
- ✅ Zero risk to active positions or staking

### **Security Measures:**
- ✅ Private keys never exposed (wallet adapter only)
- ✅ Transactions signed client-side only
- ✅ RPC endpoints can be customized via `.env`
- ✅ All account instructions validated before execution
- ✅ Automatic retry on temporary failures

---

## 🎨 Design Philosophy: Ember & Mint

Unlike generic, flashy Web3 templates designed to exaggerate stats, BurnOut operates under **high mechanical constraint**:

- **🔥 Ember Orange** (#FF5722): Interactive elements, warnings, and failed transaction markers
- **✅ Mint Green** (#10B981): Positive validations, successful confirmations, and reclaimed amounts
- **⚪ Zinc Neutral** (#71717a): Secondary information and background states

This color language ensures critical states are always immediately apparent.

---

## 📖 API Reference

### **GET /api/network/status**
Returns live Solana mainnet telemetry.
```json
{
  "status": "online",
  "congestion_level": "Medium",
  "current_tps": 2487,
  "average_tps_5m": 2350,
  "ping_time_ms": 18,
  "block_height": 268453102,
  "active_validators": 1942,
  "priority_fees": { ... }
}
```

### **POST /api/wallet/analyze**
Analyzes a wallet for empty token accounts and rent reclamation opportunities.

**Request:**
```json
{
  "address": "5J9vKp...8rF9V"
}
```

**Response:**
```json
{
  "address": "5J9vKp...8rF9V",
  "is_valid": true,
  "reclamation": {
    "total_reclaimable_sol": 0.015,
    "dead_accounts_count": 7,
    "reclaimable_accounts": [ ... ]
  },
  "failed_transactions": [ ... ],
  "optimizations": [ ... ],
  "is_real_data": true,
  "real_sol_balance": 2.5
}
```

---

## 🧪 Testing

Run the linter to check TypeScript compliance:
```bash
npm run lint
```

### Demo Wallets (for testing)
- **Dormant Yield Wallet**: `BurnOutReclaim77777777777777777777777777777`
- **Congested NFT Trader**: `Jup6LkbZbjS1jKKgqp7GYYm7Fp1ZgS8c6L7298Z8Hq6`

These addresses trigger demo mode with simulated reclamation data.

---

## 📚 Documentation

- **Mechanics Tab**: Deep dive into Solana rent economics and instruction-level autopsies
- **Telemetry Tab**: Live network metrics and priority fee scheduler
- **About Section**: Frequently answered queries and technical reference manual

---

## 🐛 Known Limitations

- Mainnet only (not deployed on Devnet/Testnet)
- Maximum 50 accounts per transaction batch (can be increased)
- Requires ~5,000 compute units per close instruction
- Transaction confirmation polling timeout: 90 seconds

---

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and submit pull requests to the `main` branch.

---

## 📄 License

Licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

---

## 🔗 Resources

- **Solana Docs**: https://docs.solana.com
- **Web3.js Reference**: https://solana-labs.github.io/solana-web3.js/
- **SPL Token Program**: https://github.com/solana-labs/solana-program-library/tree/master/token
- **Wallet Adapter**: https://github.com/solana-labs/wallet-adapter

---

## 📮 Support

For issues, feature requests, or questions:
- **GitHub Issues**: [Open an issue](https://github.com/impeccable548/BurnOut/issues)
- **Twitter**: [@burnout_io](https://twitter.com)
- **Email**: support@burnout.dev

---

## 🎯 Roadmap

- [ ] Devnet and Testnet support
- [ ] Ledger Hardware Wallet integration
- [ ] Batch transaction optimization (>50 accounts per tx)
- [ ] Token price oracle for USD conversion
- [ ] Automated rent reclamation scheduler
- [ ] Multi-wallet portfolio dashboard
- [ ] Mobile app (React Native)

---

<div align="center">

**Built with 🔥 on Solana**

Made by [impeccable548](https://github.com/impeccable548)

v1.0.0 • [Open in AI Studio](https://ai.studio/apps/d19cc5a6-bc3c-4baa-9dbe-39d922fabb6f)

</div>
```

---

