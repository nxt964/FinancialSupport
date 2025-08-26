import numpy as np
import pandas as pd
import logging
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import MinMaxScaler
from typing import List, Optional
from models.schemas import CandleData, SentimentData
import warnings

warnings.filterwarnings("ignore")
logger = logging.getLogger(__name__)


class StockPredictor:
    # paste your whole class here as-is
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.is_trained = False
        self.feature_names = []

    def create_technical_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create technical indicators from OHLCV data"""
        # Price-based indicators
        df['price_change'] = df['close'].pct_change()
        df['high_low_pct'] = (df['high'] - df['low']) / df['close']
        df['open_close_pct'] = (df['close'] - df['open']) / df['open']

        # Moving averages
        df['sma_5'] = df['close'].rolling(window=5).mean()
        df['sma_10'] = df['close'].rolling(window=10).mean()
        df['sma_20'] = df['close'].rolling(window=20).mean()
        df['sma_50'] = df['close'].rolling(window=50).mean()

        # Relative Strength Index (RSI)
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        df['rsi'] = 100 - (100 / (1 + rs))

        # Bollinger Bands
        df['bb_middle'] = df['close'].rolling(window=20).mean()
        bb_std = df['close'].rolling(window=20).std()
        df['bb_upper'] = df['bb_middle'] + (bb_std * 2)
        df['bb_lower'] = df['bb_middle'] - (bb_std * 2)
        df['bb_position'] = (df['close'] - df['bb_lower']) / \
            (df['bb_upper'] - df['bb_lower'])

        # Volume indicators
        df['volume_sma'] = df['volume'].rolling(window=20).mean()
        df['volume_ratio'] = df['volume'] / df['volume_sma']

        # Volatility
        df['volatility'] = df['close'].rolling(window=20).std()

        # Price position relative to recent high/low
        df['high_20'] = df['high'].rolling(window=20).max()
        df['low_20'] = df['low'].rolling(window=20).min()
        df['price_position'] = (df['close'] - df['low_20']) / \
            (df['high_20'] - df['low_20'])

        return df

    def prepare_features(self, candles: List[CandleData], sentiment: Optional[List[SentimentData]] = None) -> pd.DataFrame:
        """Prepare features for prediction"""
        # Convert candles to DataFrame
        candle_data = []
        for candle in candles:
            candle_data.append({
                'timestamp': candle.openTime,   # ✅ use OpenTime as timestamp
                'open': candle.open,
                'high': candle.high,
                'low': candle.low,
                'close': candle.close,
                'volume': candle.volume
            })

        df = pd.DataFrame(candle_data)
        df = df.sort_values('timestamp').reset_index(drop=True)

        # Create technical indicators
        df = self.create_technical_indicators(df)

        # Add sentiment data if provided
        if sentiment:
            sentiment_df = pd.DataFrame([{
                'timestamp': s.timestamp,
                'sentiment_score': s.sentiment_score,
                'news_count': s.news_count,
                'social_mentions': s.social_mentions
            } for s in sentiment])

            # Merge sentiment data (forward fill for missing values)
            df = df.merge(sentiment_df, on='timestamp', how='left')
            df[['sentiment_score', 'news_count', 'social_mentions']] = df[[
                'sentiment_score', 'news_count', 'social_mentions']].fillna(method='ffill')
            df[['sentiment_score', 'news_count', 'social_mentions']] = df[[
                'sentiment_score', 'news_count', 'social_mentions']].fillna(0)
        else:
            df['sentiment_score'] = 0
            df['news_count'] = 0
            df['social_mentions'] = 0

        return df

    def create_sequences(self, df: pd.DataFrame, sequence_length: int = 20):
        """Create sequences for time series prediction"""
        feature_columns = [
            'price_change', 'high_low_pct', 'open_close_pct', 'sma_5', 'sma_10', 'sma_20', 'sma_50',
            'rsi', 'bb_position', 'volume_ratio', 'volatility', 'price_position',
            'sentiment_score', 'news_count', 'social_mentions'
        ]

        # Remove rows with NaN values
        df_clean = df[feature_columns + ['close']].dropna()

        if len(df_clean) < sequence_length + 1:
            raise ValueError(
                f"Not enough data points. Need at least {sequence_length + 1}, got {len(df_clean)}")

        X, y = [], []

        for i in range(len(df_clean) - sequence_length):
            X.append(df_clean[feature_columns].iloc[i:i +
                     sequence_length].values.flatten())
            y.append(df_clean['close'].iloc[i+sequence_length])

        return np.array(X), np.array(y), feature_columns

    def train_model(self, df: pd.DataFrame):
        """Train the prediction model"""
        try:
            X, y, feature_names = self.create_sequences(df)
            self.feature_names = feature_names

            # Scale features
            X_scaled = self.scaler.fit_transform(X)

            # Train model
            self.model.fit(X_scaled, y)
            self.is_trained = True

            logger.info(f"Model trained successfully with {len(X)} samples")

        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise

    def predict(self, candles: List[CandleData], sentiment: Optional[List[SentimentData]] = None):
        """Make prediction for next closing price"""
        try:
            df = self.prepare_features(candles, sentiment)

            # If model is not trained, train it with the provided data
            if not self.is_trained:
                logger.info("Training model with provided data...")
                self.train_model(df)

            # Prepare the last sequence for prediction
            X, _, _ = self.create_sequences(df, sequence_length=20)

            if len(X) == 0:
                raise ValueError(
                    "Not enough data to create prediction sequence")

            # Use the last sequence
            last_sequence = X[-1:]
            X_scaled = self.scaler.transform(last_sequence)

            # Make prediction
            prediction = self.model.predict(X_scaled)[0]

            # Calculate confidence score based on feature importance and recent volatility
            feature_importance = self.model.feature_importances_
            confidence = min(
                0.95, max(0.1, 1.0 - df['volatility'].iloc[-20:].mean()))

            features_used = [
                f"{name}_lag_{i}" for name in self.feature_names for i in range(20)]

            return prediction, confidence, features_used

        except Exception as e:
            logger.error(f"Error making prediction: {str(e)}")
            raise
