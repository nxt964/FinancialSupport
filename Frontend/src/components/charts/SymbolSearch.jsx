import { faCircleXmark, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { httpClient } from "../../utils/httpClient";

const SymbolSearch = ({ hotSymbols, onSelectSymbol }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState("Symbol")
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState(hotSymbols);
  const [loading, setLoading] = useState(false);

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

  const handleSelect = (symbol) => {
    onSelectSymbol(symbol)
    setSymbol(symbol)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        className="flex items-center justify-between py-1! px-2! space-x-3 bg-gray-600! rounded! font-normal! text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{symbol}</span>
        <FontAwesomeIcon icon={faSearch}/>
      </button>

      {/* Modal / Search Box */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-85 bg-[#202630] shadow-lg rounded p-4 border border-[var(--color-Line)] animate-fade-in transition-opacity duration-300">
          <div className="flex justify-between items-center mb-2">
            <div className="relative flex items-center rounded flex-1">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full p-2 pr-9 text-white focus:outline-none rounded-md border border-[var(--color-Line)] focus:border-[var(--color-PrimaryColor)] transition-all duration-300"
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
            <button className="ml-2 px-2 py-1.5 hover:scale-105 text-white" onClick={() => setIsOpen(false)}>
              Cancel
            </button>
          </div>

          <div className="text-sm text-white mb-2">{!keyword ? "Hot Trading" : ""}</div>

          {loading ? (
            <div className="text-center text-white py-4">Searching...</div>
          ) : (
            <ul className="custom-scrollbar divide-y divide-gray-100 max-h-70 pe-2 overflow-y-auto">
              {results.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center p-2 cursor-pointer hover:bg-gray-600 text-white"
                  onClick={() => handleSelect(item.symbol)}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">${item.price > 1 ? Number(item.price).toLocaleString() : item.price}</div>
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
              {results.length === 0 && <div className="text-center text-white py-4">No results found</div>}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SymbolSearch;
