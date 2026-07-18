from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from models import Category
from schemas import CategorySchema, CreateCategorySchema
from utils import CATEGORY_CREATION_ALLOWED_KEYS
from config import db

class CategoryList(Resource):
    """Resource for retrieving and creating categories."""
    
    @jwt_required()
    def get(self):
        """Retrieve a list of all categories."""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        name_filter = request.args.get('name', type=str)
        user_id = get_jwt_identity()
        query = db.session.query(Category).filter_by(user_id=user_id)

        # Apply optional case-insensitive name filter.
        if isinstance(name_filter, str) and name_filter.strip():
            query = query.filter(Category.name.ilike(f"%{name_filter.strip().title()}%"))

        # Newest categories first.
        query = query.order_by(Category.id.desc())

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'categories': CategorySchema(many=True).dump(pagination.items)
        }, 200
    
    @jwt_required()
    def post(self):
        """Create a new category."""
        user_id = get_jwt_identity()
        request_json = request.get_json()
        if request_json is None:
            return {"message": "No input data provided"}, 400
        
        category_data = {**request_json,
                         "user_id": user_id
                         }

        category_data = {key: value for key, value in category_data.items() if key in CATEGORY_CREATION_ALLOWED_KEYS}
        
        try:
            create_schema = CreateCategorySchema()
            category = create_schema.load(category_data)
            db.session.add(category)
            db.session.commit()
            return CategorySchema().dump(category), 201
        
        except ValidationError as err:
            db.session.rollback()
            return {"message": "Validation error", "errors": err.messages}, 400
        
        except IntegrityError:
            db.session.rollback()
            return {"message": "Category with this name already exists"}, 400
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while creating the category", "error": str(e)}, 500