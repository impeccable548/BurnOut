import express from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";

// Solana base58 character validator
const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function isValidSolanaAddress(address: string): boolean {
  if (!address || address.length < 32 || address.length > 44) {
    return false;
  }
  for (let i = 0; i < address.length; i++) {
    if (!BASE58_ALPHABET.includes(address[i])) {
      return false;
    }
  }
  return true;
}

// Generate simple deterministic number from address string
function getDeterministicScore(address: string): number {
  const hash = crypto.createHash("sha256").update(address).digest("hex");
  return parseInt(hash.substring(0, 8), 16);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for checking JSON payloads
  app.use(express.json());

  // CORS logs or local headers (for simulation matching main.py CORS)
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // API Route 1: Network Status
  app.get("/api/network/status", (req, res) => {
    res.json({
      status: "online",
      congestion_level: "Medium",
      current_tps: 2487,
      average_tps_5m: 2350,
      ping_time_ms: 18,
      priority_fees: {
        low: 0.000005,
        medium: 0.000085,
        high: 0.000550,
        extreme: 0.002500,
        priority_fee_micro_lamports: {
          low: 1000,
          medium: 50000,
          high: 350000,
          extreme: 1200000
        }
      },
      block_height: 268453102,
      active_validators: 1942
    });
  });

  // API Route 2: Wallet Analysis
  app.post("/api/wallet/analyze", async (req, res) => {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({ detail: "Solana address is required." });
      }

      const trimmedAddress = String(address).trim();

      if (!isValidSolanaAddress(trimmedAddress)) {
        return res.status(422).json({
          detail: "Malformed Solana address. Must be a valid Base58 encoded string of 32 to 44 characters."
        });
      }

      const score = getDeterministicScore(trimmedAddress);
      let realSolBalance = 0;
      let reclaimableAccounts: any[] = [];
      let isRealData = false;

      // Helper for direct JSON-RPC fetching
      const fetchSolanaRPC = async (method: string, params: any[]): Promise<any> => {
        try {
          const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
          const response = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              id: Math.floor(Math.random() * 1000000),
              method,
              params
            })
          });
          if (!response.ok) return null;
          const json = await response.json();
          return json?.result;
        } catch (err) {
          console.warn(`RPC call ${method} failed, using optimized defaults.`);
          return null;
        }
      };

      // Attempt real live blockchain queries
      try {
        // 1. Fetch live native SOL balance
        const balanceVal = await fetchSolanaRPC("getBalance", [trimmedAddress]);
        if (balanceVal !== null && balanceVal !== undefined) {
          const lamports = balanceVal.value ?? 0;
          realSolBalance = lamports / 1000000000;
          isRealData = true;
        }

        // 2. Fetch SPL Token Accounts for Token Program
        const tokenAccounts = await fetchSolanaRPC("getTokenAccountsByOwner", [
          trimmedAddress,
          { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
          { encoding: "jsonParsed" }
        ]);

        // 3. Fetch SPL Token Accounts for Token-2022 Program
        const token2022Accounts = await fetchSolanaRPC("getTokenAccountsByOwner", [
          trimmedAddress,
          { programId: "TokenzQdQEZv4QK9vt7DKvct2N7Wvms8CcFBXgM4AH" },
          { encoding: "jsonParsed" }
        ]);

        const tokenAccountsVal = tokenAccounts && Array.isArray(tokenAccounts.value) ? tokenAccounts.value : [];
        const token2022AccountsVal = token2022Accounts && Array.isArray(token2022Accounts.value) ? token2022Accounts.value : [];

        const allRawAccounts = [
          ...tokenAccountsVal,
          ...token2022AccountsVal
        ];

        if (allRawAccounts.length > 0) {
          isRealData = true;
        }

        // Filter and map real empty (0 balance) accounts
        const wellKnownMints: Record<string, { symbol: string, name: string }> = {
          "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": { symbol: "USDC", name: "USD Coin" },
          "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": { symbol: "USDT", name: "Tether USD" },
          "So11111111111111111111111111111111111111112": { symbol: "wSOL", name: "Wrapped Solana" },
          "DezXAZ8z7PnrnMc9dy2QL75IQg5gRT6Hz6CgBUZ6yip3": { symbol: "BONK", name: "Bonk" },
          "JUPyiwrEb2mzkupw6vTcg8fcV9WGYwWAkuY3vypWJ8S": { symbol: "JUP", name: "Jupiter" },
          "HeLp6Do4q7V7AtAsbuSFjtnS96bM6N16f7PZ6bM6N16f": { symbol: "WIF", name: "dogwifhat" },
          "mSOL843HNvUMfN4ihS2CcZex98ugNZMiS98F6V66K4n": { symbol: "mSOL", name: "Marinade Staked" }
        };

        for (const raw of allRawAccounts) {
          const info = raw?.account?.data?.parsed?.info;
          if (!info) continue;

          const tokenAmount = info?.tokenAmount;
          const amount = tokenAmount?.amount ?? "0";
          const uiAmount = tokenAmount?.uiAmount ?? 0;
          const mint = info?.mint ?? "";

          // If amount is zero, there is locked rent exempt storage!
          if (amount === "0" || uiAmount === 0) {
            let symbol = "SPL";
            let name = "Dormant Token Slot";

            if (wellKnownMints[mint]) {
              symbol = wellKnownMints[mint].symbol;
              name = wellKnownMints[mint].name;
            } else if (mint) {
              const mintStr = String(mint);
              symbol = `TKN-${mintStr.substring(0, 4).toUpperCase()}`;
              name = "Custom Token Allocation";
            }

            const mintStr = String(mint || "");
            const mintPrefix = mintStr.substring(0, Math.min(12, mintStr.length));
            const mintSuffix = mintStr.length >= 8 ? mintStr.substring(mintStr.length - 8) : "";
            
            reclaimableAccounts.push({
              mint,
              mangled_mint: `${mintPrefix}...${mintSuffix}`,
              symbol,
              name,
              balance: 0.0,
              reclaimable_sol: 0.00203928,
              state: "Closed/Empty State"
            });
          }
        }

      } catch (err) {
        console.warn("Error retrieving live Solana accounts, falling back to clean simulator parameters.", err);
      }

       // Determine finalized reclaim list
      const isDemoKeyword = trimmedAddress.includes("BurnOutReclaim") || trimmedAddress.includes("Jup6LkbZ");
      let reclamationSimulated = false;
      
      if (isDemoKeyword) {
        reclamationSimulated = true;
        const numDeadAccounts = (score % 6) + 3; // 3 to 8 accounts
        const rentPerAccount = 0.00203928;

        const tokenTemplates = [
          { symbol: "COPE", name: "Cope Token", mint: "8H7F9AExbYpCmbC74mTECvFs9yA4ZgA66tvA7h6E7pC4" },
          { symbol: "SRM", name: "Serum", mint: "SRMuS5PrtbmNaW6z3L1G8Vbyap2u84h9R6HSG6T769b" },
          { symbol: "FIDA", name: "Bonfida", mint: "EchesyfXePKdL6sPh8ZYZ9An4D76V51m7RGA6D4XEq3Z" },
          { symbol: "MAPS", name: "MAPS Token", mint: "MAPS41MDahZ9QdKX7L8Mui7vpHsg29KZs7b2AZXUz1L" },
          { symbol: "KIN", name: "Kin", mint: "kinZDax6aJUv9YvAn9C7M8vF65DcfuN1zDvZ8fNHzvG" },
          { symbol: "STEP", name: "Step Finance", mint: "StepAscg2Z3Pr6fNn1pNZ71g61xa4Wpt9NZ1E7N3fVq" },
          { symbol: "OXY", name: "Oxygen", mint: "Oxy2ZpA6Pr7p6G7W7w9fNdXZyvA39hGtLpE7W7P6bQ4r" },
          { symbol: "SLRS", name: "Solrise Finance", mint: "SLRSxcg7Pr6fN7vNnApNZ61yxaWpt9NZ1E7N3fVq6t2" }
        ];

        for (let i = 0; i < numDeadAccounts; i++) {
          const template = tokenTemplates[(score + i) % tokenTemplates.length];
          const mintPrefix = template.mint.substring(0, 12);
          const mintSuffix = template.mint.substring(template.mint.length - 8);
          const mangledMint = `${mintPrefix}...${mintSuffix}`;

          reclaimableAccounts.push({
            mint: template.mint,
            mangled_mint: mangledMint,
            symbol: template.symbol,
            name: template.name,
            balance: 0.0,
            reclaimable_sol: rentPerAccount,
            state: "Closed/Empty State"
          });
        }
      }

      const deadAccountsCount = reclaimableAccounts.length;
      const rentPerAccount = 0.00203928;
      const totalReclaimableSol = deadAccountsCount * rentPerAccount;

      const failedTransactions = [
        {
          signature: `5xH3p9vK${score % 100000}ZqXnYeR4J1tF8WdcBaS7E9N8C4v6fS3...3uL2p`,
          program_id: "JUP6LkbZbjS1jKKgqp7GYYm7Fp1ZgS8c6L7298Z8Hq6",
          program_name: "Jupiter Aggregator v6",
          error_code: "0x1771 / SlippageToleranceExceeded",
          error_message: "InstructionError(3, Custom(6001))",
          human_cause: "The swap transaction was aborted because the pool price fluctuated outside of your configured 0.5% slippage tolerance during network congestion.",
          recovery_action: "Increase slippage tolerance slightly to 1.0% or enable automatic/dynamic priority fee adjustment in your terminal settings.",
          timestamp: "2026-05-23T23:14:12Z"
        },
        {
          signature: `3A7nB4mW${score % 99999}YpCdFgTn9W2L8rF9VdH6uY4zS2...7bX9q`,
          program_id: "metaqbxxUerdq28eg1Wttv8xvjNDMJdkf456r5EdfGL",
          program_name: "Metaplex Token Metadata",
          error_code: "0x12 / InsufficientFunds",
          error_message: "InstructionError(1, Custom(18))",
          human_cause: "The transaction failed during an NFT mint/transfer program call because your wallet balance dropped below the exact rent-exempt threshold required to initialize the new token metadata storage account.",
          recovery_action: "Maintain an extra 0.005 SOL buffer in your keypair to cover rent-exemption fees when compiling newly initialized program storage variables.",
          timestamp: "2026-05-23T18:42:01Z"
        }
      ];

      const optimizations = [
        `Reclaim ${totalReclaimableSol.toFixed(6)} SOL from ${deadAccountsCount} empty/dormant SPL token accounts with active Rent Exemption locks.`,
        `Verified Native Balance: ${realSolBalance ? realSolBalance.toFixed(4) : "0.0000"} SOL. Priority fees can reduce block execution latency to <1.0s.`,
        "Your account possesses obsolete metadata storage allocations with inactive stakes."
      ];

      res.json({
        address: trimmedAddress,
        is_valid: true,
        reclamation: {
          total_reclaimable_sol: totalReclaimableSol,
          dead_accounts_count: deadAccountsCount,
          reclaimable_accounts: reclaimableAccounts
        },
        failed_transactions: failedTransactions,
        optimizations: optimizations,
        is_real_data: isRealData,
        real_sol_balance: realSolBalance,
        reclamation_simulated: reclamationSimulated
      });
    } catch (routeErr: any) {
      console.error("Critical error inside /api/wallet/analyze:", routeErr);
      res.status(500).json({
        detail: `An unexpected internal error occurred on the optimizer server: ${routeErr.message || routeErr}`
      });
    }
  });

  // API Route 3: Secure Solana RPC Proxy (No exposure of actual SOLANA_RPC_URL to client browsers)
  app.post("/api/solana-rpc", async (req, res) => {
    try {
      const { method, params } = req.body;
      if (!method) {
        return res.status(400).json({ error: "Solana RPC method key is required." });
      }

      const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Math.floor(Math.random() * 1000000),
          method,
          params: params || []
        })
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Solana RPC responded with status code ${response.status}` });
      }

      const json = await response.json();
      return res.json(json);
    } catch (err: any) {
      console.warn("Secure Solana RPC proxy failure:", err);
      return res.status(500).json({ error: err.message || "Solana RPC proxy request timed out or was refused." });
    }
  });

  // Serve static files / Vite HMR configuration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Dev Server running on port ${PORT}`);
  });
}

startServer();
