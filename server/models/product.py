from decimal import Decimal, InvalidOperation
from datetime import datetime

from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlalchemy.orm import validates
from sqlalchemy.sql import func

from config import db

from utils import SKU_REGEX

class Product(db.Model):
    """Product model for managing products in the inventory."""
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    sku = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Numeric(12, 2), nullable=False)
    total_units = db.Column(db.Integer, nullable=False)
    min_stock = db.Column(db.Integer, nullable=False)
    max_stock = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    __table_args__ = (
        CheckConstraint('length(name) >= 1', name='check_name_min_length'),
        CheckConstraint('length(sku) >= 3', name='check_sku_min_length'),
        CheckConstraint('price >= 0', name='check_price_non_negative'),
        CheckConstraint('total_units >= 0', name='check_total_units_non_negative'),
        CheckConstraint('min_stock >= 0', name='check_min_stock_non_negative'),
        CheckConstraint('max_stock >= 0', name='check_max_stock_non_negative'),
        CheckConstraint('min_stock <= max_stock', name='check_min_stock_less_than_max_stock'),
        UniqueConstraint('name', 'user_id', name='unique_name_per_user'),
        UniqueConstraint('sku', 'user_id', name='unique_sku_per_user')
    )

    @validates("name")
    def validate_name(self, key, value):
        if not isinstance(value, str):
            raise ValueError(f"{key} must be a string.")
        stripped_value = value.strip().title()
        if len(stripped_value) < 1 or len(stripped_value) > 100:
            raise ValueError(f"{key} must be between 1 and 100 characters long.")
        return stripped_value
    
    @validates("sku")
    def validate_sku(self, key, value):
        if not isinstance(value, str):
            raise ValueError(f"{key} must be a string.")
        stripped_value = value.strip().upper()
        if len(stripped_value) < 3 or len(stripped_value) > 50:
            raise ValueError(f"{key} must be between 3 and 50 characters long.")
        if not SKU_REGEX.match(stripped_value):
            raise ValueError(f"{key} must contain only uppercase letters, numbers, underscores, and hyphens.")
        return stripped_value
    
    @validates("price")
    def validate_price(self, key, value):
        try:
            price = Decimal(value)
        except (InvalidOperation, TypeError):
            raise ValueError(f"{key} must be a valid decimal number.")
        if price < 0:
            raise ValueError(f"{key} must be non-negative.")
        return price
    
    @validates("total_units", "min_stock", "max_stock")
    def validate_stock(self, key, value):
        if not isinstance(value, int):
            raise ValueError(f"{key} must be an integer.")
        if value < 0:
            raise ValueError(f"{key} must be non-negative.")
        return value
    

    user = db.relationship("User", back_populates="products")
    category = db.relationship("Category", back_populates="products")