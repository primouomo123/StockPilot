from flask import request, make_response
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import get_jwt_identity, jwt_required, unset_refresh_cookies
from marshmallow import ValidationError

from models import User
from schemas import UserSchema, UpdateUserSchema

from config import db

class Me(Resource):
    """Resource for retrieving and updating the current user's information."""
    @jwt_required()
    def get(self):
        """Retrieve the current user's information."""
        try:
            user_id = get_jwt_identity()
            user = db.session.get(User, user_id)
            if not user:
                return {"message": "User not found"}, 404

            schema = UserSchema()
            return schema.dump(user), 200
        
        except Exception as e:
            return {"message": str(e)}, 500
    
    @jwt_required()
    def patch(self):
        """Update the current user's information."""
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        request_json = request.get_json()
        if request_json is None:
            return {"message": "No input data provided"}, 400
        
        try:
            update_schema = UpdateUserSchema()
            update_schema.context = {'user': user}
            user = update_schema.load(request_json)

            db.session.commit()
            user_schema = UserSchema()
            return user_schema.dump(user), 200
        
        except ValidationError as err:
            db.session.rollback()
            return {"message": "Validation error", "errors": err.messages}, 400
        
        except IntegrityError as err:
            db.session.rollback()
            return {"message": "Integrity error", "errors": str(err)}, 400
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while updating user information", "error": str(e)}, 500
    

    @jwt_required()
    def delete(self):
        """Delete the current user's account."""
        user_id = get_jwt_identity()
        user = db.session.get(User, user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        try:
            db.session.delete(user)
            db.session.commit()
            
            response = make_response({"message": "User account deleted successfully"}, 200)
            unset_refresh_cookies(response)
            return response
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred while deleting the user account", "error": str(e)}, 500