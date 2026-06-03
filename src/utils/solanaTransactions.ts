import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction
} from '@solana/web3.js';
import { 
  createCloseAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID
} from '@solana/spl-token';

interface TokenAccountInfo {
  pubkey?: string;
  mint: string;
  programId?: string;
}

/**
 * Builds a transaction that closes empty token accounts and reclaims the SOL rent to the wallet.
 */
export async function buildCloseAccountTransaction(
  walletAddress: string,
  emptyTokenAccounts: string[] | TokenAccountInfo[]
): Promise<Transaction> {
  if (!walletAddress) {
    throw new Error("Wallet address is required to build closure transaction.");
  }
  if (!emptyTokenAccounts || emptyTokenAccounts.length === 0) {
    throw new Error("No empty accounts selected for reclamation.");
  }

  const walletPublicKey = new PublicKey(walletAddress);
  const transaction = new Transaction();

  for (const item of emptyTokenAccounts) {
    let mintStr = typeof item === 'string' ? item : item.mint;
    let pubkeyStr = typeof item === 'string' ? undefined : item.pubkey;
    let programStr = typeof item === 'string' ? undefined : item.programId;

    const mintPublicKey = new PublicKey(mintStr);
    const programId = programStr === 'TokenzQdQEZv4QK9vt7DKvct2N7Wvms8CcFBXgM4AH' 
      ? TOKEN_2022_PROGRAM_ID 
      : TOKEN_PROGRAM_ID;

    let tokenAccountPublicKey: PublicKey;

    if (pubkeyStr) {
      tokenAccountPublicKey = new PublicKey(pubkeyStr);
    } else {
      // Derive the Associated Token Account (ATA) as fallback
      tokenAccountPublicKey = getAssociatedTokenAddressSync(
        mintPublicKey,
        walletPublicKey,
        true, // allowOwnerOffCurve
        programId
      );
    }

    const closeInstruction = createCloseAccountInstruction(
      tokenAccountPublicKey, // account to close
      walletPublicKey, // destination of reclaimed SOL
      walletPublicKey, // owner of the account
      [], // multi-signatures
      programId
    );

    transaction.add(closeInstruction);
  }

  return transaction;
}

/**
 * Executes reclamation by sending a pre-signed transaction to the RPC.
 */
export async function executeReclamation(
  connection: Connection,
  signedTransaction: Transaction,
  _signer: PublicKey // reserved/compatible with prompt parameter
): Promise<string> {
  try {
    const rawTx = signedTransaction.serialize();
    const signature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    return signature;
  } catch (err: any) {
    console.error("sendRawTransaction error Details:", err);
    throw new Error(err.message || "Failed to submit signed transaction to Solana RPC.");
  }
}

// In case user spelled it executeReclaimation
export const executeReclaimation = executeReclamation;

/**
 * Polls for the confirmation signature of a transaction.
 */
export async function pollTransactionConfirmation(
  connection: Connection,
  signature: string,
  maxRetries: number = 30
): Promise<boolean> {
  let retries = 0;
  while (retries < maxRetries) {
    const status = await connection.getSignatureStatus(signature, {
      searchTransactionHistory: true,
    });
    
    const value = status?.value;
    if (value) {
      if (value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(value.err)}`);
      }
      if (value.confirmationStatus === 'confirmed' || value.confirmationStatus === 'finalized') {
        return true;
      }
    }
    
    // Wait 1.5 seconds between polling attempts
    await new Promise((resolve) => setTimeout(resolve, 1500));
    retries++;
  }
  throw new Error("Transaction confirmation check timed out after polling. Check explorer for index status.");
}
