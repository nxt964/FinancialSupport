from typing import List, Optional
from pydantic import BaseModel, Field


class CandleData(BaseModel):
    openTime: int
    open: float = Field(..., gt=0)
    high: float = Field(..., gt=0)
    low: float = Field(..., gt=0)
    close: float = Field(..., gt=0)
    volume: float = Field(..., ge=0)
    closeTime: Optional[int] = None

    timestamp: int = Field(0, alias="openTime")


class SentimentData(BaseModel):
    timestamp: int
    sentiment_score: float = Field(..., ge=-1, le=1)
    news_count: int = Field(default=0, ge=0)
    social_mentions: int = Field(default=0, ge=0)


class PredictionRequest(BaseModel):
    candles: List[CandleData] = Field(..., min_items=100, max_items=1000)
    sentiment: Optional[List[SentimentData]] = None
    symbol: str = Field(default="UNKNOWN")


class PredictionResponse(BaseModel):
    predicted_close: float
    confidence_score: float
    model_version: str
    features_used: List[str]
    symbol: str
