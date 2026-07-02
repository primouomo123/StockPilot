from email_validator import validate_email, EmailNotValidError

from sqlalchemy import CheckConstraint
from sqlalchemy.orm import validates
from sqlalchemy.ext.hybrid import hybrid_property

from config import db, bcrypt

from utils import USERNAME_REGEX, PASSWORD_REGEX

class User(db.Model):
    """User model for authentication, authorization, and user management."""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    _password_hash = db.Column(db.String(128), nullable=True)

    @hybrid_property
    def password_hash(self):
        raise AttributeError("Password hash cannot be viewed.")
    
    @password_hash.setter
    def password_hash(self, password):
        # Validate password strength and type before hashing
        if (
            not isinstance(password, str)
            or len(password) < 8
            or not PASSWORD_REGEX.match(password)
            ):  # Ensuring a safe password
            raise ValueError("Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character, and be at least 8 characters long.")
        
        # Password hashing with bcrypt
        password_hash = bcrypt.generate_password_hash(password.encode('utf-8'))
        self._password_hash = password_hash.decode('utf-8')
    
    def authenticate(self, password):
        if not self._password_hash:
            return False
        return bcrypt.check_password_hash(self._password_hash, password.encode('utf-8'))
    
    __table_args__ = (
        CheckConstraint("length(username) >= 3", name="username_min_length"),
        CheckConstraint("length(email) >= 6", name="email_min_length"),
        CheckConstraint("email LIKE '%@%.%'", name="email_format"),
    )

    @validates("username")
    def validate_username(self, key, value):
        if not isinstance(value, str):
            raise ValueError(f"{key} must be a string.")
        stripped_value = value.strip().lower()
        if not USERNAME_REGEX.match(stripped_value):
            raise ValueError(f"{key} must contain only lowercase letters, numbers, and underscores.")
        if len(stripped_value) < 3 or len(stripped_value) > 30:
            raise ValueError(f"{key} must be between 3 and 30 characters long.")
        return stripped_value
    
    @validates("email")
    def validate_email_address(self, key, value):
        if not isinstance(value, str):
            raise ValueError(f"{key} must be a string.")
        stripped_value = value.strip().lower()
        if len(stripped_value) < 6 or len(stripped_value) > 255:
            raise ValueError(f"{key} must be between 6 and 255 characters long.")
        try:
            # Validate email format using email_validator
            valid = validate_email(stripped_value)
            return valid.email
        except EmailNotValidError as e:
            raise ValueError(f"{key} is not a valid email address: {str(e)}")
    

    categories = db.relationship("Category", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    products = db.relationship("Product", back_populates="user", cascade="all, delete-orphan", lazy="selectin")
    transactions = db.relationship("Transaction", back_populates="user", cascade="all, delete-orphan", lazy="selectin")