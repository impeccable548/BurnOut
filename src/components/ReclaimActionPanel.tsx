import React, { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Flame, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import { 
  buildCloseAccountTransaction, 
  executeReclamation, 
  pollTransactionConfirmation 
} from "../utils/solanaTransactions";

interface ReclaimActionPanelProps {
  analysisResult: any;
  reclaiming: boolean;
  setReclaiming: (val: boolean) => void;
  reclaimStep: number;
  setReclaimStep: (val: number) => void;
  reclaimSuccess: boolean;
  setReclaimSuccess: (val: boolean) => void;
  reclaimedAmount: number;
  setReclaimedAmount: (val: number) => void;
  closedAccounts: string[];
  setClosedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
  setErrorText: (val: string | null) => void;
  triggerSimulation: () => void;
}

export const ReclaimActionPanel: FC<ReclaimActionPanelProps> = ({
  analysisResult,
  reclaiming,
  setReclaiming,
  reclaimStep,
  setReclaimStep,
  reclaimSuccess,
  setReclaimSuccess,
  reclaimedAmount,
  setReclaimedAmount,
  closedAccounts,
  setClosedAccounts,
  setErrorText,
  triggerSimulation
}) => {
  const { connection } = useConnection();
  const { publicKey, signTransaction, connected } = useWallet();

  const [isExecuting, setIsExecuting] = useState(false);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [txExplorerUrl, setTxExplorerUrl] = useState<string | null>(null);

  const handleReclaimClick = async () => {
    if (!analysisResult) return;

    const isDemoKeyword = analysisResult.address?.includes("BurnOutReclaim") || analysisResult.address?.includes("Jup6LkbZ");

    if (!connected || !publicKey) {
      if (isDemoKeyword) {
        triggerSimulation();
        return;
      } else {
        setErrorText("Connect your wallet first to execute real on-chain reclamation!");
        return;
      }
    }

    setIsExecuting(true);
    setReclaiming(true);
    setReclaimStep(1);
    setErrorText(null);

    try {
      const accountsToClose = analysisResult.reclamation.reclaimable_accounts;
      if (accountsToClose.length === 0) {
        throw new Error("No empty token accounts detected to close.");
      }

      const mintAddresses = accountsToClose.map((a: any) => a.mint);
      setReclaimStep(2);
      const transaction = await buildCloseAccountTransaction(
        publicKey.toString(),
        mintAddresses
      );

      setReclaimStep(3);
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      setReclaimStep(4);
      if (!signTransaction) {
        throw new Error("Your wallet does not support signing transactions.");
      }
      const signedTx = await signTransaction(transaction);

      setReclaimStep(5);
      const signature = await executeReclamation(connection, signedTx, publicKey);
      setTxSignature(signature);
      const explorerUrl = `https://solscan.io/tx/${signature}`;
      setTxExplorerUrl(explorerUrl);

      setReclaimStep(6);
      await pollTransactionConfirmation(connection, signature);

      setClosedAccounts(accountsToClose.map((a: any) => a.mint));
      setReclaimedAmount(analysisResult.reclamation.total_reclaimable_sol);
      setReclaimSuccess(true);
    } catch (err: any) {
      console.error("Real reclamation process failed:", err);
      setErrorText(err.message || "Solana transaction failed to execute. Try again with higher priority fees.");
    } finally {
      setIsExecuting(false);
      setReclaiming(false);
    }
  };

  const isReclaimable = analysisResult && analysisResult.reclamation.total_reclaimable_sol > 0;

  return (
    <div className="bg-zinc-900/40 p-5 rounded border border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4" id="reclaim-panel-card">
      <div>
        <div className="flex items-center space-x-1.5 mb-1">
          <span className="font-mono text-[9px] tracking-wider text-zinc-500 uppercase">
            TRAPPED CAPITAL METRIC
          </span>
          {analysisResult.real_sol_balance !== undefined && (
            <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded">
              Bal: {analysisResult.real_sol_balance.toFixed(4)} SOL
            </span>
          )}
          {connected ? (
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-semibold">
              WALLET MODE
            </span>
          ) : (
            <span className="text-[9px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase font-semibold">
              SIMULATION MODE
            </span>
          )}
        </div>
        <span className="font-mono text-3xl font-bold text-[#FF5722] block">
          {analysisResult.reclamation.total_reclaimable_sol.toFixed(6)}{" "}
          <span className="text-zinc-500 text-lg font-light">SOL</span>
        </span>

        {reclaimSuccess && txSignature && (
          <div className="mt-2 text-xs font-mono text-[#10B981] flex items-center gap-1.5" id="tx-success-msg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Rent reclaimed! View Tx: </span>
            <a 
              href={txExplorerUrl || `https://solscan.io/tx/${txSignature}`} 
              target="_blank" 
              rel="noreferrer" 
              className="underline text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5"
            >
              SolScan <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </div>

      {isReclaimable && (
        <div className="flex flex-col items-end gap-1.5">
          <button
            onClick={handleReclaimClick}
            disabled={reclaiming}
            className="w-full md:w-auto py-2.5 px-5 bg-[#FF5722] hover:bg-[#FF5722]/90 disabled:bg-zinc-900 text-white font-sans text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-2 justify-center"
            id="burn-out-main-action-btn"
          >
            {reclaiming ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>
                  {isExecuting 
                    ? `EXECUTING REAL TX (STEP ${reclaimStep}/6)`
                    : `SWEEPING SIMULATION [${reclaimStep}/${analysisResult.reclamation.dead_accounts_count}]`
                  }
                </span>
              </>
            ) : (
              <>
                <Flame className="w-3.5 h-3.5" />
                <span>
                  {connected ? "BURN OUT RENT (ON-CHAIN)" : "BURN OUT RENT (SIMULATION)"}
                </span>
              </>
            )}
          </button>
          
          {!connected && isReclaimable && (
            <span className="text-[9px] text-zinc-500 font-mono tracking-wide uppercase text-center md:text-right">
              💡 Connect your wallet to sweep live token accounts & reclaim SOL rent!
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReclaimActionPanel;