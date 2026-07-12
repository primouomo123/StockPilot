import re


TRANSACTION_TYPES = ("Restock", "Sell")

USERNAME_REGEX = re.compile(r"^[a-z0-9_]+$")
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$")
SKU_REGEX = re.compile(r"^[A-Z0-9_-]+$")

PRODUCT_CREATION_ALLOWED_KEYS = {'name', 'sku', 'price', 'total_units', 'min_stock', 'max_stock', 'category_id', 'user_id'}
PRODUCT_UPDATE_ALLOWED_KEYS = {'name', 'sku', 'price', 'min_stock', 'max_stock', 'category_id'}
CATEGORY_CREATION_ALLOWED_KEYS = {'name', 'user_id'}
CATEGORY_UPDATE_ALLOWED_KEYS = {'name'}
USER_ALLOWED_KEYS = {'username', 'email', 'password'}