import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Coins } from 'lucide-react';

const COIN_OPTIONS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', network: 'Mainnet', iconBg: 'bg-amber-500/10 text-amber-500 border border-amber-500/20' },
  { symbol: 'ETHUSDT', name: 'Ethereum', network: 'ERC-20', iconBg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
  { symbol: 'SOLUSDT', name: 'Solana', network: 'SPL', iconBg: 'bg-purple-500/10 text-purple-400 border border-purple-500/20' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', network: 'BEP-20', iconBg: 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' },
  { symbol: 'XRPUSDT', name: 'Ripple', network: 'RippleNet', iconBg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
  { symbol: 'ADAUSDT', name: 'Cardano', network: 'Shelley', iconBg: 'bg-sky-500/10 text-sky-400 border border-sky-500/20' },
];

export function CoinDropdown({ selectedSymbol, onSymbolChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeCoin = COIN_OPTIONS.find((c) => c.symbol.toUpperCase() === selectedSymbol.toUpperCase()) || COIN_OPTIONS[0];

  return (
    <div className="relative z-40" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-56 px-4.5 py-3 bg-[#0c0c0c] border border-white/10 rounded-xl hover:border-white/20 hover:bg-[#121212] transition-all text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${activeCoin.iconBg}`}>
            {activeCoin.symbol.replace('USDT', '')}
          </div>
          <div>
            <div className="text-white text-xs font-semibold tracking-wide uppercase">
              {activeCoin.symbol.replace('USDT', '')}/USDT
            </div>
            <div className="text-[10px] text-white/30 font-mono tracking-wider">{activeCoin.name}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-[#0c0c0c]/98 border border-white/15 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-md anim-fade-in">
          <div className="py-1 max-h-72 overflow-y-auto">
            {COIN_OPTIONS.map((coin) => {
              const isActive = coin.symbol.toUpperCase() === selectedSymbol.toUpperCase();
              return (
                <button
                  key={coin.symbol}
                  onClick={() => {
                    onSymbolChange(coin.symbol);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-4.5 py-3 text-left hover:bg-white/5 transition-colors ${
                    isActive ? 'bg-[#D4AF37]/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 ${coin.iconBg}`}>
                      {coin.symbol.replace('USDT', '')}
                    </div>
                    <div>
                      <span className={`block text-xs font-semibold tracking-wide uppercase ${isActive ? 'text-[#D4AF37]' : 'text-white'}`}>
                        {coin.symbol.replace('USDT', '')}/USDT
                      </span>
                      <span className="block text-[9px] text-white/30 font-mono tracking-wider">{coin.name}</span>
                    </div>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
