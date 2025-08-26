"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { httpClient } from "../../utils/httpClient"

export default function Backtest() {
  const { symbol, interval, strategy } = useParams()
  const [hotSymbols, setHotSymbols] = useState([])
  const [selectedSymbol, setSelectedSymbol] = useState(symbol || "")
  const [selectedInterval, setSelectedInterval] = useState(interval || "")
  const [selectedStrategy, setSelectedStrategy] = useState(strategy || "")

  const [isLoading, setIsLoading] = useState(false)

  const [isRunningBacktest, setIsRunningBacktest] = useState(false);
  const [backtestResults, setBacktestResults] = useState({})

  //Fetch Symbols
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const resHotTrading = await httpClient.get(`${import.meta.env.VITE_API_BINANCE_HOT_TRADING}`)
        const dataHotTrading = await resHotTrading.json()
        setHotSymbols(dataHotTrading)

        setTimeout(() => {
          setIsLoading(false)
        }, 200)
      } catch (err) {
        console.error("Failed to load hot symbols", err)
        setIsLoading(false)
      }
      setIsLoading(false)
    }

    fetchData()
  }, [])

  // Search symbol
  const [keyword, setKeyword] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  const fetchSearchResults = async (keyword) => {
    try {
      setIsLoading(true)

      const res = await httpClient.get(`${import.meta.env.VITE_API_BINANCE_SEARCH}?keyword=${keyword}`)
      const data = await res.json()
      setSearchResults(data)

      setTimeout(() => {
        setIsLoading(false)
      }, 500)
    } catch (err) {
      console.error("Failed to search symbols", err)
      setIsLoading(false)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!keyword.trim()) {
        setSearchResults(hotSymbols)
      } else {
        fetchSearchResults(keyword)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [keyword, hotSymbols])

  // Update searchResults when hotSymbols changes
  useEffect(() => {
    if (!keyword.trim()) {
      setSearchResults(hotSymbols)
    }
  }, [hotSymbols, keyword])

  const handleIntervalChange = (e) => {
    setSelectedInterval(e.target.value)
  }

  const handleStrategyChange = (e) => {
    setSelectedStrategy(e.target.value)
  }

  // Fetch backtest result with GET
  const fetchBacktestResult = async (id) => {
    try {
      setIsRunningBacktest(true);
      const response = await httpClient.get(`${import.meta.env.VITE_API_BACKTEST_RUN}`)
      if (response.ok) {
        const resultText = await response.text() // might be HTML/SVG
        // console.log("📊 Backtest GET response:", resultText)
        setBacktestResults((prev) => ({ ...prev, [id]: resultText }))
        return true // success
      } else {
        console.error("Failed to fetch backtest result", response.status)
        return false
      }
    } catch (error) {
      console.error("Error fetching backtest result:", error)
      return false
    } finally {
      setIsRunningBacktest(false);
    }
  }

  // Run backtest with POST, then auto-poll GET until result is ready
  const runBacktest = async (id, symbol, interval, strategy) => {
    // console.log("runBacktest called with:", { symbol, interval, strategy })
    if (!symbol || !interval || !strategy) {
      alert("Please select symbol, interval, and strategy")
      return
    }
    try {
      setIsRunningBacktest(true);
      const jsonData = { symbol, interval, strategy }
      await httpClient.post(`${import.meta.env.VITE_API_BACKTEST_GET}`, jsonData)
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
    } finally {
      setIsRunningBacktest(false);
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
      <div className="w-full flex justify-center">
        <div
          className="overflow-hidden"
          style={{
            transform: "scale(0.8)",
            transformOrigin: "top left",
            width: "125%",
          }}
        >
          <iframe
            ref={setIframeRef}
            title="Backtest Result"
            sandbox="allow-scripts allow-same-origin"
            className="w-full border-0"
            style={{
              height: "1000px",
              width: "100%",  
            }}
          />
        </div>
      </div>
    )
  }

  const StrategyDropdown = ({ selectedStrategy, onChange }) => {
    const [hoveredOption, setHoveredOption] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    const options = [
      { id: "1", label: "MA30-MA90", desc: "Uses two moving averages (30 & 90) for trend detection." },
      { id: "2", label: "MACD", desc: "Moving Average Convergence Divergence indicator for momentum." },
      { id: "3", label: "RSI", desc: "Relative Strength Index to measure market momentum." },
      { id: "4", label: "MA50-MA200", desc: "Uses long-term moving averages for crossover strategies." },
    ];

    const handleMouseEnter = (optId, event) => {
      const rect = event.target.getBoundingClientRect();
      setTooltipPosition({ 
        x: rect.right + 8, 
        y: rect.top 
      });
      setHoveredOption(optId);
    };

    return (
      <div className="relative">
        <select
          value={selectedStrategy}
          onChange={(e) => onChange(e)}
          className="p-2 rounded-xl w-full bg-[var(--color-InputLine)] text-[var(--color-PrimaryText)] border border-[var(--color-Line)] focus:border-[var(--color-PrimaryColor)] cursor-pointer"
          onMouseLeave={() => setHoveredOption(null)}
        >
          <option value="" disabled>
            Select Strategy
          </option>
          {options.map((opt) => (
            <option
              key={opt.id}
              value={opt.id}
              onMouseEnter={(e) => handleMouseEnter(opt.id, e)}
              title={opt.desc}
            >
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Tooltip */}
        {hoveredOption && (
          <div 
            className="fixed w-48 bg-gray-800 text-white text-sm p-2 rounded opacity-90 transition-opacity duration-200 z-50 pointer-events-none"
            style={{ 
              left: `${tooltipPosition.x}px`, 
              top: `${tooltipPosition.y}px` 
            }}
          >
            {options.find(opt => opt.id === hoveredOption)?.desc}
          </div>
        )}
      </div>
    );
  };

  // Handle start backtesting button click
  const handleStartBacktest = () => {
    const backtestId = `${selectedSymbol}-${selectedInterval}-${selectedStrategy}-${Date.now()}`
    runBacktest(backtestId, selectedSymbol, selectedInterval, selectedStrategy)
  }

  return (
    <div className="relative flex flex-col w-full h-full p-4">
      <div className="relative w-full flex-shrink-0 grid grid-cols-4 gap-4 rounded-lg bg-[var(--color-ChartBg)] border border-[var(--color-Line)]">
        <div className="relative col-span-1 m-5">
          {/* Search Input */}
          <input
            type="text"
            value={selectedSymbol || keyword}
            onChange={(e) => {
              if (selectedSymbol) {
                setSelectedSymbol("")
                setKeyword(e.target.value)
              } else {
                setKeyword(e.target.value)
              }
            }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            placeholder="Search symbols..."
            className={`w-full p-2 bg-[var(--color-InputLine)] text-[var(--color-PrimaryText)] border border-[var(--color-Line)] focus:outline-none focus:border-[var(--color-PrimaryColor)] transition-all duration-300 
              ${showDropdown ? "rounded-t-xl" : "rounded-xl"} 
              placeholder:text-[var(--color-PrimaryText)]!
              `}
          />

          {/* Custom Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 bg-[var(--color-InputLine)] border border-[var(--color-Line)] rounded-b-xl border-t max-h-60 overflow-y-auto custom-scrollbar z-10 shadow-lg">
              {isLoading ? (
                <div className="p-3 text-center text-[var(--color-TertiaryText)]">Loading symbols...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((symbolData, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedSymbol(symbolData.symbol || symbolData)
                      setKeyword("")
                      setShowDropdown(false)
                    }}
                    className="p-3 cursor-pointer border-b last:border-b-0 transition-colors hover:opacity-80 text-[var(--color-PrimaryText)] border-[var(--color-Line)] bg-[var(--color-InputLine)]"
                  >
                    {symbolData.symbol || symbolData}
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-[var(--color-TertiaryText)]">No symbols found</div>
              )}
            </div>
          )}
        </div>

        <select
          value={selectedInterval}
          onChange={handleIntervalChange}
          className="m-5 p-2 rounded-xl col-span-1 bg-[var(--color-InputLine)] text-[var(--color-PrimaryText)] border border-[var(--color-Line)] focus:border-[var(--color-PrimaryColor)] cursor-pointer"
        >
          <option value="" disabled>
            Select interval
          </option>
          <option value="1m">1 Minute</option>
          <option value="3m">3 Minutes</option>
          <option value="5m">5 Minutes</option>
          <option value="15m">15 Minutes</option>
          <option value="30m">30 Minutes</option>
          <option value="1h">1 Hour</option>
          <option value="4h">4 Hours</option>
          <option value="1d">1 Day</option>
        </select>
        <div className="m-5 col-span-1">
        <StrategyDropdown selectedStrategy={selectedStrategy} onChange={(value) => {handleStrategyChange(value)}} />
        </div> {/* Strategy Dropdown with tooltips */}
        <button
          onClick={handleStartBacktest}
          className="text-2xl font-semibold m-5 p-2 rounded-xl col-span-1 hover:opacity-80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedSymbol || !selectedInterval || !selectedStrategy}
        >
          Start Backtesting
        </button>
      </div>

      {/* Results Section */}
      <div className="flex-1 mt-4 min-h-0">
        <div className="rounded-xl p-4 pr-0 h-full flex flex-col shadow bg-[var(--color-ChartBg)] border border-[var(--color-Line)]">
          <h3 className="text-xl font-bold mb-4 flex-shrink-0">Backtest Results</h3>
          { isRunningBacktest ? (
              <div className="flex justify-center items-center h-full">
                  <div className="w-10 h-10 border-2 border-[var(--color-Line)] border-t-2 border-t-[var(--color-PrimaryColor)] rounded-full animate-spin"></div>
              </div>
            ) : Object.keys(backtestResults).length === 0
                ? (
                  <div className="text-[var(--color-SecondaryText)]">Start a backtest to see results here.</div>
                )
                : (
                  <div className="flex-1 min-h-0 overflow-auto custom-scrollbar">
                    {Object.entries(backtestResults).map(([id, htmlContent]) => (
                      <div key={id} className="h-full w-full rounded-lg">
                        <HtmlRenderer htmlContent={htmlContent} className='w-full'/>
                      </div>
                    ))}
                  </div>
                )
          }
        </div>
      </div>
    </div>
  )
}