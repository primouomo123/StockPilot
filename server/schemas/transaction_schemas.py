from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError, RAISE, pre_load, post_load

from utils import TRANSACTION_TYPES

class TransactionSchema(Schema):
    id = fields.Int(dump_only=True)
    transaction_type = fields.Str(required=True, validate=validate.OneOf(TRANSACTION_TYPES,
                                                                         error="Invalid transaction type. Must be one of: 'Purchase', 'Sale', 'Return'"))
    quantity_change = fields.Int(required=True)
    created_at = fields.DateTime(dump_only=True)
    product_id = fields.Int(load_only=True, required=True)
    product_name = fields.Str(attribute='product.name', dump_only=True)
    user_id = fields.Int(load_only=True, required=True)

    class Meta:
        unknown = RAISE
        ordered = True
    
    @pre_load
    def process_input(self, data, **kwargs):
        # Strip whitespace from string fields
        if 'transaction_type' in data and isinstance(data['transaction_type'], str):
            data['transaction_type'] = data['transaction_type'].strip().capitalize()
        return data
    
    @validates('quantity_change')
    def validate_quantity_change(self, value):
        if not isinstance(value, int):
            raise ValidationError("Quantity change must be an integer.")
        if value < -1000000 or value > 1000000 or value == 0:
            raise ValidationError("Quantity change must be between -1,000,000 and 1,000,000, excluding zero.")


class CreateTransactionSchema(TransactionSchema):
    """Schema for creating a new transaction."""
    @post_load
    def create_transaction(self, data, **kwargs):
        from models import Transaction  # Importing here to avoid circular import issues
        transaction = Transaction(
            transaction_type=data['transaction_type'],
            quantity_change=data['quantity_change'],
            product_id=data['product_id'],
            user_id=data['user_id']
        )
        return transaction