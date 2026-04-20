# what this file does -

# main entry point; ties db, models and API routes together into a single running app
# fastapi app creation
# router registration
# startup hooks
# health checks

# this file shouldnt have business logic, query code, auth rules

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import auth, users
from app.db.base import Base
from app.db.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Service")

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

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to User service"}

@app.get("/health")
def health():
    return {"status": "ok"}