import { FC, useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";
import { 
  Wallet, 
  ChevronDown, 
  LogOut, 
  Check, 
  Sparkles, 
  Flame, 
  Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const WalletConnectButton: FC = () => {
  const { 
    wallets, 
    select, 
    connect,
    publicKey, 
    connected, 
    disconnect, 
    connecting,
    wallet: selectedWallet 
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format public key helper
  const truncateAddress = (pubkey: string) => {
    return `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
  };

  const handleSelectWallet = async (walletName: WalletName) => {
    try {
      select(walletName);
      setIsOpen(false);
      
      // Explicitly call connect with a small delay to allow the state to update
      setTimeout(async () => {
        try {
          await connect();
        } catch (e) {
          console.warn("Explicit connection triggered or cancelled:", e);
        }
      }, 150);
    } catch (err) {
      console.warn("Wallet selection error:", err);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id="wallet-connect-wrapper">
      {/* Connected State Button */}
      {connected && publicKey ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded hover:bg-emerald-500/15 hover:border-emerald-500/50 transition-all cursor-pointer uppercase shadow-sm shadow-emerald-500/5"
          id="wallet-connect-active-btn"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{truncateAddress(publicKey.toString())}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-emerald-500/80 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      ) : (
        /* Disconnected or Connecting State Button */
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={connecting}
          className="flex items-center space-x-2 px-4 py-1.5 bg-[#FF5722]/10 border border-[#FF5722]/30 text-[#FF5722] font-sans font-semibold text-xs tracking-wider rounded hover:bg-[#FF5722]/15 hover:border-[#FF5722]/50 disabled:opacity-50 transition-all cursor-pointer uppercase shadow-sm shadow-[#FF5722]/5"
          id="wallet-connect-btn"
        >
          {connecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>CONNECTING...</span>
            </>
          ) : (
            <>
              <Wallet className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>CONNECT WALLET</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#FF5722]/70 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </>
          )}
        </button>
      )}

      {/* Modern, Animated Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-56 rounded border border-zinc-900 bg-zinc-950 p-1.5 shadow-xl shadow-black/80 z-50 origin-top-right"
            id="wallet-dropdown-menu"
          >
            {connected && publicKey ? (
              // Connected Options
              <div className="space-y-1">
                <div className="px-2.5 py-2 border-b border-zinc-900 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-zinc-500 tracking-wider">WALLET NETWORK</span>
                    <span className="text-[11px] font-sans font-medium text-zinc-300 flex items-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> Solana Mainnet
                    </span>
                  </div>
                  {selectedWallet?.adapter.icon && (
                    <img 
                      src={selectedWallet.adapter.icon} 
                      alt={selectedWallet.adapter.name} 
                      className="w-5 h-5 rounded-full" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <button
                  onClick={() => {
                    disconnect();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 font-sans text-xs text-rose-400 rounded hover:bg-rose-500/5 transition-all text-left cursor-pointer"
                >
                  <span className="font-semibold uppercase tracking-wider">Disconnect Wallet</span>
                  <LogOut className="w-4 h-4 text-rose-400/80" />
                </button>
              </div>
            ) : (
              // Selecting Wallet Options
              <div className="space-y-1">
                <div className="px-2.5 py-1.5 border-b border-zinc-900">
                  <span className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase block">Select Wallet</span>
                </div>
                
                {wallets.length === 0 ? (
                  <div className="px-2.5 py-3 text-center text-xs text-zinc-500 font-sans">
                    No Solana adapters detected. Please install Phantom or Solflare.
                  </div>
                ) : (
                  <>
                    {wallets.map((wallet) => (
                      <button
                        key={wallet.adapter.name}
                        onClick={() => handleSelectWallet(wallet.adapter.name)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded font-sans text-xs text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5">
                          {wallet.adapter.icon ? (
                            <img 
                              src={wallet.adapter.icon} 
                              alt={wallet.adapter.name} 
                              className="w-4.5 h-4.5 rounded" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <Flame className="w-4.5 h-4.5 text-zinc-400" />
                          )}
                          <span className="font-medium">{wallet.adapter.name}</span>
                        </div>
                        
                        {selectedWallet?.adapter.name === wallet.adapter.name && (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </button>
                    ))}
                    <div className="pt-2 mt-1.5 border-t border-zinc-900 px-2 pb-1 font-mono text-[8.5px] text-amber-500/80 leading-normal uppercase">
                      ⚠️ If your wallet doesn't respond, open this app in a New Tab to bypass iframe restrictions.
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletConnectButton;
