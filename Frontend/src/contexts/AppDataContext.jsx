import { createContext, useContext, useEffect, useState } from "react";
import { AuthContextProvider } from "./AuthContext";
import { SignalRContextProvider } from "./SignalRContext";
import { ApolloProvider } from "@apollo/client";
import { apollo } from "../lib/apollo";

const AppDataContext = createContext(null);

export const AppDataContextProvider = ({ children }) => {

    const [charts, setCharts] = useState(() => {
        const saved = localStorage.getItem("charts");
        return saved ? JSON.parse(saved) : [];
    });
    const addChart = (newSymbol="", newInterval="") => {
        const newId = charts.length + 1;
        setCharts([...charts, { id: newId, symbol: newSymbol, interval: newInterval }]);
    };
    const removeChart = (id) => {
        setCharts(charts.filter(c => c.id !== id));
    };
    const updateChart = (id, key, value) => {
        setCharts(charts.map(c => c.id === id ? { ...c, [key]: value } : c));
    };
    useEffect(() => {
        localStorage.setItem("charts", JSON.stringify(charts));
    }, [charts]);


    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'theme-dark';
    });

    return (
        <AppDataContext.Provider value=
            {{ 
                charts, setCharts, addChart, removeChart, updateChart,
                theme, setTheme
            }}>
            <AuthContextProvider>
                <SignalRContextProvider>
                    <ApolloProvider client={apollo}>
                        {children}
                    </ApolloProvider>
                </SignalRContextProvider>
            </AuthContextProvider>
        </AppDataContext.Provider>
    );
};

export const useAppData = () => useContext(AppDataContext);