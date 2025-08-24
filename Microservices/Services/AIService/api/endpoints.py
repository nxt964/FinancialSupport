from fastapi import APIRouter, HTTPException
import logging
from models.schemas import PredictionRequest, PredictionResponse, CandleData
from models.predictor import StockPredictor

logger = logging.getLogger(__name__)
router = APIRouter()
predictor = StockPredictor()


@router.post("/predict", response_model=PredictionResponse)
async def predict_next_close(request: PredictionRequest):
    try:
        if len(request.candles) < 100:
            raise HTTPException(
                status_code=400, detail="Minimum 100 candles required")

        candles = [
            CandleData(
                timestamp=int(item[0]),
                open=float(item[1]),
                high=float(item[2]),
                low=float(item[3]),
                close=float(item[4]),
                volume=float(item[5])
            )
            for item in request.candles
        ]

        sorted_candles = sorted(candles, key=lambda x: x.timestamp)
        predicted_close, confidence, features_used = predictor.predict(
            sorted_candles, request.sentiment)

        return PredictionResponse(
            predicted_close=round(predicted_close, 4),
            confidence_score=round(confidence, 4),
            model_version="1.0.0",
            features_used=features_used[:10],
            symbol=request.symbol
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Internal server error during prediction")


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_trained": predictor.is_trained,
        "version": "1.0.0"
    }
