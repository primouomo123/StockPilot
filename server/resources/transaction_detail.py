from flask import request
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import get_jwt_identity, jwt_required
from marshmallow import ValidationError

from models import Transaction
from schemas import TransactionSchema
from config import db

class TransactionDetail(Resource):
    """Resource for retrieving, updating, and deleting a specific transaction."""
    
    @jwt_required()
    def get(self, transaction_id):
        """Retrieve a specific transaction by its ID."""
        user_id = get_jwt_identity()
        transaction = db.session.query(Transaction).filter_by(id=transaction_id, user_id=user_id).first()
        
        if not transaction:
            return {"message": "Transaction not found"}, 404
        
        return TransactionSchema().dump(transaction), 200