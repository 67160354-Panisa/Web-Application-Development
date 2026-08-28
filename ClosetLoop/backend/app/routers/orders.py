from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Order, Product, User
from ..schemas import OrderCreate, OrderOut
from ..security import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderOut)
def create_order(data: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.get(Product, data.product_id)
    if not product or product.status != "available":
        raise HTTPException(400, "Product is not available")
    if product.seller_id == current_user.id:
        raise HTTPException(400, "You cannot buy your own listing")
    if data.quantity < 1:
        raise HTTPException(400, "Quantity must be at least 1")
    order = Order(
        buyer_id=current_user.id,
        product_id=product.id,
        quantity=data.quantity,
        total_price=product.price * data.quantity,
        status="paid"
    )
    product.status = "sold"
    db.add(order)
    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=list[OrderOut])
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Order).filter(Order.buyer_id == current_user.id).order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order or order.buyer_id != current_user.id:
        raise HTTPException(404, "Order not found")
    return order
