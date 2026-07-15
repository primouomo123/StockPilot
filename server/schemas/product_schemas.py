from decimal import Decimal

from marshmallow import Schema, fields, validate, validates_schema, ValidationError, RAISE, pre_load, post_load

from utils import SKU_REGEX

class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1,
                                                              max=100,
                                                              error="Name must be between 1 and 100 characters long"))
    sku = fields.Str(required=True, validate=[
        validate.Length(min=3,
                        max=50,
                        error="SKU must be between 3 and 50 characters long"),
        validate.Regexp(SKU_REGEX,
                        error="SKU must contain only uppercase letters, numbers, underscores, and hyphens.")
    ])
    price = fields.Decimal(required=True, validate=validate.Range(min=Decimal('0.01'),
                                                                  error="Price must be greater than 0"))
    total_units = fields.Int(required=True, validate=validate.Range(min=0,
                                                                     error="Total units must be 0 or greater"))
    min_stock = fields.Int(required=True, validate=validate.Range(min=0,
                                                                   error="Minimum stock must be 0 or greater"))
    max_stock = fields.Int(required=True, validate=validate.Range(min=0,
                                                                   error="Maximum stock must be 0 or greater"))
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    category_id = fields.Int(load_only=True, required=True)
    user_id = fields.Int(load_only=True, required=True)
    category_name = fields.Str(attribute='category.name', dump_only=True)

    class Meta:
        unknown = RAISE
        ordered = True

    @pre_load
    def process_input(self, data, **kwargs):
        # Strip whitespace from string fields
        if 'name' in data and isinstance(data['name'], str):
            data['name'] = data['name'].strip().title()
        if 'sku' in data and isinstance(data['sku'], str):
            data['sku'] = data['sku'].strip().upper()
        return data
    
    @validates_schema
    def validate_stock_levels(self, data, **kwargs):
        min_stock = data.get('min_stock')
        max_stock = data.get('max_stock')
        
        if isinstance(min_stock, int) and isinstance(max_stock, int):
            if min_stock > max_stock:
                raise ValidationError("min_stock cannot be greater than max_stock.", field_name="min_stock")


class CreateProductSchema(ProductSchema):
    """Schema for creating a new product."""
    @post_load
    def create_product(self, data, **kwargs):
        from models import Product  # Importing here to avoid circular import issues
        product = Product(
            name=data['name'],
            sku=data['sku'],
            price=data['price'],
            total_units=data['total_units'],
            min_stock=data['min_stock'],
            max_stock=data['max_stock'],
            category_id=data['category_id'],
            user_id=data['user_id']
        )
        return product


class UpdateProductSchema(ProductSchema):
    """Schema for updating an existing product."""
    name = fields.Str(
        required=False,
        validate=validate.Length(min=1, max=100)
    )
    sku = fields.Str(
        required=False,
        validate=[
            validate.Length(min=3, max=50,
                            error="SKU must be between 3 and 50 characters long"),
            validate.Regexp(SKU_REGEX,
                            error="SKU format is invalid")
        ]
    )
    price = fields.Decimal(
        required=False,
        validate=validate.Range(min=Decimal('0.01'),
                                error="Price must be at least 0.01")
    )
    min_stock = fields.Int(
        required=False,
        validate=validate.Range(min=0,
                                error="Minimum stock must be 0 or greater")
    )
    max_stock = fields.Int(
        required=False,
        validate=validate.Range(min=0,
                                error="Maximum stock must be 0 or greater")
    )
    category_id = fields.Int(
        required=False,
        load_only=True
    )
    user_id = fields.Int(
        required=False,
        load_only=True
    )

    @validates_schema
    def validate_stock_levels(self, data, **kwargs):
        product = self.context.get("product")
        if not product:
            raise ValidationError("Product instance is required for validation.")

        min_stock = data.get("min_stock", product.min_stock)
        max_stock = data.get("max_stock", product.max_stock)

        if min_stock > max_stock:
            raise ValidationError(
                "min_stock cannot be greater than max_stock.",
                field_name="min_stock"
            )

    @post_load
    def update_product(self, data, **kwargs):
        product = self.context.get('product')
        if not product:
            raise ValidationError("Product instance is required for updating.")
        for key, value in data.items():
            setattr(product, key, value)
        return product