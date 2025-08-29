import { createContext, useContext, useEffect, useState } from "react";
import { AuthContextProvider } from "./AuthContext";
import { SignalRContextProvider } from "./SignalRContext";
import { ApolloProvider } from "@apollo/client";
import { apollo } from "../lib/apollo";
import { httpClient } from "../utils/httpClient";

const AppDataContext = createContext(null);

export const AppDataContextProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'theme-dark';
    });
    
    const [charts, setCharts] = useState([]);

    return (
        <AppDataContext.Provider value=
            {{ 
                charts, setCharts,
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