from sqlalchemy import CheckConstraint
from sqlalchemy.orm import validates
from sqlalchemy.sql import func

from config import db

from utils import TRANSACTION_TYPES

class Transaction(db.Model):
    """Transaction model for recording user transactions."""
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    transaction_type = db.Column(db.Enum(*TRANSACTION_TYPES, name="transaction_types"), nullable=False)
    quantity_change = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    __table_args__ = (
        CheckConstraint('quantity_change != 0', name='check_quantity_change_non_zero'),
    )

    @validates("transaction_type")
    def validate_transaction_type(self, key, value):
        if not isinstance(value, str):
            raise ValueError(f"{key} must be a string.")
        trimmed_value = value.strip().title()
        if trimmed_value not in TRANSACTION_TYPES:
            raise ValueError(f"{key} must be one of {TRANSACTION_TYPES}.")
        return trimmed_value
    
    @validates("quantity_change")
    def validate_quantity_change(self, key, value):
        if not isinstance(value, int):
            raise ValueError(f"{key} must be an integer.")
        if (value == 0):
            raise ValueError(f"{key} must be non-zero.")
        return value
    
    user = db.relationship("User", back_populates="transactions")
    product = db.relationship("Product", back_populates="transactions")