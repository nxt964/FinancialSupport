import { createContext, useContext, useEffect, useState } from "react";
import { httpClient } from "../utils/httpClient";
import { useAuth } from "./AuthContext";

const AppDataContext = createContext(null);

export const AppDataContextProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'theme-dark';
    });
    
    const [charts, setCharts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuth();

    useEffect(() => {
        const fetchFollowedCharts = async () => {
            try {
                setIsLoading(true);
                const res = await httpClient.get(import.meta.env.VITE_API_FOLLOWED_CHARTS);
                const data = await res.json();
                setCharts(data.result.subscriptions || [])
            } catch (err) {
                console.error("Failed to load followed charts: ", err);
            } finally {
                setIsLoading(false);
            }
        }

        if (user !== null) {
            fetchFollowedCharts();
        } else {
            setCharts([])
        }

    }, [user])

    return (
        <AppDataContext.Provider value=
            {{ 
                charts, setCharts, isLoading,
                theme, setTheme
            }}>
            {children}
        </AppDataContext.Provider>
    );
};

export const useAppData = () => useContext(AppDataContext);