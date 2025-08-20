"use client"

import React, { useEffect, useState } from "react"
import Chart from "../../components/charts/Chart"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faXmark } from "@fortawesome/free-solid-svg-icons"
import EmptyChart from "../../components/charts/EmptyChart"
import SymbolSearch from "../../components/charts/SymbolSearch"
import { httpClient } from "../../utils/httpClient"
import { useAppData } from "../../contexts/AppDataContext"

function TradingView() {
  const { setHotSymbols } = useAppData()
  const { charts, setCharts } = useAppData()

  const [backtestResults, setBacktestResults] = useState({})

  // Load hot symbols once
  useEffect(() => {
    const fetchHotSymbols = async () => {
      try {
        const res = await httpClient.get(`${import.meta.env.VITE_API_BINANCE_TOPHOT}`)
        const data = await res.json()
        setHotSymbols(data)
      } catch (err) {
        console.error("Failed to load hot symbols", err)
      }
    }
    fetchHotSymbols()
  }, [setHotSymbols])

  const addChart = () => {
    const newId = charts.length + 1
    setCharts([...charts, { id: newId, symbol: "", interval: "", strategy: "1" }])
  }

  const removeChart = (id) => {
    setCharts(charts.filter((c) => c.id !== id))
  }

  const updateChart = (id, key, value) => {
    setCharts(charts.map((c) => (c.id === id ? { ...c, [key]: value } : c)))
  }

  // Fetch backtest result with GET
  const fetchBacktestResult = async (id) => {
    try {
      const response = await httpClient.get("/api/backtest/chart-file", null, "https://localhost:7207")

      if (response.ok) {
        const resultText = await response.text() // might be HTML/SVG
        console.log("📊 Backtest GET response:", resultText)

        setBacktestResults((prev) => ({ ...prev, [id]: resultText }))
        return true // success
      } else {
        console.error("Failed to fetch backtest result", response.status)
        return false
      }
    } catch (error) {
      console.error("Error fetching backtest result:", error)
      return false
    }
  }

  // Run backtest with POST, then auto-poll GET until result is ready
  const runBacktest = async (id, symbol, interval, strategy) => {
    console.log("runBacktest called with:", { symbol, interval, strategy })

    if (!symbol || !interval || !strategy) {
      alert("Please select symbol, interval, and strategy")
      return
    }

    try {
      const jsonData = { symbol, interval, strategy }
      await httpClient.post(`${import.meta.env.VITE_API_BACKTEST_GET}`, jsonData, "https://localhost:7207")

      // Start polling every 3s until result is ready
      const pollInterval = setInterval(async () => {
        const success = await fetchBacktestResult(id)
        if (success) {
          clearInterval(pollInterval) // stop polling
        }
      }, 3000)
    } catch (error) {
      console.error("Error running backtest:", error)
      alert(`Error running backtest: ${error.message}`)
    }
  }

  // Component to render HTML content in iframe
  const HtmlRenderer = ({ htmlContent }) => {
    const [iframeRef, setIframeRef] = useState(null)

    useEffect(() => {
      if (iframeRef && htmlContent) {
        const iframe = iframeRef
        const doc = iframe.contentDocument || iframe.contentWindow.document
        doc.open()
        doc.write(htmlContent)
        doc.close()
      }
    }, [iframeRef, htmlContent])

    return (
      <iframe
        ref={setIframeRef}
        className="w-full h-full border-0"
        title="Backtest Result"
        sandbox="allow-scripts allow-same-origin"
      />
    )
  }

  return (
    <div className="p-4 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charts.map(({ id, symbol, interval, strategy = "1" }) => (
          <React.Fragment key={id}>
            {/* Main Chart Container */}
            <div className="bg-gray-800 p-3 rounded-lg shadow-lg h-[520px] border border-gray-500">
              {/* Top controls */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <SymbolSearch
                    followingSymbol={symbol}
                    onSelectSymbol={(symbol) => updateChart(id, "symbol", symbol)}
                  />
                  <select
                    value={interval}
                    onChange={(e) => updateChart(id, "interval", e.target.value)}
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
                    <option value="" disabled>
                      Interval
                    </option>
                  </select>
                  <select
                    value={strategy}
                    onChange={(e) => updateChart(id, "strategy", e.target.value)}
                    className="p-1 bg-gray-600 rounded cursor-pointer text-white"
                  >
                    <option value="1">MA30-MA90</option>
                    <option value="2">MACD</option>
                    <option value="3">RSI</option>
                    <option value="4">MA50-MA200</option>
                  </select>
                  <button
                    onClick={() => runBacktest(id, symbol, interval, strategy)}
                    className="p-2 rounded font-bold! hover:scale-105 hover:opacity-90"
                  >
                    Start Backtesting
                  </button>
                </div>
                <button
                  onClick={() => removeChart(id)}
                  className="bg-[var(--color-TextLink)]! p-1 text-white! hover:bg-[#ef5350]!"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className="h-[400px]">
                {symbol === "" || interval === "" ? <EmptyChart /> : <Chart symbol={symbol} interval={interval} />}
              </div>
            </div>

            <div className="bg-white p-3 rounded-lg shadow-lg h-[520px] border border-gray-300">
              <div className="h-full text-black overflow-hidden">
                {backtestResults[id] ? (
                  <HtmlRenderer htmlContent={backtestResults[id]} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <p>No backtest result yet</p>
                  </div>
                )}
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

export default TradingView
