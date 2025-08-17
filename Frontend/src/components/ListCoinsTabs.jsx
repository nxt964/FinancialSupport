import { useState } from "react";
import ListCoins from "./charts/ListCoins";

export default function ListCoinsTabs({isLoading, tabLabels, tabData}){
    const [activeTab, setActiveTab] = useState(tabLabels[0]);

    return (
        <div className="flex-1 flex flex-col gap-2 p-2 bg-[var(--color-ChartBg)] rounded-lg min-h-0 w-full border border-[var(--color-Line)]">
            <div className="flex gap-0.5 rounded-lg border-b border-x border-[var(--color-Line)]!">
                <button
                    className={`flex-1 px-2 py-1 border-y-0! border-l-0! border-[var(--color-Line)]!  ${activeTab === tabLabels[0] ? "bg-[var(--color-InputLine)]!" : "bg-transparent!"}`}
                    onClick={() => setActiveTab(tabLabels[0])}
                >
                    {tabLabels[0]}
                </button>
                <button
                    className={`flex-1 px-2 py-1 border-y-0! border-r-0! border-[var(--color-Line)]! ${activeTab === tabLabels[1] ? "bg-[var(--color-InputLine)]!" : "bg-transparent!"}`}
                    onClick={() => setActiveTab(tabLabels[1])}
                >
                    {tabLabels[1]}
                </button>
            </div>
            <div className="flex-1 min-h-0">
                {activeTab === tabLabels[0] && <ListCoins isLoading={isLoading} listCoins={tabData[0]} />}
                {activeTab === tabLabels[1] && <ListCoins isLoading={isLoading} listCoins={tabData[1]} />}
            </div>
        </div>
    );
}