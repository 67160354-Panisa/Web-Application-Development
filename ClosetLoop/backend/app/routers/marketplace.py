from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Product, ClosetItem, User
from ..schemas import ProductCreate, ProductUpdate, ProductOut
from ..security import get_current_user

router = APIRouter(prefix="/products", tags=["Marketplace"])

@router.get("", response_model=list[ProductOut])
def list_products(
    q: str = Query("", description="Search title"),
    listing_type: str | None = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product).filter(Product.status == "available")
    if q:
        query = query.filter(Product.title.ilike(f"%{q}%"))
    if listing_type:
        query = query.filter(Product.listing_type == listing_type)
    return query.order_by(Product.created_at.desc()).all()

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product

@router.post("", response_model=ProductOut)
def create_product(data: ProductCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if data.price < 0:
        raise HTTPException(400, "Price cannot be negative")
    if data.closet_item_id:
        item = db.get(ClosetItem, data.closet_item_id)
        if not item or item.owner_id != current_user.id:
            raise HTTPException(404, "Closet item not found")
        if item.product:
            raise HTTPException(400, "This closet item is already listed")
        image_url = data.image_url or item.image_url
    else:
        image_url = data.image_url
    product = Product(seller_id=current_user.id, image_url=image_url, **data.model_dump(exclude={"image_url"}))
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or product.seller_id != current_user.id:
        raise HTTPException(404, "Product not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(product, key, value)
    db.commit()
    db.refresh(product)
    return product

@router.delete("/{product_id}")
def delete_product(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product or product.seller_id != current_user.id:
        raise HTTPException(404, "Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted"}
