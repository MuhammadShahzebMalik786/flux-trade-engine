import { useState, useEffect } from 'react';
import { useBinanceMarketData } from '../hooks/useBinanceMarketData';
import { StatCard } from '../components/StatCard';
import { TradingViewChart } from '../components/TradingViewChart';
import { LiveTradesTable } from '../components/LiveTradesTable';
import { OrderBookIndicator } from '../components/OrderBookIndicator';
import { CoinDropdown } from '../components/CoinDropdown';

import {
  TrendingUp,
  TrendingDown,
  Clock,
  Cpu,
  Globe,
  Bell,
  Sliders,
  Wallet,
  Activity,
  Award,
  BookOpen
} from 'lucide-react';

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [selectedInterval, setSelectedInterval] = useState('1m');
  const [selectedChartType, setSelectedChartType] = useState('Candlestick');

  const {
    price,
    prevPrice,
    wsStatus,
    ticker,
    recentTrades,
    candles,
    sentimentRatio,
    orderBook,
    loadMoreHistory,
  } = useBinanceMarketData(selectedSymbol, selectedInterval);

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isUp = price >= prevPrice;
  const priceDirectionIcon = isUp ? (
    <TrendingUp className="w-5 h-5 text-emerald-400 font-bold" />
  ) : (
    <TrendingDown className="w-5 h-5 text-red-400 font-bold" />
  );

  const assetBase = selectedSymbol.replace('USDT', '');

  const formatStatVal = (val) => {
    if (val === 0) return 'Connecting...';
    if (val < 2.0) {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
    } else {
      return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e0e0e0] font-sans antialiased relative flex flex-col md:flex-row pb-12 overflow-x-hidden selection:bg-amber-500/30 selection:text-white">
      <div className="absolute top-[8%] left-[17%] w-[380px] h-[380px] bg-amber-500/4 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[25%] right-[8%] w-[480px] h-[480px] bg-emerald-500/2 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0c0c0c] border-b border-white/10 z-50 flex items-center justify-between px-4">
        <span className="text-lg tracking-[0.2em] font-light text-white" style={{ fontFamily: 'Georgia, serif' }}>
          FLUX<span className="text-[#D4AF37] font-bold">TRADE</span>
        </span>
        <div className="flex items-center gap-1.5 bg-[#121212] px-2.5 py-1 rounded-lg border border-white/10">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.65)] animate-pulse"></span>
           <span className="text-[9px] font-mono text-emerald-400">ACTIVE</span>
        </div>
      </div>

      <aside className="hidden md:flex w-56 bg-[#0c0c0c] border-r border-white/10 flex-col justify-between p-4 z-30 shrink-0">
        <div className="flex flex-col gap-8">
          {/* Platform Branding */}
          <div className="flex flex-col gap-1">
            <span className="text-xl tracking-[0.2em] font-light text-white" style={{ fontFamily: 'Georgia, serif' }}>
              FLUX<span className="text-[#D4AF37] font-bold">TRADE</span>
            </span>
            <div className="text-white/30 text-[9px] font-mono tracking-widest uppercase">QUANT TERMINAL v2.1</div>
          </div>

          <div className="bg-[#121212] rounded-xl border border-white/10 p-4 space-y-3">
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>System Router</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/40">Market Node</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.65)] animate-pulse"></span>
                ACTIVE
              </span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-white/40">Stream Engine</span>
              <span className="text-white flex items-center gap-1.5 font-semibold">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    wsStatus === 'connected'
                      ? 'bg-emerald-500'
                      : wsStatus === 'connecting'
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-red-500'
                  }`}
                ></span>
                <span className="uppercase text-[10px]">{wsStatus}</span>
              </span>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-1.5 px-3">Aggregated Boards</span>
            <a
              href="#trading"
              className="px-3 py-2.5 text-xs font-mono font-semibold rounded-lg text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center gap-3 shadow-inner"
            >
              <Cpu className="w-4 h-4" />
              Live Workspace
            </a>
            <button
              disabled
              className="px-3 py-2.5 text-xs font-mono text-white/20 rounded-lg flex items-center gap-3 opacity-30 text-left cursor-not-allowed"
            >
              <Wallet className="w-4 h-4" />
              Institutional Vaults
            </button>
            <button
              disabled
              className="px-3 py-2.5 text-xs font-mono text-white/20 rounded-lg flex items-center gap-3 opacity-30 text-left cursor-not-allowed"
            >
              <Award className="w-4 h-4" />
              Yield Arbitrage
            </button>
            <button
              disabled
              className="px-3 py-2.5 text-xs font-mono text-white/20 rounded-lg flex items-center gap-3 opacity-30 text-left cursor-not-allowed"
            >
              <BookOpen className="w-4 h-4" />
              Corporate Fund Logs
            </button>
          </nav>
        </div>

        <div className="hidden md:flex flex-col gap-2 mt-8 text-[9px] font-mono text-white/30 border-t border-white/10 pt-4">
          <div className="flex items-center gap-1 text-[#D4AF37]/80">
            <Globe className="w-3 h-3" />
            <span>Binance Websocket Feed</span>
          </div>
          <span>Streaming institutional-grade trading books live over authenticated secure TCP endpoints.</span>
        </div>
      </aside>

      <main className="flex-grow p-1 sm:p-2 lg:p-3 flex flex-col gap-2 sm:gap-3 z-10 max-w-[1600px] mx-auto w-full mt-14 md:mt-0">
        {/* Desktop Detailed Header */}
        <header className="hidden sm:flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-[#0c0c0c] border border-white/10 p-4 rounded-xl relative shadow-md order-1">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-white text-base font-semibold tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse inline-block"></span>
              FLUX <span className="text-[#D4AF37]">TRADE ENGINE</span>
            </h1>
            <p className="text-xs text-white/40 font-mono">
              Global dynamic spot orderbooks and real-time execution pipelines.
            </p>
          </div>

          <div className="flex gap-3 items-center w-full lg:w-auto">
            <CoinDropdown selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />

            <div className="flex items-center gap-2.5 bg-[#121212] px-4 py-3 rounded-xl border border-white/10 font-mono text-xs text-gray-300">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="tracking-wide">{currentTime || 'Syncing...'} UTC</span>
            </div>

            <div className="relative hover:bg-white/5 p-3 rounded-xl border border-white/10 transition-colors text-white/40 hover:text-white cursor-pointer">
              <Bell className="w-4 h-4" />
            </div>
          </div>
        </header>

        {/* Mobile Ultra-Slim Ticker Header */}
        <div className="sm:hidden flex items-center justify-between gap-2 bg-[#0c0c0c] border border-white/10 p-1.5 rounded-lg shadow-md order-1">
          <CoinDropdown selectedSymbol={selectedSymbol} onSymbolChange={setSelectedSymbol} />
          
          <div className="flex items-center gap-2 pr-1">
            <span className={`text-[11px] font-mono font-bold ${price >= prevPrice ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatStatVal(price)}
            </span>
            {ticker.priceChangePercent !== undefined && (
              <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded ${
                ticker.priceChangePercent >= 0
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                  : 'bg-red-500/10 text-red-400 border border-red-500/15'
              }`}>
                {ticker.priceChangePercent >= 0 ? '+' : ''}{ticker.priceChangePercent.toFixed(2)}%
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 order-2 sm:order-3">
          <TradingViewChart
            candles={candles}
            symbol={selectedSymbol}
            chartType={selectedChartType}
            selectedInterval={selectedInterval}
            onChangeChartType={setSelectedChartType}
            onChangeInterval={setSelectedInterval}
            onLoadMore={loadMoreHistory}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2 order-3 sm:order-2">
          <StatCard
            title={`Last rate (${assetBase}/USDT)`}
            value={formatStatVal(price)}
            subValue={recsPastPriceText(price, prevPrice)}
            change={ticker.priceChangePercent}
            icon={priceDirectionIcon}
            loading={price === 0}
          />

          <StatCard
            title="24h Premium Peak"
            value={formatStatVal(ticker.high)}
            subValue="Asset session ceiling"
            icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
            loading={price === 0}
          />

          <StatCard
            title="24h Support Floor"
            value={formatStatVal(ticker.low)}
            subValue="Asset session basement"
            icon={<TrendingDown className="w-4 h-4 text-red-400" />}
            loading={price === 0}
          />

          <StatCard
            title="24h Base Volume"
            value={ticker.volume > 0 ? `${Math.floor(ticker.volume).toLocaleString()} ${assetBase}` : 'Connecting...'}
            subValue={`≈ $${(ticker.quoteVolume / 1000000).toFixed(2)}M Quote Volume`}
            icon={<Sliders className="w-4 h-4 text-[#D4AF37]" />}
            loading={price === 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3 order-4">
          <LiveTradesTable trades={recentTrades} symbol={selectedSymbol} />

          <OrderBookIndicator 
            price={price} 
            sentimentRatio={sentimentRatio} 
            symbol={selectedSymbol} 
            bids={orderBook.bids} 
            asks={orderBook.asks} 
          />
        </div>

      </main>
    </div>
  );
}

function recsPastPriceText(price, lastPrice) {
  if (price === 0 || lastPrice === 0 || price === lastPrice) {
    return 'Stable market matching';
  }
  const diff = price - lastPrice;
  const word = diff > 0 ? 'Surging' : 'Consolidating';
  
  const formattedDiff = Math.abs(diff) < 0.01 
    ? Math.abs(diff).toFixed(4) 
    : Math.abs(diff).toFixed(2);
    
  return `${word} (${diff > 0 ? '+' : '-'}$${formattedDiff})`;
}
