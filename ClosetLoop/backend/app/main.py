from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from . import models
from .routers import auth, users, closet, marketplace, outfits, orders

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ClosetLoop API",
    version="1.0.0",
    description="REST API for ClosetLoop: Virtual Closet, AI Outfit Matching and Marketplace"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(closet.router)
app.include_router(outfits.router)
app.include_router(marketplace.router)
app.include_router(orders.router)

@app.get("/")
def root():
    return {"name": "ClosetLoop API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "OK"}
