import React, { memo, useEffect, useRef, useState } from 'react';
import { CandlestickSeries, createChart } from 'lightweight-charts';
import { useSignalR } from '../../contexts/SignalRContext';
import { httpClient } from '../../utils/httpClient';
import { useNavigate } from 'react-router-dom';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAppData } from '../../contexts/AppDataContext';

const Chart = ({ symbol, interval }) => {
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

    const styles = getComputedStyle(document.documentElement);
    const bgColor = styles.getPropertyValue("--color-ChartBg").trim();
    const textColor = styles.getPropertyValue("--color-PrimaryText").trim();
    const gridColor = styles.getPropertyValue("--color-Line").trim();

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: bgColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
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

  const { theme } = useAppData();
  useEffect(() => {
    if (!chartInstanceRef.current) return;

    const styles = getComputedStyle(document.documentElement);
    const bgColor = styles.getPropertyValue("--color-ChartBg").trim();
    const textColor = styles.getPropertyValue("--color-PrimaryText").trim();
    const gridColor = styles.getPropertyValue("--color-Line").trim();

    chartInstanceRef.current.applyOptions({
      layout: {
        background: { color: bgColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
    });
  }, [theme]);

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

    connection.on('ReceiveHistoryCandles', handleHistoryCandlesData);

    connection.on('ReceiveRealtimeCandle', handleRealtimeCandleData);

    connection.on('Error', (message) => {
      console.error('[Chart] Server error:', message);
    });

    return () => {
      const cleanup = async () => {
        try {
          connection.off('ReceiveHistoryCandles', handleHistoryCandlesData);
          connection.off('ReceiveRealtimeCandle', handleRealtimeCandleData);
          connection.invoke('UnsubscribeSymbol', symbol, interval)
                    .catch((err) => console.warn('[Chart] Unsubscribe error:', err));
        } catch (err) {
          console.warn('[Chart] Error during cleanup:', err);
        }
      };

      cleanup();
    };
  }, [symbol, interval, connection, isConnected]);

  const navigate = useNavigate();

  return (
    <div
      ref={chartContainerRef}
      className="relative w-full h-fit rounded-lg"
    >
      <button
        onClick={() => navigate(`/chart/${symbol}/${interval}`)}
        className="absolute bottom-[-8px] right-[-8px] p-1 hover:bg-gray-600 rounded hover:opacity-80 hover:scale-110 z-50"
      >
        <FontAwesomeIcon icon={faExpand} className='text-lg'/>  
      </button>
    </div>
  );
};

export default memo(Chart);