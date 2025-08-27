import Chart from '../../components/charts/Chart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import EmptyChart from '../../components/charts/EmptyChart';
import SymbolSearch from '../../components/charts/SymbolSearch';
import { useAppData } from '../../contexts/AppDataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function MultiCharts() {
  const { isAuthenticated } = useAuth();
  const { charts, addChart, updateChart, removeChart } = useAppData();
  const navigate = useNavigate();

  if (!isAuthenticated()) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4">
                        Please log in to use view multi-charts
                    </h2>
                    <button
                        onClick={() => navigate('/auth/login')}
                        className="px-4 py-2 rounded-lg hover:scale-105 hover:opacity-80"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }
  
  return (
    <div className="p-4 min-h-full">
      <div className="grid grid-cols-2 gap-6">
        {charts.map(({ id, symbol, interval }) => (
          <div key={`${symbol}-${interval}`} className={`bg-[var(--color-ChartBg)] h-[480px] p-4 pb-6! rounded-lg shadow-lg border border-gray-500`}>
            <div className="flex items-center justify-between mb-4">
              <SymbolSearch followingSymbol={symbol} onSelectSymbol={(symbol) => {updateChart(id, 'symbol', symbol)}}
                            followingInterval={interval} onSelectInterval={(interval) => {updateChart(id, 'interval', interval)}}
              />

              <button onClick={() => removeChart(id)} className="bg-[var(--color-TextLink)]! p-1 text-white! hover:bg-[#ef5350]!">
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
              <button onClick={() => addChart("","")} className="p-2 rounded font-bold! hover:scale-105 hover:opacity-90">
                <FontAwesomeIcon icon={faPlus} className='mr-1'/>
                Add Chart
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

export default MultiCharts;
