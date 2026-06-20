import { useState, useEffect, useRef, useCallback } from 'react';

const BINANCE_REST_URL = import.meta.env.VITE_BINANCE_REST_URL;
const BINANCE_WS_URL = import.meta.env.VITE_BINANCE_WS_URL;

export function useBinanceMarketData(symbol, interval) {
  const [price, setPrice] = useState(0);
  const [prevPrice, setPrevPrice] = useState(0);
  const [wsStatus, setWsStatus] = useState('connecting');
  const [ticker, setTicker] = useState({
    priceChange: 0,
    priceChangePercent: 0,
    high: 0,
    low: 0,
    volume: 0,
    quoteVolume: 0,
    lastPrice: 0,
    openPrice: 0,
  });

  const [recentTrades, setRecentTrades] = useState([]);
  const [candles, setCandles] = useState([]);
  const [sentimentRatio, setSentimentRatio] = useState(50);
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });

  const tradesQueueRef = useRef([]);
  const candlesRef = useRef([]);
  const currentPriceRef = useRef(0);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const batchIntervalRef = useRef(null);
  const isFetchingHistoryRef = useRef(false);

  useEffect(() => {
    setPrice(0);
    setPrevPrice(0);
    setRecentTrades([]);
    setCandles([]);
    setSentimentRatio(50);
    setOrderBook({ bids: [], asks: [] });
    setTicker({
      priceChange: 0,
      priceChangePercent: 0,
      high: 0,
      low: 0,
      volume: 0,
      quoteVolume: 0,
      lastPrice: 0,
      openPrice: 0,
    });

    tradesQueueRef.current = [];
    candlesRef.current = [];
    currentPriceRef.current = 0;
  }, [symbol, interval]);

  const fetchHistory = useCallback(async (activeSymbol, activeInterval) => {
    try {
      const endpointSymbol = activeSymbol.toUpperCase();
      const response = await fetch(
        `${BINANCE_REST_URL}/api/v3/klines?symbol=${endpointSymbol}&interval=${activeInterval}&limit=150`
      );
      if (!response.ok) throw new Error('Failed to retrieve historical data');
      const data = await response.json();

      const parsedCandles = data.map((d) => ({
        time: Math.floor(Number(d[0]) / 1000),
        open: Number(d[1]),
        high: Number(d[2]),
        low: Number(d[3]),
        close: Number(d[4]),
        volume: Number(d[5]),
      }));

      candlesRef.current = parsedCandles;
      setCandles(parsedCandles);

      if (parsedCandles.length > 0) {
        const lastCandleClose = parsedCandles[parsedCandles.length - 1].close;
        currentPriceRef.current = lastCandleClose;
        setPrice(lastCandleClose);
        setPrevPrice(lastCandleClose);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadMoreHistory = useCallback(async () => {
    if (isFetchingHistoryRef.current || candlesRef.current.length === 0) return;
    
    isFetchingHistoryRef.current = true;
    try {
      const oldestCandle = candlesRef.current[0];
      const endTime = oldestCandle.time * 1000 - 1;
      
      const endpointSymbol = symbol.toUpperCase();
      const response = await fetch(
        `${BINANCE_REST_URL}/api/v3/klines?symbol=${endpointSymbol}&interval=${interval}&limit=500&endTime=${endTime}`
      );
      if (!response.ok) throw new Error('Failed to retrieve older historical data');
      const data = await response.json();

      const newOldCandles = data.map((d) => ({
        time: Math.floor(Number(d[0]) / 1000),
        open: Number(d[1]),
        high: Number(d[2]),
        low: Number(d[3]),
        close: Number(d[4]),
        volume: Number(d[5]),
      }));

      // Prevent duplicate fetching if the last batch returned empty
      if (newOldCandles.length > 0) {
        candlesRef.current = [...newOldCandles, ...candlesRef.current];
        setCandles([...candlesRef.current]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isFetchingHistoryRef.current = false;
    }
  }, [symbol, interval]);

  useEffect(() => {
    batchIntervalRef.current = setInterval(() => {
      if (tradesQueueRef.current.length > 0) {
        setRecentTrades((prev) => {
          const combined = [...tradesQueueRef.current, ...prev];
          const trimmed = combined.slice(0, 40);

          let buyVolume = 0;
          let sellVolume = 0;
          trimmed.forEach((t) => {
            const vol = t.price * t.quantity;
            if (!t.isBuyerMaker) {
              buyVolume += vol;
            } else {
              sellVolume += vol;
            }
          });
          const total = buyVolume + sellVolume;
          if (total > 0) {
            setSentimentRatio((buyVolume / total) * 100);
          }

          return trimmed;
        });
        tradesQueueRef.current = [];
      }
    }, 180);

    return () => {
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchHistory(symbol, interval);
  }, [symbol, interval, fetchHistory]);

  useEffect(() => {
    const connectWS = () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close();
      }

      setWsStatus('connecting');

      const symbolLower = symbol.toLowerCase();
      const wsUrl = `${BINANCE_WS_URL}/stream?streams=${symbolLower}@trade/${symbolLower}@ticker/${symbolLower}@kline_${interval}/${symbolLower}@depth20@100ms`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setWsStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { stream, data } = payload;
          if (!data) return;

          if (stream.endsWith('@trade')) {
            const tradePrice = Number(data.p);
            const qty = Number(data.q);
            const isBuyerMaker = data.m;
            const tradeTime = data.T;

            setPrice((prev) => {
              if (prev !== tradePrice) {
                setPrevPrice(prev);
              }
              return tradePrice;
            });
            currentPriceRef.current = tradePrice;

            const isWhale = qty >= (symbol.toUpperCase().startsWith('BTC') ? 0.5 : symbol.toUpperCase().startsWith('ETH') ? 5 : 20);
            const newTrade = {
              id: String(data.t),
              price: tradePrice,
              quantity: qty,
              time: tradeTime,
              isBuyerMaker,
              isWhale,
            };

            tradesQueueRef.current.unshift(newTrade);
          } else if (stream.endsWith('@ticker')) {
            setTicker({
              priceChange: Number(data.p),
              priceChangePercent: Number(data.P),
              high: Number(data.h),
              low: Number(data.l),
              volume: Number(data.v),
              quoteVolume: Number(data.q),
              lastPrice: Number(data.c),
              openPrice: Number(data.o),
            });
          } else if (stream.includes('@kline_')) {
            const k = data.k;
            const cTime = Math.floor(Number(k.t) / 1000);
            const open = Number(k.o);
            const high = Number(k.h);
            const low = Number(k.l);
            const close = Number(k.c);
            const volume = Number(k.v);

            const updatedCandles = [...candlesRef.current];
            const lastIdx = updatedCandles.length - 1;

            if (lastIdx >= 0 && updatedCandles[lastIdx].time === cTime) {
              updatedCandles[lastIdx] = { time: cTime, open, high, low, close, volume };
            } else if (lastIdx >= 0 && cTime > updatedCandles[lastIdx].time) {
              updatedCandles.push({ time: cTime, open, high, low, close, volume });
              if (updatedCandles.length > 200) {
                updatedCandles.shift();
              }
            }

            candlesRef.current = updatedCandles;
            setCandles(updatedCandles);
          } else if (stream.includes('@depth')) {
            const bids = data.bids.slice(0, 6).map((b) => ({
              price: Number(b[0]),
              quantity: Number(b[1])
            }));
            const asks = data.asks.slice(0, 6).map((a) => ({
              price: Number(a[0]),
              quantity: Number(a[1])
            }));
            setOrderBook({ bids, asks });
          }
        } catch (e) {
          console.error('Failed to parse stream data:', e);
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWS();
        }, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [symbol, interval]);

  return {
    price,
    prevPrice,
    wsStatus,
    ticker,
    recentTrades,
    candles,
    sentimentRatio,
    orderBook,
    loadMoreHistory,
  };
}
