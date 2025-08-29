import Chart from '../../components/charts/Chart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import EmptyChart from '../../components/charts/EmptyChart';
import SymbolSearch from '../../components/charts/SymbolSearch';
import { useEffect, useState } from 'react';
import { httpClient } from '../../utils/httpClient';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { useAppData } from '../../contexts/AppDataContext';

function MultiCharts() {
  const { charts, setCharts } = useAppData();
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      const fetchFollowedCharts = async () => {
          try {
              setIsLoading(true);
              const res = await httpClient.get(import.meta.env.VITE_API_FOLLOWED_CHARTS);
              const data = await res.json();
              setCharts(data.result.subscriptions || [])
          } catch (err) {
              console.error("Failed to load followed charts: ", err);
          } finally {
              setIsLoading(false);
          }
      }

      fetchFollowedCharts();
  }, [setCharts])

  const addChart = () => {
    if (charts.length >= 4) {
      toast.error("You can follow up to 4 charts only");
      return;
    }
    setCharts([...charts, { symbol: "", interval: "" }]);
  };

  const removeChart = async (index, symbol, interval) => {
    setCharts(charts.filter((_, i) => i !== index));
    if (symbol && interval) {
      try {
        await httpClient.post(import.meta.env.VITE_API_UNFOLLOW_CHART, { symbol, interval });
        toast.success(`Unfollowed ${symbol} - ${interval}`);
      } catch (err) {
        console.error("Unfollow fail: ", err);
        toast.error("Failed to unfollow chart");
      }
    }
  };

  const updateChart = async (index, key, value) => {
    // Check duplicate symbol → reject
    if (key === "symbol" && value) {
      const exists = charts.some((c, i) => i !== index && c.symbol === value);
      if (exists) {
        toast.error(`This symbol (${value}) is already followed in another chart`);
        return;
      }
    }

    // Handle unfollow old symbol (if exist) & Follow new symbol
    const prevTarget = charts[index];
    const newTarget = { ...prevTarget, [key]: value };

    setCharts(prev => prev.map((c, i) => (i === index ? newTarget : c)));

    if (
      newTarget.symbol &&
      prevTarget.symbol && prevTarget.interval &&
      prevTarget.symbol !== newTarget.symbol
    ) {
      try {
        await httpClient.post(import.meta.env.VITE_API_UNFOLLOW_CHART, {
          symbol: prevTarget.symbol,
          interval: prevTarget.interval,
        });
      } catch (err) {
        console.error("Update fail (unfollow): ", err);
      }
    }

    if (newTarget.symbol && newTarget.interval) {
      try {
        await httpClient.post(import.meta.env.VITE_API_FOLLOW_CHART, {
          symbol: newTarget.symbol,
          interval: newTarget.interval,
        });
        toast.success(`Following ${newTarget.symbol} - ${newTarget.interval}`);
      } catch (err) {
        console.error("Follow fail: ", err);
        toast.error("Failed to follow chart");
      }
    }
  };

  return (
    <div className="p-4 h-full">
      {isLoading ? (
        <Spinner width={10} height={10}/>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {charts.map(({ symbol, interval }, index) => (
            <div key={`${index}-${symbol}-${interval}`} className={`bg-[var(--color-ChartBg)] h-[480px] p-4 pb-6! rounded-lg shadow-lg border border-gray-500`}>
              <div className="flex items-center justify-between mb-4">
                <SymbolSearch followingSymbol={symbol} onSelectSymbol={(symbol) => {updateChart(index, 'symbol', symbol)}}
                              followingInterval={interval} onSelectInterval={(interval) => {updateChart(index, 'interval', interval)}}
                />

                <button onClick={() => removeChart(index, symbol, interval)} className="bg-[var(--color-TextLink)]! p-1 text-white! hover:bg-[#ef5350]!">
                  <FontAwesomeIcon icon={faXmark}/>
                </button>
              </div>

              {
                (symbol === '' || interval === '') 
                ?
                <EmptyChart/>
                : 
                <Chart symbol={symbol} interval={interval}/>
              }
            </div>
          ))}
            { charts.length < 4 && (
              <div className={`flex bg-[var(--color-ChartBg)] justify-center items-center w-full h-[480px] p-3 shadow-lg rounded-lg border-2 border-dashed border-[var(--color-PrimaryColor)]`}>
                <button onClick={addChart} className="p-2 rounded font-bold! hover:scale-105 hover:opacity-90">
                  <FontAwesomeIcon icon={faPlus} className='mr-1'/>
                  Add Chart
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default MultiCharts;
