# main entry point; ties db, models and API routes together into a single running app
# fastapi app creation, router registration, startup hooks, health checks
# this file shouldn't have business logic, query code, or auth rules

import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from prometheus_fastapi_instrumentator import Instrumentator
from app.api.routes import auth, users
from app.db.base import Base
from app.db.session import engine
from app.core.logging import get_logger

Base.metadata.create_all(bind=engine)

logger = get_logger("user_service")

app = FastAPI(title="User Service")

Instrumentator().instrument(app).expose(app)

# CORS must be added before routers so it fires on every response,
# including error responses. If added after, a 500 will have no
# Access-Control-Allow-Origin header and the browser reports a CORS error
# instead of the real error.
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
            extra={
                "method":      request.method,
                "path":        request.url.path,
                "status":      response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        logger.error(
            f"{request.method} {request.url.path} → 500 (unhandled exception)",
            exc_info=exc,
            extra={
                "method":      request.method,
                "path":        request.url.path,
                "status":      500,
                "duration_ms": duration_ms,
            },
        )
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(auth.router)
app.include_router(users.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to User service"}


@app.get("/health")
def health():
    return {"status": "ok"}
