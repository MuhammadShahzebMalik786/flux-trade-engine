import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  BarSeries,
} from 'lightweight-charts';
import {
  BarChart2,
  AreaChart as AreaIcon,
  Activity,
  GitCommit,
  Maximize2,
  RefreshCw,
  Cpu,
  Clock,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const CHART_TYPES = [
  { id: 'Candlestick', label: 'Candles', icon: BarChart2 },
  { id: 'Area', label: 'Area', icon: AreaIcon },
  { id: 'Line', label: 'Line', icon: Activity },
  { id: 'Bar', label: 'Heikin-Bar', icon: GitCommit },
];

const INTERVALS = [
  { id: '1m', label: '1m' },
  { id: '5m', label: '5m' },
  { id: '15m', label: '15m' },
  { id: '1h', label: '1h' },
  { id: '4h', label: '4h' },
  { id: '1d', label: '1d' },
];

export function TradingViewChart({
  candles,
  symbol,
  chartType,
  selectedInterval,
  onChangeChartType,
  onChangeInterval,
  onLoadMore,
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  const [hoveredCandle, setHoveredCandle] = useState(null);

  const formatTime = (timeSeconds) => {
    const d = new Date(timeSeconds * 1000);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }) + ' ' + d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090909' },
        textColor: '#a3a3a3',
        fontSize: 11,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.02)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.02)' },
      },
      crosshair: {
        mode: 1, // Magnet crosshair
        vertLine: {
          color: 'rgba(212, 175, 55, 0.35)',
          width: 1,
          style: 3, // dashed
        },
        horzLine: {
          color: 'rgba(212, 175, 55, 0.35)',
          width: 1,
          style: 3, // dashed
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        textColor: '#8e8e8e',
        scaleMargins: {
          top: 0.12,
          bottom: 0.12,
        },
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
    });

    chartRef.current = chart;

    let series;

    if (chartType === 'Candlestick') {
      series = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
    } else if (chartType === 'Line') {
      series = chart.addSeries(LineSeries, {
        color: '#D4AF37',
        lineWidth: 2,
        priceLineVisible: true,
      });
    } else if (chartType === 'Bar') {
      series = chart.addSeries(BarSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
      });
    } else {
      series = chart.addSeries(AreaSeries, {
        topColor: 'rgba(212, 175, 55, 0.18)',
        bottomColor: 'rgba(212, 175, 55, 0.001)',
        lineColor: '#D4AF37',
        lineWidth: 2,
        priceLineVisible: true,
      });
    }

    seriesRef.current = series;

    chart.subscribeCrosshairMove((param) => {
      if (
        param.time &&
        param.seriesData &&
        param.seriesData.has(series)
      ) {
        const data = param.seriesData.get(series);
        if (data) {
          setHoveredCandle({
            time: Number(param.time),
            open: data.open ?? data.value ?? 0,
            high: data.high ?? data.value ?? 0,
            low: data.low ?? data.value ?? 0,
            close: data.close ?? data.value ?? 0,
            volume: data.volume ?? 0,
          });
        }
      } else {
        setHoveredCandle(null);
      }
    });

    chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
      if (logicalRange !== null && logicalRange.from < 15) {
        if (onLoadMoreRef.current) {
          onLoadMoreRef.current();
        }
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0 || !chart) return;
      const { width, height } = entries[0].contentRect;
      chart.applyOptions({ width, height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [chartType, symbol]);

  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const uniqueMap = new Map();
    candles.forEach((c) => {
      uniqueMap.set(c.time, c);
    });

    const sortedData = Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time);

    if (chartType === 'Line' || chartType === 'Area') {
      const lineData = sortedData.map((c) => ({
        time: c.time,
        value: c.close,
      }));
      seriesRef.current.setData(lineData);
    } else {
      const ohlcData = sortedData.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      seriesRef.current.setData(ohlcData);
    }
  }, [candles, chartType]);

  const latestCandle = candles[candles.length - 1];
  const activeCandle = hoveredCandle || latestCandle;

  return (
    <div className="bg-[#0c0c0c] border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col w-full relative">
      <div className="flex flex-col border-b border-white/5 bg-[#090909]">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-white text-xs font-mono font-bold tracking-wider bg-[#141414] px-2.5 py-1 rounded border border-white/10">
              {symbol.toUpperCase()}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-zoom shadow-[0_0_8px_#10b981]"></span>
              Streaming
            </span>
            <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-white/30 font-mono">
              <ChevronRight className="w-3.5 h-3.5 text-white/20" />
              <span>RESOLUTION GATEWAY</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded-lg border border-white/10">
            {INTERVALS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => onChangeInterval(opt.id)}
                className={`px-3 py-1 text-[11px] font-mono font-bold rounded transition-all ${
                  selectedInterval === opt.id
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 shadow-inner'
                    : 'text-white/40 hover:text-white border border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-[#121212] p-0.5 rounded-lg border border-white/10">
            {CHART_TYPES.map((opt) => {
              const IconComponent = opt.icon;
              const isActive = chartType === opt.id;

              return (
                <button
                  key={opt.id}
                  onClick={() => onChangeChartType(opt.id)}
                  title={`Switch to ${opt.label}`}
                  className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono font-bold rounded transition-all ${
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20 shadow-inner'
                      : 'text-white/40 hover:text-white border border-transparent'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#0b0b0b]/80 min-h-[40px]">
          {activeCandle ? (
            <div className="flex flex-wrap gap-x-3 sm:gap-x-5 gap-y-1 sm:gap-y-1.5 text-[10px] sm:text-xs font-mono text-white/50 w-full justify-between items-center">
              <div className="flex flex-wrap gap-x-2 sm:gap-x-4">
                <div className="flex items-center gap-1">
                  <span className="text-white/30 text-[10px] uppercase font-bold">Open:</span>
                  <span className="text-white font-medium">
                    {activeCandle.open.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/30 text-[10px] uppercase font-bold">High:</span>
                  <span className="text-emerald-400 font-medium">
                    {activeCandle.high.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/30 text-[10px] uppercase font-bold">Low:</span>
                  <span className="text-red-400 font-medium">
                    {activeCandle.low.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-white/30 text-[10px] uppercase font-bold">Close:</span>
                  <span
                    className={
                      activeCandle.close >= activeCandle.open
                        ? 'text-emerald-400 font-bold'
                        : 'text-red-400 font-bold'
                    }
                  >
                    {activeCandle.close.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {activeCandle.volume > 0 && (
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-white/30 text-[10px] uppercase font-bold">Vol:</span>
                    <span className="text-[#D4AF37] font-semibold">
                      {activeCandle.volume.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#D4AF37] font-medium ml-auto font-mono bg-[#D4AF37]/5 px-2.5 py-1 rounded border border-[#D4AF37]/15">
                {hoveredCandle ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-pulse" />
                    <span>HISTORICAL: {formatTime(activeCandle.time)}</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                    <span>LATEST REALTIME DATA POINT</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-white/20 text-xs font-mono">
              Waiting for network candles to sync ...
            </div>
          )}
        </div>
      </div>

      <div className="w-full relative h-[280px] sm:h-[320px] p-1" ref={chartContainerRef} id="tv_chart_container" />
    </div>
  );
}
