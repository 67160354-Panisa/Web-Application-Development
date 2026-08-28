from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(100), default="")
    avatar_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    closet_items = relationship("ClosetItem", back_populates="owner", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="seller", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="buyer", cascade="all, delete-orphan")

class ClosetItem(Base):
    __tablename__ = "closet_items"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    color = Column(String(50), default="neutral")
    size = Column(String(20), default="M")
    style = Column(String(50), default="casual")
    condition = Column(String(50), default="good")
    image_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="closet_items")
    product = relationship("Product", back_populates="closet_item", uselist=False)

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    closet_item_id = Column(Integer, ForeignKey("closet_items.id"), nullable=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, default="")
    price = Column(Float, nullable=False)
    listing_type = Column(String(20), default="sale")
    status = Column(String(20), default="available")
    image_url = Column(String(500), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship("User", back_populates="products")
    closet_item = relationship("ClosetItem", back_populates="product")
    orders = relationship("Order", back_populates="product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    status = Column(String(30), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("User", back_populates="orders")
    product = relationship("Product", back_populates="orders")