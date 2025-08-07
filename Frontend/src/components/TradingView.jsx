import React, { useEffect, useState } from 'react';
import Chart from './Chart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import EmptyChart from './EmptyChart';
import SymbolSearch from './SymbolSearch';
import { httpClient } from '../utils/httpClient';

function TradingView() {
  const [hotSymbols, setHotSymbols] = useState([]);

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
  }, []);

  const [charts, setCharts] = useState([
    { id: 1, symbol: '', interval: '' },
  ]);

  const addChart = () => {
    const newId = charts.length ? Math.max(...charts.map(c => c.id)) + 1 : 1;
    setCharts([...charts, { id: newId, symbol: '', interval: '' }]);
  };

  const removeChart = (id) => {
    setCharts(charts.filter(c => c.id !== id));
  };

  const updateChart = (id, key, value) => {
    setCharts(charts.map(c => c.id === id ? { ...c, [key]: value } : c));
  };

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Multi-Chart View</h1>
        <button onClick={addChart} className="bg-[#26a69a] px-4 py-2 rounded font-bold!">
          <FontAwesomeIcon icon={faPlus} className='mr-1'/>
          Add Chart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map(({ id, symbol, interval }) => (
          <div key={id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex space-x-2">
                <SymbolSearch hotSymbols={hotSymbols} onSelectSymbol={(symbol) => {updateChart(id, 'symbol', symbol)}}/>
                <select
                  value={interval}
                  onChange={(e) => updateChart(id, 'interval', e.target.value)}
                  className="p-1 bg-gray-700 rounded cursor-pointer"
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
              <button onClick={() => removeChart(id)} className="text-[#ef5350] bg-[#f9f9f9] p-1! hover:text-white hover:bg-[#ef5350]!">
                <FontAwesomeIcon icon={faXmark}/>
              </button>
            </div>
            {
              (symbol === '' || interval === '') ? <EmptyChart/> : <Chart symbol={symbol} interval={interval}/>
            }
          </div>
        ))}
      </div>
    </div>
  );
}

export default TradingView;
