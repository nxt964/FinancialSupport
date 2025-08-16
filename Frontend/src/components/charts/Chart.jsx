import React, { memo, useEffect, useRef, useState } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';
import { useSignalR } from '../../contexts/SignalRContext';
import { httpClient } from '../../utils/httpClient';

const Chart = ({ symbol, interval }) => {
  // From SignalRContext: use 1 connection for the whole website
  const { connection, isConnected } = useSignalR();

  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);

  const [priceFormat, setPriceFormat] = useState({ precision: 3, minMove: 0.001 });

  // Gọi API lấy precision và tick size khi symbol thay đổi
  useEffect(() => {
    const fetchPriceFormat = async () => {
      try {
        const res = await httpClient.get(`${import.meta.env.VITE_API_BINANCE_TICKET_SIZE}?symbol=${symbol}`)
        const { precision, ticketSize } = await res.json();
        setPriceFormat({ precision, minMove: ticketSize });
      } catch (err) {
        console.error('[Chart] Failed to fetch tick size:', err);
        setPriceFormat({ precision: 3, minMove: 0.001 }); // fallback
      }
    };

    if (symbol) fetchPriceFormat();
  }, [symbol]);

  // Khởi tạo và quản lý biểu đồ
  useEffect(() => {
    if (!chartContainerRef.current) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: '#1a202c' },
        textColor: '#cbd5e0',
      },
      grid: {
        vertLines: { color: '#2d3748' },
        horzLines: { color: '#2d3748' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: interval === '1m',
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',

      priceFormat: {
        type: 'price',
        precision: priceFormat.precision,
        minMove: priceFormat.minMove,
      },
    });

    chartInstanceRef.current = chart;
    seriesRef.current = candleSeries;

    const handleResize = () => {
      if (chartInstanceRef.current && chartContainerRef.current) {
        chartInstanceRef.current.resize(chartContainerRef.current.clientWidth, 400);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        seriesRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [interval, priceFormat]);

  // SignalR subscribe và xử lý dữ liệu
  useEffect(() => {
    if (!connection || !isConnected) return;

    const handleHistoryCandlesData = ({ symbolCheck, intervalCheck, historyCandles }) => {
      if (symbolCheck !== symbol || intervalCheck !== interval) return;
      if (!seriesRef.current) return;
      if (!historyCandles || !Array.isArray(historyCandles)) {
        console.error('[Chart] Invalid data or series disposed:', historyCandles);
        return;
      }

      const formatted = historyCandles.map(c => ({
        time: Math.floor(new Date(c.openTime).getTime() / 1000) + 7 * 3600,
        open: parseFloat(c.open),
        high: parseFloat(c.high),
        low: parseFloat(c.low),
        close: parseFloat(c.close),
      }));
      seriesRef.current.setData(formatted);
    }; 

    const handleRealtimeCandleData = ({ symbolCheck, intervalCheck, newCandle }) => {
      if (symbolCheck !== symbol || intervalCheck !== interval) return;
      if (!seriesRef.current) {
        console.error('[Chart] Series disposed, skipping update');
        return;
      }
      const formatted = {
        time: Math.floor(new Date(newCandle.openTime).getTime() / 1000) + 7 * 3600,
        open: parseFloat(newCandle.open),
        high: parseFloat(newCandle.high),
        low: parseFloat(newCandle.low),
        close: parseFloat(newCandle.close),
      };
      seriesRef.current.update(formatted);
    };

    if (isConnected) {
      connection.invoke('SubscribeSymbol', symbol, interval)
                .catch((err) => console.error('[Chart] Subscribe error:', err));
    }

    connection.on('ReceiveHistory', handleHistoryCandlesData);

    connection.on('ReceiveRealtime', handleRealtimeCandleData);

    connection.on('Error', (message) => {
      console.error('[Chart] Server error:', message);
    });

    return () => {
      const cleanup = async () => {
        try {
          connection.off('ReceiveHistory', handleHistoryCandlesData);
          connection.off('ReceiveRealtime', handleRealtimeCandleData);
          connection.invoke('UnsubscribeSymbol', symbol, interval)
                    .catch((err) => console.warn('[Chart] Unsubscribe error:', err));
        } catch (err) {
          console.warn('[Chart] Error during cleanup:', err);
        }
      };

      cleanup();
    };
  }, [symbol, interval, connection, isConnected]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-full rounded-lg"
    />
  );
};

export default memo(Chart);