import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .routers import auth as auth_router
from .routers import fitness as fitness_router
from .routers import chat as chat_router

app = FastAPI(title="fitness-life api")

origins_env = os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://localhost:3001")
frontend_origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}


app.include_router(auth_router.router)
app.include_router(fitness_router.router)
app.include_router(chat_router.router)
