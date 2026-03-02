import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from .db import Base, engine
from .limiter import limiter
from .routers import auth as auth_router
from .routers import fitness as fitness_router
from .routers import chat as chat_router
from .routers import catalog as catalog_router

app = FastAPI(title="fitness-life api")

env_name = os.getenv("ENVIRONMENT", "development")
origins_env = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:3001")
if env_name != "development" and not os.getenv("FRONTEND_ORIGINS"):
    raise RuntimeError("FRONTEND_ORIGINS must be set in production")

frontend_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"detail": "Muitas tentativas. Tente novamente mais tarde."})


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router.router)
app.include_router(fitness_router.router)
app.include_router(chat_router.router)
app.include_router(catalog_router.router)  # Public catalog - no auth required
app.include_router(catalog_router.router)

