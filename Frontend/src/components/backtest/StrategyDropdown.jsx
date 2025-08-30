import { memo, useState } from "react";

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

export default memo(StrategyDropdown);