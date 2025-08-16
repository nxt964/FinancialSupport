import { createContext, useContext, useState } from "react";
import { AuthContextProvider } from "./AuthContext";
import { SignalRContextProvider } from "./SignalRContext";
import { ApolloProvider } from "@apollo/client";
import { apollo } from "../lib/apollo";

const AppDataContext = createContext(null);

export const AppDataContextProvider = ({ children }) => {
    const [charts, setCharts] = useState([
        { id: 1, symbol: '', interval: '' },
    ]);

    const [hotSymbols, setHotSymbols] = useState([]);

    return (
        <AppDataContext.Provider value=
            {{ 
                charts, setCharts,
                hotSymbols, setHotSymbols,
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