import React, { useEffect, useRef } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';
import * as signalR from '@microsoft/signalr';

const Chart = ({ symbol = 'BTCUSDT', interval = '1m' }) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const seriesRef = useRef(null);
  const hubConnectionRef = useRef(null);

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
  }, [interval]);

  // Kết nối SignalR và xử lý dữ liệu
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7114/chartHub')
      .withAutomaticReconnect()
      .build();

    hubConnectionRef.current = connection;

    let isSubscribed = true;

    connection
      .start()
      .then(() => {
        console.log('✅ SignalR connected');
        if (isSubscribed) {
          connection
            .invoke('SubscribeCandle', symbol, interval)
            .catch((err) => console.error('[Chart] Error subscribing:', err));
        }
      })
      .catch((err) => console.error('[Chart] SignalR connection error:', err));

    connection.on('HistoryCandles', (candles) => {
      if (!candles || !Array.isArray(candles) || !seriesRef.current) {
        console.error('[Chart] Invalid data or series disposed:', candles);
        return;
      }
      const formatted = candles.map((c) => ({
        time: Math.floor(new Date(c.openTime).getTime() / 1000) + 7 * 3600,
        open: parseFloat(c.open) || 0,
        high: parseFloat(c.high) || 0,
        low: parseFloat(c.low) || 0,
        close: parseFloat(c.close) || 0,
      }));
      seriesRef.current.setData(formatted);
    });

    connection.on('NewCandle', (candle) => {
      if (!seriesRef.current) {
        console.error('[Chart] Series disposed, skipping update');
        return;
      }
      const formatted = {
        time: Math.floor(new Date(candle.openTime).getTime() / 1000) + 7*3600,
        open: parseFloat(candle.open) || 0,
        high: parseFloat(candle.high) || 0,
        low: parseFloat(candle.low) || 0,
        close: parseFloat(candle.close) || 0,
      };
      seriesRef.current.update(formatted);
    });

    connection.on('Error', (message) => {
      console.error('[Chart] Server error:', message);
    });

    return () => {
      isSubscribed = false;
      if (hubConnectionRef.current) {
        hubConnectionRef.current
          .invoke('UnsubscribeCandle', symbol, interval)
          .catch((err) => console.warn('[Chart] Error unsubscribing:', err));
        hubConnectionRef.current.stop().catch((err) => console.warn('[Chart] Error stopping:', err));
        hubConnectionRef.current = null;
      }
    };
  }, [symbol, interval]);

  return (
    <div
      ref={chartContainerRef}
      className="w-full h-[400px] bg-gray-800 rounded-lg"
    />
  );
};

export default Chart;