import re

from marshmallow import Schema, fields, validate, validates, ValidationError, RAISE, pre_load, post_load

USERNAME_REGEX = re.compile(r"^[a-z0-9_]+$")
PASSWORD_REGEX = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$")

class UserSchema(Schema):
    """Marshmallow schema for user data validation, serialization and deserialization."""
    id = fields.Int(dump_only=True)
    username = fields.Str(required=True, validate=[
        validate.Length(min=3, max=30),
        validate.Regexp(USERNAME_REGEX, error="Username must contain only lowercase letters, numbers, and underscores.")
    ])
    email = fields.Email(required=True, validate=validate.Length(min=6, max=255))
    password = fields.Str(load_only=True, required=True, validate=[
        validate.Length(min=8, error="Password must be at least 8 characters long."),
        validate.Regexp(PASSWORD_REGEX, error="Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.")
    ])
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    class Meta:
        unknown = RAISE
        ordered = True
    
    @pre_load
    def preprocess_input(self, data, **kwargs):
        """Preprocess input data before validation."""
        if 'username' in data and isinstance(data['username'], str):
            data['username'] = data['username'].strip().lower()
        if 'email' in data and isinstance(data['email'], str):
            data['email'] = data['email'].strip().lower()
        return data


class CreateUserSchema(UserSchema):
    """Schema for creating a new user."""
    @post_load
    def create_user(self, data, **kwargs):
        from models import User  # Importing here to avoid circular import issues
        user = User(
            username=data['username'],
            email=data['email'],
        )
        user.password_hash = data['password']  # This will trigger the password hashing
        return user
    

class UpdateUserSchema(UserSchema):
    """Schema for updating an existing user."""
    username = fields.Str(
        required=False,
        validate=[
            validate.Length(min=3, max=30),
            validate.Regexp(USERNAME_REGEX)
        ]
    )

    email = fields.Email(
        required=False,
        validate=validate.Length(min=6, max=255)
    )

    password = fields.Str(
        required=False,
        load_only=True,
        validate=[
            validate.Length(min=8),
            validate.Regexp(PASSWORD_REGEX)
        ]
    )

    @post_load
    def update_user(self, data, **kwargs):
        user = self.context.get('user')
        if not user:
            raise ValidationError("User instance is required for updating.")
        for key, value in data.items():
            if key == 'password':
                user.password_hash = value  # This will trigger the password hashing
            else:
                setattr(user, key, value)
        return user