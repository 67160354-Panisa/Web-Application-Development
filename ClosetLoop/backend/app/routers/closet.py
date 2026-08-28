from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import ClosetItem, User
from ..schemas import ClosetCreate, ClosetOut
from ..security import get_current_user

router = APIRouter(prefix="/closet", tags=["Virtual Closet"])

@router.get("", response_model=list[ClosetOut])
def list_closet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ClosetItem).filter(ClosetItem.owner_id == current_user.id).order_by(ClosetItem.created_at.desc()).all()

@router.get("/{item_id}", response_model=ClosetOut)
def get_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.get(ClosetItem, item_id)
    if not item or item.owner_id != current_user.id:
        raise HTTPException(404, "Closet item not found")
    return item

@router.post("", response_model=ClosetOut)
def create_item(data: ClosetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = ClosetItem(owner_id=current_user.id, **data.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/{item_id}", response_model=ClosetOut)
def update_item(item_id: int, data: ClosetCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.get(ClosetItem, item_id)
    if not item or item.owner_id != current_user.id:
        raise HTTPException(404, "Closet item not found")
    for key, value in data.model_dump().items():
        setattr(item, key, value)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.get(ClosetItem, item_id)
    if not item or item.owner_id != current_user.id:
        raise HTTPException(404, "Closet item not found")
    if item.product:
        raise HTTPException(400, "Remove the marketplace listing before deleting this item")
    db.delete(item)
    db.commit()
    return {"message": "Closet item deleted"}
