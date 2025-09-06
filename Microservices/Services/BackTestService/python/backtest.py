import sys
import os
import json
from datetime import datetime
import math

import pandas as pd
from backtesting import Backtest, Strategy
from backtesting.lib import crossover
import talib

# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
def parse_choice() -> int:
    choice = 0
    if len(sys.argv) > 1:
        try:
            choice = int(sys.argv[1])
        except Exception:
            print("Invalid argument, defaulting to 1")
            choice = 1
    if choice not in (1, 2, 3, 4):
        print(f"Invalid choice {choice}, defaulting to 1")
        choice = 1
    return choice


def safe_float(val):
    """Convert to float if valid, else None"""
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return None
        return f
    except Exception:
        return None


choice = parse_choice()

# ---------------------------------------------------------
# Paths & setup
# ---------------------------------------------------------
print("Python received arguments:", sys.argv)
os.makedirs("plots", exist_ok=True)

print("Starting Automated Backtesting...")
print("=" * 50)

data_file = "/app/data/candles.json"
print(f"Loading data from: {data_file}")

# ---------------------------------------------------------
# Load JSON data
# ---------------------------------------------------------
try:
    with open(data_file, "r") as f:
        raw_data = json.load(f)
    print(f"SUCCESS: Loaded {len(raw_data)} candle records")
except Exception as e:
    print(f"ERROR: Could not load data file: {e}")
    sys.exit(1)

# ---------------------------------------------------------
# Convert to DataFrame & clean
# ---------------------------------------------------------
df = pd.DataFrame(raw_data)
print(f"DataFrame created with {len(df)} rows")

# Convert time and set index
df['Date'] = pd.to_datetime(df['openTime'])
df.set_index('Date', inplace=True)

# Rename columns for backtesting
df.rename(columns={
    'open': 'Open',
    'high': 'High',
    'low': 'Low',
    'close': 'Close',
    'volume': 'Volume'
}, inplace=True)

# Keep only OHLCV columns and convert to numeric
df = df[['Open', 'High', 'Low', 'Close', 'Volume']]
for col in df.columns:
    df[col] = pd.to_numeric(df[col], errors='coerce')

# Clean data
initial_rows = len(df)
df.dropna(inplace=True)
final_rows = len(df)

print(f"Data cleaned: {initial_rows} -> {final_rows} rows")
print(f"Date range: {df.index.min()} to {df.index.max()}")
print("=" * 50)

# ---------------------------------------------------------
# Strategy Classes
# ---------------------------------------------------------
class MA30MA90(Strategy):
    ma_short = 10
    ma_long = 30
    def init(self):
        self.short_ma = self.I(talib.SMA, self.data.Close, self.ma_short)
        self.long_ma = self.I(talib.SMA, self.data.Close, self.ma_long)
    def next(self):
        if crossover(self.short_ma, self.long_ma):
            if self.position.is_short:
                self.position.close()
            self.buy()
        elif crossover(self.long_ma, self.short_ma):
            if self.position.is_long:
                self.position.close()
            self.sell()

class RSI_Strategy(Strategy):
    rsi_window = 14
    upper_bound = 70
    lower_bound = 30
    def init(self):
        self.rsi = self.I(talib.RSI, self.data.Close, self.rsi_window)
    def next(self):
        if crossover(self.rsi, self.upper_bound):
            if self.position.is_long:
                self.position.close()
            self.sell()
        elif crossover(self.lower_bound, self.rsi):
            if self.position.is_short:
                self.position.close()
            self.buy()

class MACD_Strategy(Strategy):
    fastperiod = 12
    slowperiod = 26
    signalperiod = 9
    def init(self):
        macd, signal, _ = talib.MACD(self.data.Close,
                                     fastperiod=self.fastperiod,
                                     slowperiod=self.slowperiod,
                                     signalperiod=self.signalperiod)
        self.macd = self.I(lambda: macd)
        self.signal = self.I(lambda: signal)
    def next(self):
        if crossover(self.macd, self.signal):
            if self.position.is_short:
                self.position.close()
            self.buy()
        elif crossover(self.signal, self.macd):
            if self.position.is_long:
                self.position.close()
            self.sell()

