import { Zap } from 'lucide-react';
export function LiveTradesTable({ trades, symbol }) {
  const baseAsset = symbol ? symbol.toUpperCase().replace('USDT', '') : 'BTC';

  const formatQty = (q) => {
    if (q >= 100) {
      return q.toFixed(1);
    } else if (q >= 1) {
      return q.toFixed(3);
    } else {
      return q.toFixed(5);
    }
  };

  const formatPrice = (p) => {
    if (p < 2.0) {
      return p.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    } else if (p < 1000) {
      return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return p.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
  };

  return (
    <div className="bg-[#0c0c0c] border border-white/10 rounded-lg sm:rounded-xl p-1.5 sm:p-5 shadow-lg flex flex-col h-[340px] sm:h-[480px] overflow-hidden">
      <div className="flex justify-between items-center mb-2 sm:mb-4 pb-1.5 sm:pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-white text-xs uppercase tracking-wider font-semibold">Live Trades Feed</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#141414] px-2.5 py-1 rounded border border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[9px] font-mono text-white/50 tracking-wider">LIVE FEED</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 shadow-sm pb-1 sm:pb-2 text-[9px] sm:text-[10px] uppercase tracking-wider font-mono text-white/40 font-semibold px-1 sm:px-2">
        <span className="text-left truncate">Price (USDT)</span>
        <span className="text-right truncate">Size ({baseAsset})</span>
        <span className="text-right hidden sm:block truncate">Total (USDT)</span>
        <span className="text-right truncate">Time</span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 mt-2 scrollbar-thin scrollbar-thumb-white/10">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/20 text-xs font-mono">
            Awaiting Stream Packet...
          </div>
        ) : (
          trades.map((trade) => {
            const isBuy = !trade.isBuyerMaker;
            const totalVal = trade.price * trade.quantity;

            return (
              <div
                key={trade.id}
                className="grid grid-cols-3 sm:grid-cols-4 gap-1 sm:gap-2 items-center text-[10px] sm:text-xs font-mono py-0.5 sm:py-1.5 px-1 sm:px-2 rounded hover:bg-white/5 transition-colors"
              >
                <span
                  className={`text-left font-medium truncate ${
                    isBuy ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {formatPrice(trade.price)}
                </span>

                <span
                  className={`text-right truncate font-medium ${
                    trade.isWhale ? 'text-amber-300 font-semibold' : 'text-white/80'
                  }`}
                >
                  {formatQty(trade.quantity)}
                </span>

                <span className="text-right text-white/50 truncate hidden sm:block">
                  {totalVal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>

                <span className="text-right text-white/35 text-[9px] sm:text-[11px] truncate">
                  {new Date(trade.time).toLocaleTimeString(undefined, {
                    hour12: false,
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
