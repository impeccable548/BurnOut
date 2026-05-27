import hashlib
import re
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="BurnOut FastAPI Backend",
    description="Premium, minimal Solana wallet optimization and transaction diagnostic utility API.",
    version="1.0.0"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Solana base58 character set validation
BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

class AnalyzeRequest(BaseModel):
    address: str = Field(..., description="Solana Public Key (Base58 address)")

class UnusedAccount(BaseModel):
    mint: str
    symbol: str
    name: str
    balance: float
    reclaimable_sol: float
    state: str

class FailedTransactionDiagnostic(BaseModel):
    signature: str
    program_id: str
    program_name: str
    error_code: str
    error_message: str
    human_cause: str
    recovery_action: str
    timestamp: str

class WalletAnalysisResponse(BaseModel):
    address: str
    is_valid: bool
    reclamation: Dict
    failed_transactions: List[FailedTransactionDiagnostic]
    optimizations: List[str]

# Simple Solana address structure validation
def is_valid_solana_address(address: str) -> bool:
    if not (32 <= len(address) <= 44):
        return False
    # Verify base58 characters
    for char in address:
        if char not in BASE58_ALPHABET:
            return False
    return True

# Helper to generate deterministic simulated numbers based on the input address
def get_deterministic_score(address: str) -> int:
    hash_object = hashlib.sha256(address.encode())
    hex_dig = hash_object.hexdigest()
    return int(hex_dig[:8], 16)

@app.get("/api/network/status")
async def get_network_status() -> Dict:
    """
    Returns current active network metrics, transaction statistics, and recommended priority fees
    """
    return {
        "status": "online",
        "congestion_level": "Medium", # Low, Medium, High
        "current_tps": 2487,
        "average_tps_5m": 2350,
        "ping_time_ms": 18,
        "priority_fees": {
            "low": 0.000005,      # SOL
            "medium": 0.000085,   # SOL
            "high": 0.000550,     # SOL
            "extreme": 0.002500,  # SOL
            "priority_fee_micro_lamports": {
                "low": 1000,
                "medium": 50000,
                "high": 350000,
                "extreme": 1200000
            }
        },
        "block_height": 268453102,
        "active_validators": 1942
    }

