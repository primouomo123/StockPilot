from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError, RAISE, pre_load, post_load

from utils import TRANSACTION_TYPES

class TransactionSchema(Schema):
    id = fields.Int(dump_only=True)
    transaction_type = fields.Str(required=True, validate=validate.OneOf(TRANSACTION_TYPES))
    quantity_change = fields.Int(required=True, validate=validate.Range(min=1, max=1000000))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
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


class UpdateTransactionSchema(TransactionSchema):
    """Schema for updating an existing transaction."""
    transaction_type = fields.Str(
        required=False,
        validate=validate.OneOf(TRANSACTION_TYPES)
    )
    quantity_change = fields.Int(
        required=False,
        validate=validate.Range(min=1, max=1000000)
    )
    product_id = fields.Int(
        load_only=True,
        required=False
    )
    user_id = fields.Int(
        load_only=True,
        required=False
    )

    @post_load
    def update_transaction(self, data, **kwargs):
        transaction = self.context.get('transaction')
        if not transaction:
            raise ValidationError("Transaction instance is required in context for updating.")
        for key, value in data.items():
            setattr(transaction, key, value)
        return transaction