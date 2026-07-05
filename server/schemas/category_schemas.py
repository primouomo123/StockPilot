from marshmallow import Schema, fields, validate, ValidationError, RAISE, pre_load, post_load

class CategorySchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    user_id = fields.Int(load_only=True, required=True)

    class Meta:
        unknown = RAISE
        ordered = True

    @pre_load
    def preprocess_data(self, data, **kwargs):
        if 'name' in data and isinstance(data['name'], str):
            data['name'] = data['name'].strip().title()
        return data

class CreateCategorySchema(CategorySchema):
    """Schema for creating a new category."""
    @post_load
    def create_category(self, data, **kwargs):
        from models import Category  # Importing here to avoid circular import issues
        category = Category(
            name=data['name'],
            user_id=data['user_id']
        )
        return category


class UpdateCategorySchema(CategorySchema):
    """Schema for updating an existing category."""
    @post_load
    def update_category(self, data, **kwargs):
        category = self.context.get('category')
        if not category:
            raise ValidationError("Category instance is required for updating.")
        for key, value in data.items():
            setattr(category, key, value)
        return category