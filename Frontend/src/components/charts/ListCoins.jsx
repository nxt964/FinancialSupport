import { memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../Spinner";

function ListCoins({isLoading, listCoins }) {
  const { interval } = useParams();
  const navigate = useNavigate();
  return (
    <div className="w-full h-full flex flex-col gap-1 text-sm">
        <div className="flex items-center py-1 px-2 text-sm text-[var(--color-TertiaryText)] border-b border-[var(--color-Line)]">
            <div className="flex-1/3">Coin</div>
            <div className="flex-1/3 text-right">Last Price</div>
            <div className="flex-1/3 text-right">Change</div>
        </div>

        <div className="custom-scrollbar overflow-auto flex-1 min-h-0">
            { isLoading ? (
                <Spinner/>
            ) : (
                <div className="flex flex-col">
                    {listCoins.map((coin, idx) => {
                        const change = parseFloat(coin.priceChangePercent);
                        const isPositive = change > 0;

                        return (
                        <div
                            key={idx}
                            className="flex w-full items-center px-2 py-1 hover:bg-[var(--color-InputLine)] rounded cursor-pointer"
                            onClick={() => {navigate(`/chart/${coin.symbol}/${interval ?? "1m"}`)}}
                        >
                            {/* Cột 1: Tên coin */}
                            <div className="flex-1/3 font-semibold text-[var(--color-PrimaryColor)]">{coin.baseAsset}
                                <span className="text-xs font-light text-[var(--color-TertiaryText)]"> / {coin.quoteAsset}</span>
                            </div>

                            {/* Cột 2: Giá */}
                            <div className="flex-1/3 text-right">{coin.price}</div>

                            {/* Cột 3: % thay đổi */}
                            <div
                            className={`flex-1/3 text-right ${
                                change >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                            >
                            {isPositive ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
                            </div>
                        </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );
}

export default memo(ListCoins);
