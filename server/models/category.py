from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlalchemy.orm import validates

from config import db

class Category(db.Model):
    """Category model for categorizing products and transactions."""
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    __table_args__ = (
        CheckConstraint("length(name) >= 1", name="name_min_length"),
        UniqueConstraint("user_id", "name", name="unique_category_per_user"),
    )

    @validates("name")
    def validate_name(self, key, value):
        if not isinstance(value, str):
            raise ValueError(f"{key} must be a string.")
        stripped_value = value.strip().lower()
        if len(stripped_value) < 1 or len(stripped_value) > 50:
            raise ValueError(f"{key} must be between 1 and 50 characters long.")
        return stripped_value