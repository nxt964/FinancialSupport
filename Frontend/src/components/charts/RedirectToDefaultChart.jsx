import { Navigate } from "react-router-dom";

export default function RedirectToDefaultChart() {
    return (
        <Navigate to="/chart/BTCUSDT/1m" replace />
    );
}