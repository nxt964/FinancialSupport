import { useEffect, useState } from "react";
import { httpClient } from "../utils/httpClient";
import ListCoins from "../components/charts/ListCoins";
import ListCoinsTabs from "../components/ListCoinsTabs";
import { apollo } from "../lib/apollo";
import { FEATURED_NEWS } from "../queries/featuredNews";
import { ArticleCardHomepage } from "../components/news/ArticleCardHomepage";
import ArticleHomepageSkeleton from "../components/skeletons/ArticleHomepageSkeleton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnglesRight } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

export default function Home() {
    const [topSymbols, setTopSymbols] = useState({
        topTrading: [],
        topVolume: [],
        topGainers: [],
        topLosers: [],
    });
    const [loadingSymbols, setLoadingSymbols] = useState(false);

    // Fetch top symbols
    useEffect(() => {
        const fetchSymbolsData = async () => {
            try {
                setLoadingSymbols(true);
                const [resHotTrading, resTopVolume, resTopGainers, resTopLosers] = await Promise.all([
                    httpClient.get(import.meta.env.VITE_API_BINANCE_HOT_TRADING),
                    httpClient.get(import.meta.env.VITE_API_BINANCE_TOP_VOLUME),
                    httpClient.get(import.meta.env.VITE_API_BINANCE_TOP_GAINERS),
                    httpClient.get(import.meta.env.VITE_API_BINANCE_TOP_LOSERS),
                ]);

                setTopSymbols({
                    topTrading: await resHotTrading.json(),
                    topVolume: await resTopVolume.json(),
                    topGainers: await resTopGainers.json(),
                    topLosers: await resTopLosers.json(),
                });
                setLoadingSymbols(false);
            } catch (err) {
                console.error("Failed to load top symbols", err);
            } finally {
                setLoadingSymbols(false);
            }
        };

        fetchSymbolsData();
    }, []);



    const [loadingNews, setLoadingNews] = useState(false);
    const [news, setNews] = useState([]);

    // Fetch news
    useEffect(() => {
        const fetchNewsData = async () => {
          try {
            setLoadingNews(true);

            let retries = 5;
            let items = [];
            while (retries > 0 && items.length === 0) {
                const page = Math.floor(Math.random() * 10) + 1; 

                const { data } = await apollo.query({
                query: FEATURED_NEWS,
                variables: { page },
                fetchPolicy: "network-only",
                });

                items = data.featuredNews?.items ?? [];
                retries--;
            }

            setNews(items);
            console.log(items);
          } catch (e) {
            console.error(e);
            setNews([]);
          } finally {
            setLoadingNews(false);
          }
        };
        fetchNewsData();
    }, []);


    return (
        <div className="px-4 py-2 flex gap-4 h-full w-full">
            {/* Top List Coins */}
            <div className="flex flex-col gap-2 w-[24%]">
                {/* Top Trading & Volumn */}
                <ListCoinsTabs isLoading={loadingSymbols} tabLabels={["Top Trading", "Top Volume"]} tabData={[topSymbols.topTrading, topSymbols.topVolume]}/>

                {/* Top Gainers & Losers */}
                <ListCoinsTabs isLoading={loadingSymbols} tabLabels={["Top Gainers", "Top Losers"]} tabData={[topSymbols.topGainers, topSymbols.topLosers]}/>
                
            </div>
            
            {/* Slogan & News */}
            <div className="flex-1">
                <div className="flex flex-col h-full">
                    <div className="flex-1 flex">
                        <div className="font-extrabold leading-snug flex flex-col gap-3">
                            <span className="bg-gradient-to-r from-[var(--color-PrimaryColor)] py-3 via-pink-500 to-purple-500 text-transparent text-4xl md:text-7xl bg-clip-text animate-pulse">
                                Trade smart. Stay ahead.
                            </span>
                            <span className="text-[var(--color-TertiaryText)] text-3xl md:text-6xl">
                                Unlock the future of finance with confidence.
                            </span>
                        </div>
                    </div>


                    <div className="flex-2 flex flex-col min-h-0">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold mb-2 text-[var(--color-PrimaryColor)]">What's new today?</h2>
                            <Link to={'/news'} className="text-sm cursor-pointer p-1 text-[var(--color-SecondaryText)] hover:text-[var(--color-PrimaryText)] hover:underline">
                                View all news
                                <FontAwesomeIcon icon={faAnglesRight} className="ml-1 text-xs"/>
                            </Link>
                        </div>
                        <div className="custom-scrollbar flex-1 overflow-y-auto p-2 rounded-lg border border-[var(--color-Line)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {loadingNews
                                ? Array.from({ length: 6 }).map((_, idx) => (
                                    <ArticleHomepageSkeleton key={idx} />
                                ))
                                : news.map((article) => (
                                    <ArticleCardHomepage key={article.id} {...article} />
                            ))}

                            {!loadingNews && (
                                <div className="flex justify-center items-center col-span-2">
                                <Link
                                    to="/news"
                                    className="px-2 py-1 text-sm font-medium rounded-full border-2 border-[var(--color-Line)] hover:bg-[var(--color-PrimaryColor)] transition-all duration-300"
                                >
                                    View all
                                    <FontAwesomeIcon icon={faAnglesRight} className="ml-1 text-xs"/>
                                </Link>
                                </div>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
