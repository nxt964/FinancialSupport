import sys
import os
import json
from datetime import datetime

import pandas as pd
from backtesting import Backtest, Strategy
from backtesting.lib import crossover
import talib

# ---------------------------------------------------------
# Parse strategy choice from CLI (expects 1..4; defaults to 1)
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

    # Extract metrics
    total_return = float(stats["Return [%]"])
    sharpe_ratio = float(stats["Sharpe Ratio"])
    max_drawdown = float(stats["Max. Drawdown [%]"])
    win_rate = float(stats["Win Rate [%]"])
    total_trades = int(stats["# Trades"])

    # Store results
    results_summary.append({
        "Strategy": name,
        "Return [%]": round(total_return, 2),
        "Sharpe Ratio": round(sharpe_ratio, 3),
        "Max Drawdown [%]": round(max_drawdown, 2),
        "Win Rate [%]": round(win_rate, 2),
        "Total Trades": total_trades
    })

    print(f"SUCCESS: {name}")
    print(f"  Return: {total_return:.2f}%")
    print(f"  Sharpe: {sharpe_ratio:.3f}")
    print(f"  Max DD: {max_drawdown:.2f}%")
    print(f"  Win Rate: {win_rate:.2f}%")
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
        "Return [%]": "ERROR",
        "Sharpe Ratio": "ERROR",
        "Max Drawdown [%]": "ERROR",
        "Win Rate [%]": "ERROR",
        "Total Trades": "ERROR"
    })

# ---------------------------------------------------------
# Final Summary
# ---------------------------------------------------------
print("\n" + "=" * 50)
print("BACKTEST SUMMARY")
print("=" * 50)

summary_df = pd.DataFrame(results_summary)
print(summary_df.to_string(index=False))

# Best strategy (only one here, but keep logic for consistency)
valid_results = [r for r in results_summary if r["Return [%]"] != "ERROR"]
if valid_results:
    best = max(valid_results, key=lambda x: x["Return [%]"])
    print(f"\nBEST STRATEGY: {best['Strategy']}")
    print(f"Return: {best['Return [%]']}%")

# Save summary
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
csv_file = f"plots/summary_{timestamp}.csv"
summary_df.to_csv(csv_file, index=False)
print(f"\nSummary saved: {csv_file}")
print("Charts saved in: plots/")
print("\nBacktest completed!")
