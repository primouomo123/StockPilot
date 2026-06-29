from datetime import datetime

from sqlalchemy import CheckConstraint, UniqueConstraint
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
    created_at = db.Column(db.DateTime, server_default=func.now(), nullable=False)
    updated_at = db.Column(db.DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)