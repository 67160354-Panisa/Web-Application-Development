from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import UserOut, UserUpdate
from ..security import get_current_user

router = APIRouter(tags=["User Management"])

@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.get("/users")
def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    total = db.query(User).count()
    items = db.query(User).offset((page - 1) * limit).limit(limit).all()
    return {"page": page, "limit": limit, "total": total, "items": [UserOut.model_validate(x) for x in items]}

@router.put("/users/{user_id}", response_model=UserOut)
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(403, "You can only edit your own profile")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    values = data.model_dump(exclude_unset=True)
    if "username" in values:
        exists = db.query(User).filter(User.username == values["username"], User.id != user_id).first()
        if exists:
            raise HTTPException(400, "Username already exists")
    if "email" in values:
        exists = db.query(User).filter(User.email == values["email"], User.id != user_id).first()
        if exists:
            raise HTTPException(400, "Email already exists")
        values["email"] = values["email"].lower()
    for key, value in values.items():
        setattr(user, key, value)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.id != user_id:
        raise HTTPException(403, "You can only delete your own account")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}

@router.get("/check-username/{name}")
def check_username(name: str, db: Session = Depends(get_db)):
    exists = db.query(User).filter(User.username == name).first() is not None
    return {"username": name, "available": not exists}
