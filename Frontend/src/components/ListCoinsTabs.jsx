import { useState } from "react";
import ListCoins from "./charts/ListCoins";

export default function ListCoinsTabs({isLoading, tabLabels, tabData}){
    const [activeTab, setActiveTab] = useState(tabLabels[0]);

    return (
        <div className="flex-1 flex flex-col gap-2 p-2 bg-[var(--color-ChartBg)] rounded-lg min-h-0 w-full border border-[var(--color-Line)]">
            <div className="flex gap-0.5 rounded-lg border-b border-[var(--color-Line)]!">
                {tabLabels.map((tab, index) => {
                    return (
                        <button
                            key={index}
                            className={`flex-1 px-2 py-1 border-y-0! border-[var(--color-Line)]!  ${activeTab === tab ? "bg-[var(--color-InputLine)]!" : "bg-transparent!"}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    );
                })}
            </div>
            <div className="flex-1 min-h-0">
                <ListCoins
                    isLoading={isLoading}
                    listCoins={tabData[tabLabels.indexOf(activeTab)]}
                />
            </div>
        </div>
    );
}