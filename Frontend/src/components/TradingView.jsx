import React, { useState } from 'react';
import Chart from './Chart';

function TradingView() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1m');

  return (
    <div className="container mx-auto p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Trading Chart</h1>
      <div className="mb-4 flex space-x-4">
        <select
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        >
          <option value="BTCUSDT">BTCUSDT</option>
          <option value="ETHUSDT">ETHUSDT</option>
          <option value="BNBUSDT">BNBUSDT</option>
        </select>
        <select
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
          className="p-2 bg-gray-800 rounded"
        >
          <option value="1m">1 Minute</option>
          <option value="3m">3 Minutes</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="30m">30 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </select>
      </div>
      <Chart symbol={symbol} interval={interval} />
    </div>
  );
}

export default TradingView;