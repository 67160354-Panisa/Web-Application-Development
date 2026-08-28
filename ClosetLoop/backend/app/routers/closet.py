from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import uuid
import os
from ..database import get_db
from ..models import ClosetItem, User
from ..schemas import ClosetItemOut
from ..security import get_current_user

router = APIRouter(prefix="/closet", tags=["My Closet"])

@router.get("", response_model=List[ClosetItemOut])
def get_closet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ClosetItem).filter(ClosetItem.user_id == current_user.id).all()

@router.post("", response_model=ClosetItemOut)
def add_piece(
    name: str = Form(...),
    category: str = Form(...),
    color: str = Form(...),
    size: str = Form(...),
    style: str = Form(...),
    condition: str = Form(...),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = ""
    if image:
        ext = image.filename.split('.')[-1]
        filename = f"{uuid.uuid4()}.{ext}"
        file_path = f"uploads/{filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
            
        image_url = f"http://localhost:8000/uploads/{filename}"

    item = ClosetItem(
        name=name,
        category=category,
        color=color,
        size=size,
        style=style,
        condition=condition,
        image_url=image_url,
        user_id=current_user.id
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_piece(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(ClosetItem).filter(ClosetItem.id == item_id, ClosetItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="ไม่พบเสื้อผ้าชิ้นนี้")
    db.delete(item)
    db.commit()
    return {"message": "ลบเสื้อผ้าเรียบร้อยแล้ว"}