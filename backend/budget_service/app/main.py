import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from app.api.routes import budgets
from app.db.base import Base
from app.db.session import engine
from app.db import models  # noqa: F401
from app.core.logging import get_logger

Base.metadata.create_all(bind=engine)

logger = get_logger("budget_service")

app = FastAPI(title="Budget Service")

Instrumentator().instrument(app).expose(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.perf_counter()
    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        level = "warning" if response.status_code >= 400 else "info"
        getattr(logger, level)(
            f"{request.method} {request.url.path} → {response.status_code}",
            extra={"method": request.method, "path": request.url.path,
                   "status": response.status_code, "duration_ms": duration_ms},
        )
        return response
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        logger.error(
            f"{request.method} {request.url.path} → 500 (unhandled exception)",
            exc_info=exc,
            extra={"method": request.method, "path": request.url.path,
                   "status": 500, "duration_ms": duration_ms},
        )
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(budgets.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to Budget Service"}


@app.get("/health")
def health():
    return {"status": "ok"}
