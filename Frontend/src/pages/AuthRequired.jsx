import { faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function AuthRequired() {
    const navigate = useNavigate();

    const location = useLocation();

    // Map path -> feature name
    const featureMap = {
        "/multi-charts": "Multi-Charts",
        "/backtest": "Backtest",
    };

    const featureName = featureMap[location.state.from] || "";

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <FontAwesomeIcon icon={faLock} className="text-[var(--color-PrimaryColor)] text-8xl mb-4"/>
                <h2 className="text-4xl font-bold mb-2">
                    The
                    <span className="text-[var(--color-PrimaryColor)] mx-2.5">{featureName}</span> 
                    Feature Is Available For Registered Users Only
                </h2>
                <h2 className="text-xl font-bold mb-4 text-[var(--color-SecondaryText)]">
                    Please Login to continue!
                </h2>
                <button
                    onClick={() => navigate('/auth/login')}
                    className="px-4 py-2 rounded-lg hover:scale-105 hover:opacity-80"
                >
                    Go to Login
                </button>
            </div>
        </div>
    );
}