from sqlalchemy import CheckConstraint, UniqueConstraint
from sqlalchemy.orm import validates

from config import db

class Category(db.Model):
    """Category model for categorizing products and transactions."""  