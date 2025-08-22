from fastapi import FastAPI
from api.endpoints import router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Stock Price Prediction API",
    description="Predicts next closing price using historical candle data and optional sentiment",
    version="1.0.0"
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "message": "Stock Price Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "/predict": "POST - Predict next closing price",
            "/health": "GET - Health check",
            "/docs": "GET - API documentation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