@app.post("/api/wallet/analyze", response_model=WalletAnalysisResponse)
async def analyze_wallet(request: AnalyzeRequest):
    """
    Accepts a Solana public key, performs validation, and deterministic analysis for rent reclamation and transaction diagnostics.
    """
    address = request.address.strip()
    
    if not is_valid_solana_address(address):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Malformed Solana address. Must be a valid Base58 encoded string of 32 to 44 characters."
        )
    
    # Generate stable mock analysis data for the portfolio item
    score = get_deterministic_score(address)
    
    # Determine reclaimable accounts
    # Let's derive a realistic count of dead accounts (between 1 and 9)
    num_dead_accounts = (score % 7) + 2
    rent_per_account = 0.00203928 # Sol rent-exempt minimum for standard token account (165 bytes)
    total_reclaimable_sol = num_dead_accounts * rent_per_account
    
    # Let's curate list of dead token accounts based on address
    token_templates = [
        {"symbol": "COPE", "name": "Cope Token", "mint": "8H7F9AExbYpCmbC74mTECvFs9yA4ZgA66tvA7h6E7pC4"},
        {"symbol": "SRM", "name": "Serum", "mint": "SRMuS5PrtbmNaW6z3L1G8Vbyap2u84h9R6HSG6T769b"},
        {"symbol": "FIDA", "name": "Bonfida", "mint": "EchesyfXePKdL6sPh8ZYZ9An4D76V51m7RGA6D4XEq3Z"},
        {"symbol": "MAPS", "name": "MAPS Token", "mint": "MAPS41MDahZ9QdKX7L8Mui7vpHsg29KZs7b2AZXUz1L"},
        {"symbol": "KIN", "name": "Kin", "mint": "kinZDax6aJUv9YvAn9C7M8vF65DcfuN1zDvZ8fNHzvG"},
        {"symbol": "STEP", "name": "Step Finance", "mint": "StepAscg2Z3Pr6fNn1pNZ71g61xa4Wpt9NZ1E7N3fVq"},
        {"symbol": "OXY", "name": "Oxygen", "mint": "Oxy2ZpA6Pr7p6G7W7w9fNdXZyvA39hGtLpE7W7P6bQ4r"},
        {"symbol": "SLRS", "name": "Solrise Finance", "mint": "SLRSxcg7Pr6fN7vNnApNZ61yxaWpt9NZ1E7N3fVq6t2"},
        {"symbol": "LIQ", "name": "Liquidus", "mint": "LiqAsc2Z3Pr6fN7pNZ71g61xa4Wpt9NZ1E7N3fVq7wt"},
        {"symbol": "BOOF", "name": "Boofi", "mint": "Boof6yW73M65dfy9yArGTYzP1008CdaYF21dE994pq"},
    ]
    
    dead_accounts = []
    for i in range(num_dead_accounts):
        template = token_templates[(score + i) % len(token_templates)]
        # Add a unique suffix/prefix or modification to mint address for realism
        mint_prefix = template["mint"][:12]
        mint_suffix = template["mint"][-8:]
        mangled_mint = f"{mint_prefix}...{mint_suffix}"
        
        dead_accounts.append({
            "mint": template["mint"],
            "mangled_mint": mangled_mint,
            "symbol": template["symbol"],
            "name": template["name"],
            "balance": 0.0,
            "reclaimable_sol": rent_per_account,
            "state": "Closed/Empty State"
        })
        
    # Transaction diagnostics
    # Let's generate 2 failed transactions with high educational value
    diagnostics = [
        {
            "signature": f"5xH3p9vK{score % 100000}ZqXnYeR4J1tF8WdcBaS7E9N8C4v6fS3...3uL2p",
            "program_id": "JUP6LkbZbjS1jKKgqp7GYYm7Fp1ZgS8c6L7298Z8Hq6",
            "program_name": "Jupiter Aggregator v6",
            "error_code": "0x1771 / SlippageToleranceExceeded",
            "error_message": "InstructionError(3, Custom(6001))",
            "human_cause": "The swap transaction was aborted because the pool price fluctuated outside of your configured 0.5% slippage tolerance during network congestion.",
            "recovery_action": "Increase slippage tolerance slightly to 1.0% or enable automatic/dynamic priority fee adjustment in your terminal settings.",
            "timestamp": "2026-05-23T23:14:12Z"
        },
        {
            "signature": f"3A7nB4mW{score % 99999}YpCdFgTn9W2L8rF9VdH6uY4zS2...7bX9q",
            "program_id": "metaqbxxUerdq28eg1Wttv8xvjNDMJdkf456r5EdfGL",
            "program_name": "Metaplex Token Metadata",
            "error_code": "0x12 / InsufficientFunds",
            "error_message": "InstructionError(1, Custom(18))",
            "human_cause": "The transaction failed during an NFT mint/transfer program call because your wallet balance dropped below the exact rent-exempt threshold required to initialize the new token metadata storage account.",
            "recovery_action": "Maintain an extra 0.005 SOL buffer in your keypair to cover rent-exemption fees when compiling newly initialized program storage variables.",
            "timestamp": "2026-05-23T18:42:01Z"
        }
    ]
    
    # Wallet recommendations
    optimizations = [
        f"Reclaim {total_reclaimable_sol:.6f} SOL from {num_dead_accounts} empty/dormant SPL token accounts with active Rent Exemption locks.",
        "A swap failed recently due to slippage; activate BurnOut's active priority fee setting to reduce block delay to <1.2s.",
        "Your account possesses 2 obsolete metadata storage allocations with inactive stakes."
    ]
    
    return {
        "address": address,
        "is_valid": True,
        "reclamation": {
            "total_reclaimable_sol": total_reclaimable_sol,
            "dead_accounts_count": num_dead_accounts,
            "reclaimable_accounts": dead_accounts
        },
        "failed_transactions": diagnostics,
        "optimizations": optimizations
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
