from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError, RAISE, pre_load, post_load

from utils import TRANSACTION_TYPES

class TransactionSchema(Schema):
    id = fields.Int(dump_only=True)
    transaction_type = fields.Str(required=True, validate=validate.OneOf(TRANSACTION_TYPES,
                                                                         error=f"Invalid transaction type. Must be one of: {TRANSACTION_TYPES}."))
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
            data['transaction_type'] = data['transaction_type'].strip().title()
        return data
    
    @validates('quantity_change')
    def validate_quantity_change(self, value):
        if not isinstance(value, int):
            raise ValidationError("Quantity change must be an integer.")
        if value == 0:
            raise ValidationError("Quantity change must be non-zero.")
    
    @validates_schema
    def validate_transaction_type_and_quantity(self, data, **kwargs):
        transaction_type = data.get('transaction_type')
        quantity_change = data.get('quantity_change')

        if transaction_type == TRANSACTION_TYPES[0] and quantity_change <= 0:
            raise ValidationError("For Stock_In transactions, quantity change must be a positive integer.")
        elif transaction_type == TRANSACTION_TYPES[1] and quantity_change >= 0:
            raise ValidationError("For Stock_Out transactions, quantity change must be a negative integer.")


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