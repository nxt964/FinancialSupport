from backtesting import Backtest, Strategy
from backtesting.test import GOOG
from backtesting.lib import crossover
import talib

# ====== Các chiến lược ======
class MA30MA90(Strategy):
    ma_short = 30
    ma_long = 90
    def init(self):
        self.short_ma = self.I(talib.SMA, self.data.Close, self.ma_short)
        self.long_ma = self.I(talib.SMA, self.data.Close, self.ma_long)
    def next(self):
        if crossover(self.short_ma, self.long_ma):
            self.position.close()
            self.buy()
        elif crossover(self.long_ma, self.short_ma):
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
            if not self.position.is_long:
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
            self.position.close()
            self.buy()
        elif crossover(self.signal, self.macd):
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
            self.position.close()
            self.buy()
        elif crossover(self.long_ma, self.short_ma):
            self.position.close()
            self.sell()

# ====== Menu ======
strategies = {
    "1": ("MA30–MA90", MA30MA90),
    "2": ("RSI", RSI_Strategy),
    "3": ("MACD", MACD_Strategy),
    "4": ("MA50–MA200", MA50MA200),
}

while True:
    print("\nChọn chiến lược backtest:")
    for k, (name, _) in strategies.items():
        print(f"{k}. {name}")
    print("0. Thoát")

    choice = input("Nhập số: ").strip()

    if choice == "0":
        print("Thoát chương trình.")
        break

    if choice in strategies:
        name, strategy_class = strategies[choice]
        print(f"\n=== Chạy backtest cho chiến lược: {name} ===")
        bt = Backtest(GOOG, strategy_class, cash=10000)
        stats = bt.run()
        print(stats)
        bt.plot()
    else:
        print("Lựa chọn không hợp lệ!")
