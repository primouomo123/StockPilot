from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from models import Product, Category
from schemas import ProductSchema, CreateProductSchema
from utils import PRODUCT_CREATION_ALLOWED_KEYS
from config import db

class ProductList(Resource):
    """Resource for retrieving and creating products."""
    
    @jwt_required()
    def get(self):
        """Retrieve a list of all products."""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        name_filter = request.args.get('name', type=str)
        user_id = get_jwt_identity()
        query = (db.session.query(Product)
                 .options(selectinload(Product.category))  # Eager load the category relationship
                 .filter_by(user_id=user_id))

        # Apply optional case-insensitive name filter.
        if isinstance(name_filter, str) and name_filter.strip():
            query = query.filter(Product.name.ilike(f"%{name_filter.strip()}%"))

        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'products': ProductSchema(many=True).dump(pagination.items)
        }, 200
    
    @jwt_required()
    def post(self):
        """Create a new product."""
        user_id = get_jwt_identity()
        request_json = request.get_json()
        if request_json is None:
            return {"message": "No input data provided"}, 400
        
        if not isinstance(request_json.get('category_name'), str) or not request_json['category_name'].strip():
            return {"message": "Category name must be a non-empty string"}, 400
        category = db.session.query(Category).filter_by(name=request_json['category_name'].strip().title(), user_id=user_id).first()

        if not category:
            return {"message": "Category not found"}, 404
        
        product_data = {
            **request_json,
            'category_id': category.id,
            'user_id': user_id,
            'total_units': 0
        }

        product_data = {key: value for key, value in product_data.items() if key in PRODUCT_CREATION_ALLOWED_KEYS}        
        try:
            create_schema = CreateProductSchema()
            product = create_schema.load(product_data)
            db.session.add(product)
            db.session.commit()

            product = (
                db.session.query(Product)
                .options(selectinload(Product.category))
                .filter_by(id=product.id)
                .first()
            )
            
            return ProductSchema().dump(product), 201
        
        except ValidationError as err:
            db.session.rollback()
            return {"message": "Validation error", "errors": err.messages}, 400
        
        except IntegrityError:
            db.session.rollback()
            return {"message": "A product with this name or SKU already exists."}, 400
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while creating the product", "error": str(e)}, 500