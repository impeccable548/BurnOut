## Architecture

**BurnOut** is built on a **modern, full-stack TypeScript architecture** designed for efficient Solana blockchain interaction and wallet analysis. The system comprises three primary layers:

### **1. Frontend Layer (React + TypeScript)**
The client-side application leverages **React 19** with **Vite** for fast development and optimized builds. The UI framework utilizes:
- **Motion.js** for fluid, interactive animations and state transitions
- **Tailwind CSS v4** for responsive, utility-first styling
- **Lucide React** for a cohesive icon system

The frontend exposes a single-page application (SPA) that provides:
- **Wallet Scanner Interface**: Real-time address validation and analysis
- **Network Telemetry Dashboard**: Live Solana network status monitoring (TPS, congestion, validator health)
- **Transaction Diagnostics Console**: Human-readable error decoding and recovery action recommendations
- **Rent Reclamation Engine UI**: Interactive simulation and execution of account closure transactions

### **2. Backend Service Layer (Express.js + Node.js)**
The server-side infrastructure handles:
- **Solana RPC Integration**: Direct blockchain communication for account state queries
- **Wallet Analysis Engine**: Scans addresses to identify unused token accounts and dust positions
- **Rent Computation**: Calculates reclaimable SOL from rent-exempt accounts
- **Transaction Simulation**: Pre-execution validation and error diagnosis
- **Network State Aggregation**: Real-time TPS, priority fee, and congestion metrics

### **3. Data Flow & Processing Pipeline**

### **4. Technology Stack**
| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Bundler** | Vite + esbuild | Fast HMR and production builds |
| **Runtime** | Node.js (tsx) | TypeScript-first backend execution |
| **API Framework** | Express.js | RESTful endpoint management |
| **Blockchain** | @google/genai + Solana Web3.js | RPC communication & transaction handling |
| **UI Components** | React + TypeScript | Type-safe component architecture |
| **Styling** | Tailwind CSS + Motion | Responsive, animated design system |
| **Environment** | dotenv | Secure configuration management |

### **5. Type Safety & Contracts**
The application implements strict TypeScript interfaces across the stack:
- `UnusedAccount`: Represents token accounts eligible for closure
- `FailedTransactionDiagnostic`: Structured error analysis with recovery actions
- `AnalysisResult`: Comprehensive wallet assessment report
- `NetworkStatus`: Real-time blockchain network telemetry

This architecture ensures **type-safe data flow**, **efficient resource utilization**, and **scalable account analysis** for Solana wallet optimization.

link
https://burnout-sttd.onrender.com
ignore the one on the repo initial interface with click domain