class MA50MA200(Strategy):
    ma_short = 50
    ma_long = 200
    def init(self):
        self.short_ma = self.I(talib.SMA, self.data.Close, self.ma_short)
        self.long_ma = self.I(talib.SMA, self.data.Close, self.ma_long)
    def next(self):
        if crossover(self.short_ma, self.long_ma):
            if self.position.is_short:
                self.position.close()
            self.buy()
        elif crossover(self.long_ma, self.short_ma):
            if self.position.is_long:
                self.position.close()
            self.sell()

# ---------------------------------------------------------
# Strategy selection (1..4)
# ---------------------------------------------------------
strategies_map = {
    1: ("MA30-MA90", MA30MA90),
    2: ("RSI", RSI_Strategy),
    3: ("MACD", MACD_Strategy),
    4: ("MA50-MA200", MA50MA200),
}

name, strategy_class = strategies_map[choice]
print(f"Selected Strategy [{choice}]: {name}")

# ---------------------------------------------------------
# Run backtest
# ---------------------------------------------------------
results_summary = []
try:
    bt = Backtest(df, strategy_class, cash=10000, finalize_trades=True)
    stats = bt.run()

    # Extract metrics safely
    total_return = safe_float(stats.get("Return [%]"))
    sharpe_ratio = safe_float(stats.get("Sharpe Ratio"))
    max_drawdown = safe_float(stats.get("Max. Drawdown [%]"))
    win_rate = safe_float(stats.get("Win Rate [%]"))
    total_trades = int(stats.get("# Trades", 0))

    # Store results
    results_summary.append({
        "Strategy": name,
        "Return [%]": round(total_return, 2) if total_return is not None else None,
        "Sharpe Ratio": round(sharpe_ratio, 3) if sharpe_ratio is not None else None,
        "Max Drawdown [%]": round(max_drawdown, 2) if max_drawdown is not None else None,
        "Win Rate [%]": round(win_rate, 2) if win_rate is not None else None,
        "Total Trades": total_trades
    })

    print(f"SUCCESS: {name}")
    print(f"  Return: {total_return if total_return is not None else 'N/A'}")
    print(f"  Sharpe: {sharpe_ratio if sharpe_ratio is not None else 'N/A'}")
    print(f"  Max DD: {max_drawdown if max_drawdown is not None else 'N/A'}")
    print(f"  Win Rate: {win_rate if win_rate is not None else 'N/A'}")
    print(f"  Trades: {total_trades}")

    # Save chart (delete if exists)
    filename = f"plots/chart.html"
    if os.path.exists(filename):
        os.remove(filename)
        print(f"Deleted old chart: {filename}")
    bt.plot(filename=filename)
    print(f"  Chart: {filename}")

except Exception as e:
    print(f"ERROR: {name} failed - {e}")
    results_summary.append({
        "Strategy": name,
        "Return [%]": None,
        "Sharpe Ratio": None,
        "Max Drawdown [%]": None,
        "Win Rate [%]": None,
        "Total Trades": None
    })

# ---------------------------------------------------------
# Final Summary
# ---------------------------------------------------------
print("\n" + "=" * 50)
print("BACKTEST SUMMARY")
print("=" * 50)

summary_df = pd.DataFrame(results_summary)
print(summary_df.to_string(index=False))

# Save summary JSON (remove best strategy logic)
result = results_summary[0] if results_summary else {
    "Strategy": name,
    "Return [%]": None,
    "Sharpe Ratio": None,
    "Max Drawdown [%]": None,
    "Win Rate [%]": None,
    "Total Trades": None
}

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
json_file = f"plots/summary.json"
with open(json_file, "w") as f:
    json.dump(result, f, indent=4, allow_nan=False)

print(f"\nSummary saved: {json_file}")
print("Charts saved in: plots/")
print("\nBacktest completed!")
