import React, { useEffect, useState } from 'react';
import Chart from '../../components/charts/Chart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark, faDownload, faPlay } from '@fortawesome/free-solid-svg-icons';
import EmptyChart from '../../components/charts/EmptyChart';
import SymbolSearch from '../../components/charts/SymbolSearch';
import { httpClient } from '../../utils/httpClient';
import { useAppData } from '../../contexts/AppDataContext';

function TradingView() {
  const { setHotSymbols } = useAppData();
  const { charts, setCharts } = useAppData();

  useEffect(() => {
    const fetchHotSymbols = async () => {
      try {
        const res = await httpClient.get(`${import.meta.env.VITE_API_BINANCE_TOPHOT}`);
        const data = await res.json();
        setHotSymbols(data);
      } catch (err) {
        console.error("Failed to load hot symbols", err);
      }
    };
    fetchHotSymbols();
  }, [setHotSymbols]);

  const addChart = () => {
    const newId = charts.length + 1;
    // Include strategy in each chart object with default value
    setCharts([...charts, { id: newId, symbol: '', interval: '', strategy: '1' }]);
  };

  const removeChart = (id) => {
    setCharts(charts.filter(c => c.id !== id));
  };

  const updateChart = (id, key, value) => {
    setCharts(charts.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  // Function to run backtest (send values to backend)
  const runBacktest = async (symbol, interval, strategy) => {
    console.log('runBacktest called with:', { symbol, interval, strategy });
    
    if (!symbol || !interval || !strategy) {
      console.log('Missing required fields:', { symbol, interval, strategy });
      alert('Please select symbol, interval, and strategy');
      return;
    }

    try {
      console.log(`Running backtest for ${symbol}, interval ${interval}, strategy ${strategy}...`);
      console.log('API endpoint:', import.meta.env.VITE_API_BACKTEST_GET);

      // Create and print the JSON data first
      const jsonData = { symbol, interval, strategy };
      console.log('JSON data to send:', JSON.stringify(jsonData, null, 2));

      const response = await httpClient.post(`${import.meta.env.VITE_API_BACKTEST_GET}`, jsonData);

      // Check if response is ok first
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      console.log('Response content-type:', contentType);

      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        console.log('Backtest completed:', result);
        alert(`Backtest completed! Check console for results.`);
      } else {
        // If not JSON, read as text to see what we got
        const textResult = await response.text();
        console.log('Non-JSON response received:', textResult);
        alert(`Backtest completed but received non-JSON response. Check console.`);
      }

    } catch (error) {
      console.error('Error running backtest:', error);
      alert(`Error running backtest: ${error.message}`);
    }
  };

  return (
    <div className="p-4 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map(({ id, symbol, interval, strategy = '1' }) => (
          <div key={id} className="bg-gray-800 p-3 rounded-lg shadow-lg h-[520px] border border-gray-500">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-2">
                <SymbolSearch followingSymbol={symbol} onSelectSymbol={(symbol) => {updateChart(id, 'symbol', symbol)}}/>
                <select
                  value={interval}
                  onChange={(e) => updateChart(id, 'interval', e.target.value)}
                  className="p-1 bg-gray-600 rounded cursor-pointer text-white"
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
                <select
                  value={strategy}
                  onChange={(e) => updateChart(id, 'strategy', e.target.value)}
                  className="p-1 bg-gray-600 rounded cursor-pointer text-white"
                >
                  <option value="1">MA30-MA90</option>
                  <option value="2">MACD</option>
                  <option value="3">RSI</option>
                  <option value="4">MA50-MA200</option>
                </select>
                <button 
                  onClick={() => runBacktest(symbol, interval, strategy)}
                  className="p-2 rounded font-bold! hover:scale-105 hover:opacity-90"
                >
                  Start Backtesting
                </button>
              </div>
              <button onClick={() => removeChart(id)} className="bg-[var(--color-TextLink)]! p-1 text-white! hover:bg-[#ef5350]!">
                <FontAwesomeIcon icon={faXmark}/>
              </button>
            </div>
            
            <div className="h-[400px]">
              {
                (symbol === '' || interval === '') ? <EmptyChart/> : <Chart symbol={symbol} interval={interval}/>
              }
            </div>
          </div>
        ))}
          { charts.length < 4 && (
            <div className="flex justify-center items-center w-full h-[520px] p-3 shadow-lg rounded-lg border-2 border-dashed border-[var(--color-PrimaryColor)]">
              <button onClick={addChart} className="p-2 rounded font-bold! hover:scale-105 hover:opacity-90">
                <FontAwesomeIcon icon={faPlus} className='mr-1'/>
                Add Chart
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default TradingView;