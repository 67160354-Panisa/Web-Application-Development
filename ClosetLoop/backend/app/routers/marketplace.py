from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from ..database import get_db
from ..models import Product, ClosetItem, User
from ..security import get_current_user

router = APIRouter(prefix="/products", tags=["Marketplace"])

class ProductCreate(BaseModel):
    closet_item_id: int
    title: str
    description: str
    price: float
    listing_type: str

@router.get("")
def get_products(q: Optional[str] = None, listing_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Product).filter(Product.status == "available")
    
    # ระบบค้นหาด้วยชื่อ และคัดกรองประเภท (ขาย/แลกเปลี่ยน)
    if q:
        query = query.filter(Product.title.ilike(f"%{q}%"))
    if listing_type:
        query = query.filter(Product.listing_type == listing_type)
        
    return query.order_by(Product.created_at.desc()).all()

@router.post("")
def create_product(data: ProductCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # เช็คว่ามีเสื้อผ้าชิ้นนี้ในตู้จริงๆ
    item = db.query(ClosetItem).filter(ClosetItem.id == data.closet_item_id, ClosetItem.user_id == current_user.id).first()
    if not item:
        raise HTTPException(404, "ไม่พบเสื้อผ้าชิ้นนี้ในตู้ของคุณค่ะ")
        
    # เช็คว่าเคยลงขายไปแล้วหรือยัง
    existing = db.query(Product).filter(Product.closet_item_id == data.closet_item_id, Product.status == "available").first()
    if existing:
        raise HTTPException(400, "ไอเทมนี้ถูกลงขายหน้าร้านไปแล้วค่ะ")

    new_product = Product(
        seller_id=current_user.id,
        closet_item_id=data.closet_item_id,
        title=data.title,
        description=data.description,
        price=data.price,
        listing_type=data.listing_type,
        image_url=item.image_url, # ดึงรูปจากตู้มาใช้หน้าร้าน
        status="available"
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.delete("/{product_id}")
def delete_product(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # เช็คว่าเป็นสินค้าของคนที่กำลังล็อกอินอยู่จริงๆ ถึงจะให้ลบได้
    product = db.query(Product).filter(Product.id == product_id, Product.seller_id == current_user.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="ไม่พบสินค้านี้ หรือคุณไม่มีสิทธิ์ลบค่ะ")
    
    db.delete(product)
    db.commit()
    return {"message": "ลบสินค้าออกจากหน้าร้านเรียบร้อย"}