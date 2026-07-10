from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from models import Category
from schemas import CategorySchema, UpdateCategorySchema
from config import db

class CategoryDetail(Resource):
    """Resource for retrieving, updating, and deleting a specific category."""
    
    @jwt_required()
    def get(self, category_id):
        """Retrieve a specific category by its ID."""
        user_id = get_jwt_identity()
        category = db.session.query(Category).filter_by(id=category_id, user_id=user_id).first()
        
        if not category:
            return {"message": "Category not found"}, 404
        
        return CategorySchema().dump(category), 200
    
    @jwt_required()
    def patch(self, category_id):
        """Update a specific category by its ID."""
        user_id = get_jwt_identity()
        category = db.session.query(Category).filter_by(id=category_id, user_id=user_id).first()
        
        if not category:
            return {"message": "Category not found"}, 404
        
        request_json = request.get_json()
        if request_json is None:
            return {"message": "No input data provided"}, 400
    
        try:
            update_schema = UpdateCategorySchema()
            update_schema.context = {'category': category}
            updated_category = update_schema.load(request_json)
            db.session.commit()
            return CategorySchema().dump(updated_category), 200
        
        except ValidationError as err:
            db.session.rollback()
            return {"message": "Validation error", "errors": err.messages}, 400
        
        except IntegrityError:
            db.session.rollback()
            return {"message": "Category with this name already exists."}, 400
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while updating the category.", "error": str(e)}, 500
    
    @jwt_required()
    def delete(self, category_id):
        """Delete a specific category by its ID."""
        user_id = get_jwt_identity()
        category = db.session.query(Category).filter_by(id=category_id, user_id=user_id).first()
        
        if not category:
            return {"message": "Category not found"}, 404
        
        try:
            db.session.delete(category)
            db.session.commit()
            return "", 204
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while deleting the category.", "error": str(e)}, 500