"use client"

import { useState } from "react"
import { Search } from "lucide-react"


const tradingPairs = [
  { symbol: "FLOKI/USDT", price: "$0.00010444", change: "-0.91%", isNegative: true },
  { symbol: "ETH/USDT", price: "$4,420.78", change: "-0.12%", isNegative: true },
  { symbol: "SOL/USDT", price: "$186.86", change: "-0.24%", isNegative: true },
  { symbol: "BTC/USDT", price: "$117,359.99", change: "+2.15%", isNegative: false },
  { symbol: "BONK/USDT", price: "$0.00002386", change: "-1.45%", isNegative: true },
]

export default function Sidebar() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPair, setSelectedPair] = useState("FLOKI/USDT")

  return (
    <div className="w-80 bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Search Section */}
      <div className="flex items-center space-x-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" /> 
          <input
            placeholder="Search symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white pl-10"
          />
        </div>
        <button className="bg-teal-400 hover:bg-teal-500 text-white px-4">Close</button>
      </div>

      {/* Hot Trading Section */}   
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-3">Hot Trading</h3>
        <div className="space-y-2">
          {tradingPairs.map((pair) => (
            <div
              key={pair.symbol}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedPair === pair.symbol ? "bg-gray-700/50 border border-teal-400/30" : "hover:bg-gray-700/30"
              }`}
              onClick={() => setSelectedPair(pair.symbol)}
            >
              <div>
                <div className="font-medium text-white">{pair.symbol}</div>
                <div className="text-sm text-gray-400">{pair.price}</div>
              </div>
              <div className={`text-sm font-medium ${pair.isNegative ? "text-red-400" : "text-green-400"}`}>
                {pair.change}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
