from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from models import Product, Category
from schemas import ProductSchema, UpdateProductSchema
from utils import PRODUCT_UPDATE_ALLOWED_KEYS
from config import db

class ProductDetail(Resource):
    """Resource for retrieving, updating, and deleting a specific product."""
    
    @jwt_required()
    def get(self, product_id):
        """Retrieve a specific product by its ID."""
        user_id = get_jwt_identity()
        product = db.session.query(Product).filter_by(id=product_id, user_id=user_id).first()
        
        if not product:
            return {"message": "Product not found"}, 404
        
        return ProductSchema().dump(product), 200
    
    @jwt_required()
    def patch(self, product_id):
        """Update a specific product by its ID."""
        user_id = get_jwt_identity()
        product = db.session.query(Product).filter_by(id=product_id, user_id=user_id).first()
        
        if not product:
            return {"message": "Product not found"}, 404
        
        request_json = request.get_json()
        if request_json is None:
            return {"message": "No input data provided"}, 400
        
        product_data = {key: value for key, value in request_json.items() if key in PRODUCT_UPDATE_ALLOWED_KEYS}
        
        if 'category_name' in request_json:
            if not isinstance(request_json.get('category_name'), str) or not request_json['category_name'].strip():
                return {"message": "Category name must be a non-empty string"}, 400
            
            category = db.session.query(Category).filter_by(name=request_json['category_name'].strip().title(), user_id=user_id).first()
            if not category:
                return {"message": "Category not found"}, 404
            
            product_data['category_id'] = category.id
        
        if not product_data:
            return {"message": "No valid fields provided for update"}, 400
    
        try:
            update_schema = UpdateProductSchema()
            update_schema.context = {'product': product}
            updated_product = update_schema.load(product_data)
            updated_product.updated_at = db.func.now()  # Update the updated_at timestamp
            db.session.commit()
            return ProductSchema().dump(updated_product), 200
        
        except ValidationError as err:
            db.session.rollback()
            return {"message": "Validation error", "errors": err.messages}, 400
        
        except IntegrityError:
            db.session.rollback()
            return {"message": "Product with this name or SKU already exists."}, 400
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while updating the product.", "error": str(e)}, 500
    
    @jwt_required()
    def delete(self, product_id):
        """Delete a specific product by its ID."""
        user_id = get_jwt_identity()
        product = db.session.query(Product).filter_by(id=product_id, user_id=user_id).first()

        if not product:
            return {"message": "Product not found"}, 404
        
        if product.total_units > 0:
            return {"message": "Cannot delete product with remaining units."}, 400
        
        try:
            db.session.delete(product)
            db.session.commit()
            return "", 204
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while deleting the product.", "error": str(e)}, 500
        
