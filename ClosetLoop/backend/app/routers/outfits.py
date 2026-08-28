from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ClosetItem, User
from ..security import get_current_user
import random

router = APIRouter(prefix="/outfits", tags=["AI Outfit"])

class OutfitRequest(BaseModel):
    occasion: str
    style: str
    weather: str

@router.post("/generate")
def generate_outfit(data: OutfitRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(ClosetItem).filter(ClosetItem.user_id == current_user.id).all()
    if not items:
        raise Exception("เพิ่มเสื้อผ้าใน My Closet ก่อนน้า")
    
    # AI จำลอง: แยกประเภทเสื้อ และ ท่อนล่าง
    tops = [i for i in items if i.category == "top"]
    bottoms = [i for i in items if i.category in ["bottom", "dress"]]
    
    selected = []
    if tops: selected.append(random.choice(tops))
    if bottoms: selected.append(random.choice(bottoms))
    if not selected: selected = [random.choice(items)] # ถ้าไม่มีท่อนบน/ล่างเลย ให้สุ่มอะไรก็ได้มา 1 ชิ้น

    return {
        "items": [{"id": i.id, "name": i.name, "category": i.category, "color": i.color, "image_url": i.image_url} for i in selected],
        "tip": f"แมตช์ลุคโทนสีเหลือง-ฟ้ากับกลิตเตอร์สไตล์ {data.style} พร้อมลุย {data.occasion} ในวันที่อากาศ {data.weather} ค่ะ ✨"
    }