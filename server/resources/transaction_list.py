from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from models import Transaction, Product
from schemas import TransactionSchema, CreateTransactionSchema
from utils import (TRANSACTION_TYPES,
                   TRANSACTION_CREATION_ALLOWED_KEYS)
from config import db

class TransactionList(Resource):
    """Resource for handling transaction list operations."""
    
    @jwt_required()
    def get(self):
        """Get all transactions for the current user."""
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_id = get_jwt_identity()
        pagination = (db.session.query(Transaction)
                      .options(selectinload(Transaction.product))  # Eager load the product relationship
                      .filter_by(user_id=user_id)
                      .paginate(page=page, per_page=per_page, error_out=False))
        
        return {
            'page': pagination.page,
            'per_page': pagination.per_page,
            'total': pagination.total,
            'total_pages': pagination.pages,
            'transactions': TransactionSchema(many=True).dump(pagination.items)
        }, 200
    

    @jwt_required()
    def post(self):
        """Create a new transaction."""
        user_id = get_jwt_identity()
        request_json = request.get_json()
        if request_json is None:
            return {"message": "No input data provided"}, 400
        
        if not isinstance(request_json.get('product_name'), str) or not request_json['product_name'].strip():
            return {"message": "Product name must be a non-empty string"}, 400
        product = db.session.query(Product).filter_by(name=request_json['product_name'].strip().title(), user_id=user_id).first()
        if not product:
            return {"message": "Product not found"}, 404
        
        if not isinstance(request_json.get('transaction_type'), str) or not request_json['transaction_type'].strip():
            return {"message": "Transaction type must be a non-empty string"}, 400
        
        if request_json['transaction_type'].strip().title() not in TRANSACTION_TYPES:
            return {"message": f"Transaction type must be one of {TRANSACTION_TYPES}"}, 400
        
        if not isinstance(request_json.get('quantity_change'), int):
            return {"message": "Quantity change must be an integer"}, 400
        
        transaction_data = {
            **request_json,
            'product_id': product.id,
            'user_id': user_id
        }

        transaction_data = {key: value for key, value in transaction_data.items() if key in TRANSACTION_CREATION_ALLOWED_KEYS}

        transaction_data['transaction_type'] = transaction_data['transaction_type'].strip().title()
        
        
        if transaction_data['quantity_change'] <=0:
            return {"message": "Quantity change must be a positive integer"}, 400
        
        if transaction_data['transaction_type'] == TRANSACTION_TYPES[0]:
            if transaction_data['quantity_change'] + product.total_units > product.max_stock:
                return {"message": "Stock In units exceed maximum stock limit"}, 400
        
        elif transaction_data['transaction_type'] == TRANSACTION_TYPES[1]:
            if transaction_data['quantity_change'] > product.total_units:
                return {"message": "Stock Out units exceed available stock"}, 400

            transaction_data['quantity_change'] = -transaction_data['quantity_change']
        



        try:
            create_schema = CreateTransactionSchema()
            transaction = create_schema.load(transaction_data)
            product.total_units += transaction.quantity_change
            db.session.add(transaction)
            db.session.commit()
            return TransactionSchema().dump(transaction), 201
        
        except ValidationError as err:
            db.session.rollback()
            return {"message": "Validation failed", "errors": err.messages}, 400
        
        except IntegrityError:
            db.session.rollback()
            return {"message": "Transaction could not be created due to a database error"}, 400
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An unexpected error occurred", "error": str(e)}, 500