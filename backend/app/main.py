from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .database import Base, engine
from . import models
from .routers import auth, users, closet, marketplace, outfits, orders

# สร้างโฟลเดอร์เก็บรูปถ้ายังไม่มี
os.makedirs("uploads", exist_ok=True)

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

# เปิดให้หน้าเว็บเข้ามาโหลดรูปในโฟลเดอร์ uploads ได้
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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