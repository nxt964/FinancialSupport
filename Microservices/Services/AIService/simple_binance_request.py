import requests
import json


def get_binance_data(symbol="BTCUSDT", interval="1h", limit=1000):
    """Get raw candle data from Binance API"""
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()


def predict_price(symbol="BTCUSDT", interval="1h"):
    """Get Binance data and predict next price"""
    print(f"Fetching {symbol} data...")
    candles = get_binance_data(symbol, interval, 1000)

    prediction_data = {
        "symbol": symbol,
        "candles": candles
    }

    print("Making prediction...")
    try:
        response = requests.post(
            "http://localhost:8000/predict",
            json=prediction_data
        )

        if response.status_code == 200:
            result = response.json()
            current_price = float(candles[-1][4])  # correct index
            predicted_price = result["predicted_close"]
            change_pct = ((predicted_price - current_price) /
                          current_price) * 100

            print(f"\n=== {symbol} Prediction ===")
            print(f"Current Price: ${current_price:.4f}")
            print(f"Predicted Price: ${predicted_price:.4f}")
            print(f"Expected Change: {change_pct:+.2f}%")
            print(f"Confidence: {result['confidence_score']:.2f}")

            return result
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            return None

    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None


def generate_curl():
    """Generate CURL command with real Binance data"""
    candles = get_binance_data("BTCUSDT", "1h", 1000)

    curl_data = {
        "symbol": "BTCUSDT",
        "candles": candles
    }

    with open("btc_data.json", "w") as f:
        json.dump(curl_data, f)

    print("✅ Data saved to btc_data.json")
    print("\n💡 CURL command:")
    print("curl -X POST 'http://localhost:8000/predict' \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d @btc_data.json")


if __name__ == "__main__":
    # Simple prediction
    predict_price("BTCUSDT", "1h")

    # Or generate CURL data
    # generate_curl()
