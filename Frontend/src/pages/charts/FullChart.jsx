import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CandlestickSeries, createChart } from 'lightweight-charts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompress, faStar as faStarSolid } from '@fortawesome/free-solid-svg-icons';
import DrawingLayer from '../../components/draw/DrawingLayer';
import { useSignalR } from '../../contexts/SignalRContext';
import { httpClient } from '../../utils/httpClient';
import { useAppData } from '../../contexts/AppDataContext';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ListCoinsTabs from '../../components/ListCoinsTabs';
import { intervalToMs } from '../../utils/functionUtils';

export default function FullChart() {
    const { symbol, interval } = useParams();
    const navigate = useNavigate();

    const wrapRef  = useRef(null);

    const { connection, isConnected } = useSignalR();

    // Gọi API lấy precision và tick size khi symbol thay đổi
    const [priceFormat, setPriceFormat] = useState({ precision: 3, minMove: 0.001 });
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

    // Khi priceFormat thay đổi → chỉ apply vào series
    useEffect(() => {
        if (seriesRef.current) {
            seriesRef.current.applyOptions({
                priceFormat: {
                    type: 'price',
                    precision: priceFormat.precision,
                    minMove: priceFormat.minMove,
                },
            });
        }
    }, [priceFormat]);

    // Khởi tạo và quản lý biểu đồ
    const chartContainerRef = useRef(null);
    const chartInstanceRef = useRef(null);
    const seriesRef = useRef(null);
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
            height: chartContainerRef.current.clientHeight,
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
        });

        chartInstanceRef.current = chart;
        seriesRef.current = candleSeries;

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.remove();
                chartInstanceRef.current = null;
                seriesRef.current = null;
            }
        };
    }, [interval]);

    // Lắng nghe theme thay đổi
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


    const [tickerData, setTickerData] = useState({lastPrice: 0, change: 0, percentChange: 0, volume: 0, high: 0, low: 0});
    const [symbolInfor, setSymbolInfor] = useState({baseAsset: symbol, quoteAsset: interval});
    // Lắng nghe realtime ticker
    useEffect(() => {
        if (!connection || !isConnected) return;

        const handleRealtimeTicker = ({ symbolCheck, intervalCheck, newTicker }) => {
            if (symbolCheck !== symbol || intervalCheck !== interval) return;

            setTickerData({
                lastPrice: parseFloat(newTicker.lastPrice),
                change: parseFloat(newTicker.change),
                percentChange: parseFloat(newTicker.percentChange),
                volume: parseFloat(newTicker.volume),
                high: parseFloat(newTicker.high),
                low: parseFloat(newTicker.low),
            });

            setSymbolInfor({
                baseAsset: newTicker.baseAsset,
                quoteAsset: newTicker.quoteAsset,
            })
        };

        connection.on("ReceiveRealtimeTicker", handleRealtimeTicker);

        return () => {
            connection.off("ReceiveRealtimeTicker", handleRealtimeTicker);
        };
    }, [connection, isConnected, symbol, interval]);


    // Fetch Hot Trading & Top Volumn Symbols
    const [topSymbols, setTopSymbols] = useState({
        topTrading: [],
        topVolume: []
    });
    const [loadingSymbols, setLoadingSymbols] = useState(false);

    // Fetch top symbols
    useEffect(() => {
        const fetchSymbolsData = async () => {
            try {
                setLoadingSymbols(true);
                const [resHotTrading, resTopVolume] = await Promise.all([
                    httpClient.get(import.meta.env.VITE_API_BINANCE_HOT_TRADING),
                    httpClient.get(import.meta.env.VITE_API_BINANCE_TOP_VOLUME)
                ]);

                setTopSymbols({
                    topTrading: await resHotTrading.json(),
                    topVolume: await resTopVolume.json(),
                });
                setLoadingSymbols(false);
            } catch (err) {
                console.error("Failed to load top symbols", err);
            } finally {
                setLoadingSymbols(false);
            }
        };

        fetchSymbolsData();
    }, []);

    const { isAuthenticated, isLoading } = useAuth();

    // Fetch Followed charts
    const { charts, setCharts } = useAppData();
    useEffect(() => {
      const fetchFollowedCharts = async () => {
          try {
              const res = await httpClient.get(import.meta.env.VITE_API_FOLLOWED_CHARTS);
              const data = await res.json();
              setCharts(data.result.subscriptions || [])
          } catch (err) {
              console.error("Failed to load followed charts: ", err);
          }
      }
      if (!isLoading) {
        if (isAuthenticated()) {
            fetchFollowedCharts();
        } else {
            setCharts([]);
        }
      }
  }, [setCharts, isLoading, isAuthenticated])

    // Handle follow/unfollow chart
    const handleFollowClick = async () => {
        if (!isAuthenticated()) {
            toast.error("Please login to follow symbol!");
            return;
        }

        const existing = charts.find(c => c.symbol === symbol);

        if (!existing) {
            if (charts.length < 4) {
                try {
                    await httpClient.post(import.meta.env.VITE_API_FOLLOW_CHART, {
                        symbol: symbol,
                        interval: interval,
                    });
                    setCharts([...charts, { symbol: symbol, interval: interval }]);
                    toast.success(`Following ${symbolInfor.baseAsset}/${symbolInfor.quoteAsset}`)
                } catch (err) {
                    console.error("Follow fail: ", err);
                    toast.error("Failed to follow chart");
                }
            } else {
                toast.error("You can follow up to 4 charts only");
            }
        } else {
            try {
                await httpClient.post(import.meta.env.VITE_API_UNFOLLOW_CHART, { symbol: existing.symbol, interval: existing.interval });
                setCharts(charts.filter(c => !(c.symbol === symbol)));
                toast.success(`Unfollowed ${symbolInfor.baseAsset}/${symbolInfor.quoteAsset}`)
            } catch (err) {
                console.error("Unfollow fail: ", err);
                toast.error("Failed to unfollow chart");
            }
        }
    }


    // AI Prediction
    const [predictedData, setPredictedData] = useState(null);
    const [predicting, setPredicting] = useState(false);

    const resetTimerRef = useRef(null);

    // Cleanup khi unmount
    useEffect(() => {
        return () => {
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
            }
            };
    }, []);

    useEffect(() => {
        setPredictedData(null);
    }, [symbol, interval])

    const handlePredict = async () => {
        if (!seriesRef.current) {
            toast.error("No chart data available for prediction");
            return;
        }

        try {
            setPredicting(true);

            const candlesRes = await httpClient.get(
                `${import.meta.env.VITE_API_BINANCE_HISTORY_CANDLES}?symbol=${symbol}&interval=${interval}`
            );

            const candlesResult = await candlesRes.json()

            const formattedCandles = candlesResult.map(c => {
                const openTimeSec = Math.floor(new Date(c.openTime).getTime() / 1000) + 7 * 3600;
                return {
                    time: openTimeSec,
                    openTime: openTimeSec,
                    open: parseFloat(c.open),
                    high: parseFloat(c.high),
                    low: parseFloat(c.low),
                    close: parseFloat(c.close),
                    volume: parseFloat(c.volume),
                };
            });

            const predictionRes = await httpClient.post(
                import.meta.env.VITE_API_AI_PREDICT_NEXT_CANDLE,
                { 
                    candles: formattedCandles,
                    sentiment: null,
                    symbol: symbol
                }
            );
            const predictionResult = await predictionRes.json();

            if (predictionResult?.predicted_close) {
                const now = Date.now();
                const intervalMs = intervalToMs(interval);
                const nextCloseTime = new Date(Math.floor(now / intervalMs) * intervalMs + intervalMs);
                setPredictedData({
                    predictedPrice: parseFloat(predictionResult.predicted_close),
                    closeTime: nextCloseTime
                }); 

                toast.success("Prediction success!");

                if (resetTimerRef.current) {
                    clearTimeout(resetTimerRef.current);
                }
                const delay = nextCloseTime.getTime() - now;
                resetTimerRef.current = setTimeout(() => {
                    setPredictedData(null);
                }, delay);
            } else {
                toast.error("Prediction failed!");
            }
        } catch (err) {
            console.error("Predict error:", err);
            toast.error("Prediction failed");
        } finally {
            setPredicting(false);
        }
    };

    return (
        <div ref={wrapRef} className="flex w-full h-full py-2">
        <div className="relative flex-1 flex gap-2 h-full">
            {/* Chart Part */}
            <div id='chart-part' className='flex flex-1 flex-col gap-2'> 
                {/* Symbol information */}
                <div className='border border-[var(--color-Line)] gap-6 rounded-lg py-4 bg-[var(--color-ChartBg)] flex items-center px-4'>
                    {/* Follow Button */}
                    <div className='flex items-center'>
                        <button 
                            className='bg-transparent! p-1 border! border-[var(--color-DisableText)]!'
                            onClick={handleFollowClick}
                        >
                            { 
                                charts.find(c => c.symbol === symbol) && isAuthenticated()
                                ? <FontAwesomeIcon className='text-yellow-500 ' icon={faStarSolid}/>
                                : <FontAwesomeIcon className='text-[var(--color-DisableText)] ' icon={faStarRegular}/>
                            }
                        </button>
                    </div>

                    <div className='flex flex-1 items-center'>
                        <div className="font-bold text-2xl text-[var(--color-PrimaryColor)]">{symbolInfor.baseAsset}
                            <span className="font-normal text-[var(--color-TertiaryText)] ml-0.5">({symbolInfor.quoteAsset})</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className='flex flex-1 items-center'>
                        {/* <div className='text-xs text-[var(--color-TertiaryText)]'>Price</div> */}
                        <div className="font-bold text-xl text-[var(--color-PrimaryColor)]">
                            ${tickerData.lastPrice > 1 
                                ? tickerData.lastPrice.toLocaleString(undefined, {maximumFractionDigits: priceFormat.precision})
                                : tickerData.lastPrice.toFixed(priceFormat.precision)}
                        </div>
                    </div>
                    {/* Change */}
                    <div className='flex flex-col flex-1 items-start'>
                        <div className='text-xs text-[var(--color-TertiaryText)]'>24h Chg</div>
                        <div className={`font-semibold text-sm ${tickerData.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {Math.abs(tickerData.change) > 1 
                                ? Math.abs(tickerData.change).toLocaleString(undefined, {maximumFractionDigits: priceFormat.precision})
                                : Math.abs(tickerData.change).toFixed(priceFormat.precision)}
                        </div>
                    </div>

                    {/* ChangePercent */}
                    <div className='flex flex-col flex-1 items-start'>
                        <div className='text-xs text-[var(--color-TertiaryText)]'>24h Chg %</div>
                        <div className={`font-semibold text-sm ${tickerData.percentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {tickerData.percentChange >= 0 ? "+" : "-"}
                            {Math.abs(tickerData.percentChange).toFixed(2)}%
                        </div>
                    </div>

                    {/* High */}
                    <div className='flex flex-col flex-1 items-start'>
                        <div className='text-xs text-[var(--color-TertiaryText)]'>24h High</div>
                        <div className="font-semibold text-sm">
                            ${tickerData.high > 1 
                                ? tickerData.high.toLocaleString(undefined, {maximumFractionDigits: priceFormat.precision})
                                : tickerData.high.toFixed(priceFormat.precision)}
                        </div>
                    </div>

                    {/* Low */}
                    <div className='flex flex-col flex-1 items-start'>
                        <div className='text-xs text-[var(--color-TertiaryText)]'>24h low</div>
                        <div className="font-semibold text-sm">
                            ${tickerData.low > 1 
                                ? tickerData.low.toLocaleString(undefined, {maximumFractionDigits: priceFormat.precision})
                                : tickerData.low.toFixed(priceFormat.precision)}
                        </div>
                    </div>

                    {/* Volumn */}
                    <div className='flex flex-col flex-1 items-start'>
                        <div className='text-xs text-[var(--color-TertiaryText)]'>24h Volume</div>
                        <div className="font-semibold text-sm">
                            ${tickerData.volume.toLocaleString()}
                        </div>
                    </div>

                    <div className='flex justify-end'>
                        <select
                            value={["1m","3m","5m","15m","30m","1h","4h","1d"].includes(interval) ? interval : ""}
                            onChange={e => navigate(`/chart/${symbol}/${e.target.value}`)}
                            className="p-1 bg-[var(--color-InputLine)] rounded cursor-pointer"
                            >
                            <option value="1m">1 Minute</option>
                            <option value="3m">3 Minutes</option>
                            <option value="5m">5 Minutes</option>
                            <option value="15m">15 Minutes</option>
                            <option value="30m">30 Minutes</option>
                            <option value="1h">1 Hour</option>
                            <option value="4h">4 Hours</option>
                            <option value="1d">1 Day</option>
                            <option value="" disabled>Interval</option>
                        </select>
                    </div>
                </div>

                {/* Overlay tools & Chart */}
                <div className='flex flex-1 gap-2 relative h-full w-full'>
                    <div className='relative p-4 pl-14 flex-1 bg-[var(--color-ChartBg)] rounded-lg border border-[var(--color-Line)]'>
                        {/* CHART CONTAINER */}
                        <div ref={chartContainerRef} className='w-full h-full' />

                        {/* OVERLAY DRAWING (đặt SAU chart container để overlay) */}
                        {chartInstanceRef.current && seriesRef.current && (
                        <DrawingLayer
                            chart={chartInstanceRef.current}
                            series={seriesRef.current}
                            containerRef={chartContainerRef}
                        />
                        )}

                        {/* Nút thu nhỏ */}
                        {charts.find(c => c.symbol === symbol) &&
                            <button
                                onClick={() => navigate('/multi-charts')}
                                className="absolute bottom-2 right-2 z-40 p-1.5 rounded-xl hover:opacity-80 hover:scale-110"
                            >
                                <FontAwesomeIcon icon={faCompress}/>
                            </button>
                        }
                    </div>
                </div>
            </div>

            {/* Prediction Part & Top List Coins */}
            <div className="flex flex-col gap-2 w-[24%]">
                {/* AI Prediction Service */}
                <div className='border border-[var(--color-Line)] rounded-lg p-2 bg-[var(--color-ChartBg)] flex flex-col gap-3'>
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg text-[var(--color-PrimaryColor)]">AI Price Prediction</h3>
                        <button 
                            onClick={handlePredict} 
                            disabled={predicting}
                            className="px-3 py-1 rounded-md bg-[var(--color-PrimaryColor)] hover:scale-102 disabled:opacity-50"
                        >
                            {predicting ? "Predicting..." : "Predict"}
                        </button>
                    </div>

                    {predicting 
                    ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="w-6 h-6 border-2 border-[var(--color-Line)] border-t-[var(--color-PrimaryColor)] rounded-full animate-spin"></div>
                        </div>
                    )
                    : (
                        <div className="flex flex-col gap-2">
                            <div className="text-sm">
                                <span className="text-[var(--color-TertiaryText)] mr-2">Predicted Close Price:</span>
                                <span className="font-semibold text-[var(--color-PrimaryColor)]">
                                    ${predictedData !== null   
                                        ? (predictedData.predictedPrice > 1 
                                            ? predictedData.predictedPrice.toLocaleString(undefined, {maximumFractionDigits: priceFormat.precision})
                                            : predictedData.predictedPrice.toFixed(priceFormat.precision)
                                        )
                                        : "0.00"
                                    }
                                </span>
                            </div>
                            <div className="text-sm">
                                <span className="text-[var(--color-TertiaryText)] mr-2">Change:</span>
                                { predictedData !== null && tickerData?.lastPrice 
                                    ? (
                                        <span
                                            className={`ml-2 font-semibold ${
                                                predictedData.predictedPrice - tickerData.lastPrice >= 0 ? "text-green-500" : "text-red-500"
                                            }`}
                                            >
                                            {(predictedData.predictedPrice - tickerData.lastPrice).toFixed(priceFormat.precision)}
                                        </span>
                                    )
                                    : "0.00"
                                }
                            </div>
                            <div className="text-sm">
                                <span className="text-[var(--color-TertiaryText)] mr-2">Change %:</span>
                                { predictedData !== null && tickerData?.lastPrice 
                                    ? (
                                        <span
                                            className={`ml-2 font-semibold ${
                                                predictedData.predictedPrice - tickerData.lastPrice >= 0 ? "text-green-500" : "text-red-500"
                                            }`}
                                            >
                                            {((predictedData.predictedPrice - tickerData.lastPrice) / tickerData.lastPrice * 100).toFixed(2)}%
                                        </span>
                                    )
                                    : "0.00"
                                }
                            </div>

                            <div className="text-sm">
                                <span className="text-[var(--color-TertiaryText)] mr-2">Close Time:</span>
                                <span className="font-semibold">
                                    {predictedData 
                                        ? predictedData.closeTime.toLocaleString() 
                                        : "--"}
                                </span>
                            </div>

                            <div className="text-sm text-[var(--color-TertiaryText)] italic">
                                {predictedData 
                                    ? `*Prediction will reset automatically at ${predictedData.closeTime.toLocaleTimeString("en-GB", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: false,
                                            timeZone: "Asia/Ho_Chi_Minh",
                                        })}*`
                                    : "*Press Predict to get next candle prediction*"
                                }
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Trading & Volumn */}
                <ListCoinsTabs isLoading={loadingSymbols} tabLabels={["Top Trading", "Top Volume"]} tabData={[topSymbols.topTrading, topSymbols.topVolume]}/>                
            </div>
        </div>
        </div>
    );
}