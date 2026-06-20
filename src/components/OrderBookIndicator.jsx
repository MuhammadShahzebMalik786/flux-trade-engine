import { Flame } from 'lucide-react';

export function OrderBookIndicator({ price, sentimentRatio, symbol, bids, asks }) {
  const baseAsset = symbol ? symbol.toUpperCase().replace('USDT', '') : 'BTC';

  const processedBids = bids.map((b) => ({ ...b, percentage: 0 }));
  const processedAsks = asks.map((a) => ({ ...a, percentage: 0 }));

  if (processedBids.length > 0) {
    const totalBidsQty = processedBids.reduce((acc, curr) => acc + curr.quantity, 0);
    processedBids.forEach(b => b.percentage = (b.quantity / totalBidsQty) * 100);
  }

  if (processedAsks.length > 0) {
    const totalAsksQty = processedAsks.reduce((acc, curr) => acc + curr.quantity, 0);
    processedAsks.forEach(a => a.percentage = (a.quantity / totalAsksQty) * 100);
  }

  const spread = processedAsks.length > 0 && processedBids.length > 0 ? processedAsks[0].price - processedBids[0].price : price * 0.0003;
  const spreadPercent = price > 0 ? (spread / price) * 100 : 0.015;

  const formatPrice = (p) => {
    if (p === 0) return '0.00';
    if (p < 2.0) {
      return p.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    } else if (p < 1000) {
      return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return p.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
  };

  const formatQty = (q) => {
    if (q >= 100) {
      return q.toFixed(1);
    } else if (q >= 1) {
      return q.toFixed(3);
    } else {
      return q.toFixed(5);
    }
  };

  return (
    <div className="bg-[#0c0c0c] rounded-lg sm:rounded-xl border border-white/10 p-1.5 sm:p-5 shadow-lg flex flex-col h-[340px] sm:h-[480px] overflow-hidden">
      <div className="flex justify-between items-center mb-2 sm:mb-4 pb-1.5 sm:pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-white text-xs uppercase tracking-wider font-semibold">Orderbook Depth</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#141414] px-2.5 py-1 rounded border border-white/10">
          <span className="text-[9px] font-mono text-white/50 tracking-wider">DEPTH {baseAsset}/USDT</span>
        </div>
      </div>

      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-emerald-400 font-medium truncate">
            BUY DEPTH: {sentimentRatio.toFixed(1)}%
          </span>
          <span className="text-red-400 font-medium truncate">
            {(100 - sentimentRatio).toFixed(1)}% SELL DEPTH
          </span>
        </div>
        
        <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-white/5">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${sentimentRatio}%` }}
          />
          <div
            className="h-full bg-red-500 transition-all duration-500"
            style={{ width: `${100 - sentimentRatio}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end min-h-0">
        <div className="grid grid-cols-[1.2fr_1fr_1fr] sm:grid-cols-3 gap-1 sm:gap-2 text-[9px] sm:text-[10px] uppercase font-mono text-white/40 font-semibold mb-1.5 px-1 sm:px-2">
          <span className="text-left font-semibold truncate">Price (USDT)</span>
          <span className="text-right font-semibold truncate">Size ({baseAsset})</span>
          <span className="text-right font-semibold truncate">Total ({baseAsset})</span>
        </div>

        <div className="space-y-1 mt-1 flex flex-col justify-end overflow-hidden">
          {[...processedAsks].reverse().map((ask, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1.2fr_1fr_1fr] sm:grid-cols-3 gap-1 sm:gap-2 relative items-center text-[10px] sm:text-xs font-mono py-0.5 sm:py-1 px-1 sm:px-2 rounded hover:bg-white/5 transition-colors"
            >
              <div
                className="absolute inset-y-0.5 right-0 bg-red-500/10 rounded"
                style={{ width: `${ask.percentage}%` }}
              />
              <span className="text-red-400 font-medium relative z-10 truncate text-left">
                {formatPrice(ask.price)}
              </span>
              <span className="text-right text-white/80 relative z-10 truncate">{formatQty(ask.quantity)}</span>
              <span className="text-right text-white/40 relative z-10 truncate">
                {formatQty(processedAsks.slice(idx).reduce((sum, current) => sum + current.quantity, 0))}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="my-1 sm:my-3 py-1 sm:py-2 bg-[#141414] rounded-lg border border-white/10 px-2 sm:px-4 flex justify-between items-center text-[10px] sm:text-xs font-mono">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-white/30 text-[9px] uppercase tracking-wider font-semibold">Mid Price</span>
          <span className="text-white font-medium truncate">
            {formatPrice(price)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5 min-w-0">
          <span className="text-white/30 text-[9px] uppercase tracking-wider font-semibold">Spread</span>
          <span className="text-[#D4AF37] font-semibold truncate">
            {spread.toLocaleString(undefined, { minimumFractionDigits: pDigits(price), maximumFractionDigits: pDigits(price) })} ({spreadPercent.toFixed(3)}%)
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-start min-h-0">
        <div className="space-y-1 flex flex-col overflow-hidden">
          {processedBids.map((bid, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1.2fr_1fr_1fr] sm:grid-cols-3 gap-1 sm:gap-2 relative items-center text-[10px] sm:text-xs font-mono py-0.5 sm:py-1 px-1 sm:px-2 rounded hover:bg-white/5 transition-colors"
            >
              <div
                className="absolute inset-y-0.5 right-0 bg-emerald-500/10 rounded"
                style={{ width: `${bid.percentage}%` }}
              />
              <span className="text-emerald-400 font-medium relative z-10 truncate text-left">
                {formatPrice(bid.price)}
              </span>
              <span className="text-right text-white/80 relative z-10 truncate">{formatQty(bid.quantity)}</span>
              <span className="text-right text-white/40 relative z-10 truncate">
                {formatQty(processedBids.slice(0, idx + 1).reduce((sum, current) => sum + current.quantity, 0))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function pDigits(price) {
  if (price < 2.0) return 4;
  if (price < 1000) return 2;
  return 1;
}
