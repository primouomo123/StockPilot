import re


TRANSACTION_TYPES = ("Restock", "Sell")

USERNAME_REGEX = re.compile(r"^[a-z0-9_]+$")
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$")
SKU_REGEX = re.compile(r"^[A-Z0-9_-]+$")