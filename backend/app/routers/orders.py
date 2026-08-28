from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..database import get_db
from ..models import Order, Product, User
from ..security import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

class OrderCreate(BaseModel):
    product_id: int
    quantity: int = 1

@router.get("")
def get_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # ดึงประวัติการสั่งซื้อเฉพาะของคนที่ล็อกอิน
    return db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.post("")
def create_order(data: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == data.product_id, Product.status == "available").first()
    if not product:
        raise HTTPException(404, "ว้า! สินค้าถูกขายไปแล้ว หรือไม่มีในระบบค่ะ")
    
    if product.seller_id == current_user.id:
        raise HTTPException(400, "ไม่สามารถกดซื้อสินค้าของตัวเองได้นะคะ")

    order = Order(
        buyer_id=current_user.id,
        product_id=product.id,
        quantity=data.quantity,
        total_price=product.price * data.quantity,
        status="completed"
    )
    # อัปเดตสถานะสินค้าว่าขายออกแล้ว
    product.status = "sold" 
    
    db.add(order)
    db.commit()
    db.refresh(order)
    return order