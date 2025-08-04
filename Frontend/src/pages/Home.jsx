import TradingView from "../components/TradingView";

export default function Home() {
    return (
        <div className="p-4 flex flex-col gap-2" >
            <h1>Homepage</h1>
            <TradingView/>
        </div>
    )
}