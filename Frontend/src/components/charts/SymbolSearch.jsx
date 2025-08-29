import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { httpClient } from "../../utils/httpClient";

const SymbolSearch = ({ followingSymbol, onSelectSymbol, followingInterval, onSelectInterval }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  const [hotSymbols, setHotSymbols] = useState([]);
  const [results, setResults] = useState(hotSymbols);

  useEffect(() => {
    const fetchHotSymbols = async () => {
      try {
        const res = await httpClient.get(`${import.meta.env.VITE_API_BINANCE_HOT_TRADING}`);
        const data = await res.json();
        setHotSymbols(data);
      } catch (err) {
        console.error("Failed to load hot symbols", err);
      }
    };
    fetchHotSymbols();
  }, []);

  // Debounce fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!keyword.trim()) {
        setResults(hotSymbols)
      } else {
        fetchSearchResults(keyword);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, hotSymbols]);


  const fetchSearchResults = async (keyword) => {
    setLoading(true);
    try {
      const res = await httpClient.get(`${import.meta.env.VITE_API_BINANCE_SEARCH}?keyword=${keyword}`)
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Failed to search symbols", err);
    }
    setLoading(false);
  };

  const handleSelectSymbol = (symbol) => {
    onSelectSymbol(symbol)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <div className="flex space-x-5">
        <button
          className="flex items-center justify-between py-1! px-2! bg-[var(--color-InputLine)]! rounded! "
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`${followingSymbol !== '' ? "text-[var(--color-PrimaryColor)] font-semibold" : ""}`}>
            {followingSymbol || "Symbol"}
            <FontAwesomeIcon className="ml-2" icon={faSearch}/>
          </span>
          
        </button>

        <select
          value={followingInterval}
          onChange={(e) => onSelectInterval(e.target.value)}
          className="p-1 bg-[var(--color-InputLine)] rounded cursor-pointer font-semibold"
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

      {/* Modal / Search Box */}
      {isOpen && (
        <div className="absolute bg-[var(--color-BasicBg)] z-50 mt-2 w-85 shadow-lg rounded p-2 border border-[var(--color-Line)] animate-fade-in transition-opacity duration-300">
          <div className="flex justify-between items-center mb-2">
            <div className="relative flex items-center rounded flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full p-2 pr-9 focus:outline-none rounded-md border border-[var(--color-Line)] focus:border-[var(--color-PrimaryColor)] transition-all duration-300"
                placeholder="Search symbol..."
              />
              {keyword && (
                <button
                  onClick={() => setKeyword("")}
                  className="absolute right-0 p-2! bg-transparent! text-gray-400 hover:text-white text-sm"
                >
                  <FontAwesomeIcon icon={faCircleXmark}/>
                </button>
              )}
            </div>
            <button className="ml-2 px-2 py-1.5 hover:scale-105" onClick={() => setIsOpen(false)}>
              Close
            </button>
          </div>

          <div className="text-sm mb-2">{!keyword ? "Hot Trading" : ""}</div>

          {loading ? (
            <div className="text-center py-4">Searching...</div>
          ) : (
            <ul className="custom-scrollbar divide-y divide-[var(--color-Line)] max-h-70 pe-2 overflow-y-auto">
              {results.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center px-2 py-1 cursor-pointer rounded-lg hover:bg-[var(--color-InputLine)]"
                  onClick={() => handleSelectSymbol(item.symbol)}
                >
                  <div className="flex flex-col">
                    <div className="font-semibold text-[var(--color-PrimaryColor)]">{item.baseAsset}
                        <span className="text-sm font-light text-[var(--color-TertiaryText)]">/{item.quoteAsset}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">${item.price > 1 ? Number(item.price).toLocaleString() : item.price}</div>
                    <div className={`text-xs ${item.priceChangePercent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.priceChangePercent > 0
                      ? `+${Math.abs(item.priceChangePercent).toFixed(2)}%`
                      : item.priceChangePercent < 0
                      ? `-${Math.abs(item.priceChangePercent).toFixed(2)}%`
                      : `0.00%`}
                    </div>
                  </div>
                </li>
              ))}
              {results.length === 0 && <div className="text-center py-4">No results found</div>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SymbolSearch;
