from fastapi import FastAPI
from api.endpoints import router
import logging
import os
from dotenv import load_dotenv
import ssl

# Load environment variables from .env file
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Stock Price Prediction API",
    description="Predicts next closing price using historical candle data and optional sentiment",
    version=os.getenv("MODEL_VERSION", "1.0.0")
)

app.include_router(router)


@app.get("/")
async def root():
    return {
        "message": "Stock Price Prediction API",
        "version": os.getenv("MODEL_VERSION", "1.0.0"),
        "endpoints": {
            "/predict": "POST - Predict next closing price",
            "/health": "GET - Health check",
            "/docs": "GET - API documentation"
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment variables
    HOST = os.getenv("HOST", "0.0.0.0")
    HTTP_PORT = int(os.getenv("HTTP_PORT", "8000"))
    HTTPS_PORT = int(os.getenv("HTTPS_PORT", "8001"))
    RELOAD = os.getenv("RELOAD", "false").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "info")
    
    # SSL configuration
    SSL_KEYFILE = os.getenv("SSL_KEYFILE", "./certs/server-key.pem")
    SSL_CERTFILE = os.getenv("SSL_CERTFILE", "./certs/server-cert.pem")
    SSL_PASSWORD = os.getenv("SSL_PASSWORD", "password")
    
    logger.info(f"Starting AIService on {HOST}")
    logger.info(f"HTTP Port: {HTTP_PORT}")
    logger.info(f"HTTPS Port: {HTTPS_PORT}")
    logger.info(f"Reload mode: {RELOAD}")
    logger.info(f"Log level: {LOG_LEVEL}")
    
    # Check if certificates exist
    if os.path.exists(SSL_KEYFILE) and os.path.exists(SSL_CERTFILE):
        logger.info("SSL certificates found - starting with HTTPS support")
        # Start with HTTPS
        uvicorn.run(
            "main:app", 
            host=HOST, 
            port=HTTPS_PORT, 
            reload=RELOAD, 
            log_level=LOG_LEVEL,
            ssl_keyfile=SSL_KEYFILE,
            ssl_certfile=SSL_CERTFILE
        )
    else:
        logger.warning("SSL certificates not found - starting HTTP only")
        # Fallback to HTTP
        uvicorn.run(
            "main:app", 
            host=HOST, 
            port=HTTP_PORT, 
            reload=RELOAD, 
            log_level=LOG_LEVEL
        )
