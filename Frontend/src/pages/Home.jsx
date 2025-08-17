import { useEffect, useState } from "react";
import { httpClient } from "../utils/httpClient";
import ListCoins from "../components/charts/ListCoins";
import ListCoinsTabs from "../components/ListCoinsTabs";

export default function Home() {
    const [topTrading, setTopTrading] = useState([]);
    const [topVolume, setTopVolume] = useState([]);
    const [topGainers, setTopGainers] = useState([]);
    const [topLosers, setTopLosers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const resHotTrading = await httpClient.get(import.meta.env.VITE_API_BINANCE_HOT_TRADING);
                setTopTrading(await resHotTrading.json());

                const resTopVolume = await httpClient.get(import.meta.env.VITE_API_BINANCE_TOP_VOLUME);
                setTopVolume(await resTopVolume.json());

                const resTopGainers = await httpClient.get(import.meta.env.VITE_API_BINANCE_TOP_GAINERS);
                setTopGainers(await resTopGainers.json());

                const resTopLosers = await httpClient.get(import.meta.env.VITE_API_BINANCE_TOP_LOSERS);
                setTopLosers(await resTopLosers.json());
                
                setTimeout(() => {
                    setIsLoading(false);
                }, 200);
            } catch (err) {
                console.error("Failed to load hot symbols", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="px-4 py-2 flex gap-2 h-full w-full">
            {/* Top List Coins */}
            <div className="flex flex-col gap-2 w-[24%]">
                {/* Top Trading & Volumn */}
                <ListCoinsTabs isLoading={isLoading} tabLabels={["Top Trading", "Top Volume"]} tabData={[topTrading, topVolume]}/>

                {/* Top Gainers & Losers */}
                <ListCoinsTabs isLoading={isLoading} tabLabels={["Top Gainers", "Top Losers"]} tabData={[topGainers, topLosers]}/>
                
            </div>

            {/* Slogan & News */}
            <div className="flex-1">
                {/* nội dung khác */}
            </div>
        </div>
    );
}
