from flask import request, make_response
from flask_restful import Resource
from sqlalchemy.exc import IntegrityError
from flask_jwt_extended import create_access_token, create_refresh_token, set_refresh_cookies
from marshmallow import ValidationError

from config import db
from schemas import CreateUserSchema
from utils import USER_ALLOWED_KEYS

class Signup(Resource):
    """Resource for user signup."""
    def post(self):
        """Handle user signup."""
        request_json = request.get_json()

        if request_json is None:
            return {"message": "No input data provided"}, 400
        
        user_data = {key: request_json[key] for key in USER_ALLOWED_KEYS if key in request_json}

        if not user_data:
            return {"message": "No valid user data provided"}, 400
        
        try:
            schema = CreateUserSchema()
            user = schema.load(user_data)
            db.session.add(user)
            db.session.commit()

            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))

            response = make_response({"access_token": access_token,
                                      "user": schema.dump(user)}, 201)
            set_refresh_cookies(response, refresh_token)
            return response
        
        except ValidationError as err:
            db.session.rollback()
            return {"message": "Validation error", "errors": err.messages}, 400
        
        except IntegrityError:
            db.session.rollback()
            return {"message": "User with this username or email already exists"}, 400
        
        except Exception as e:
            db.session.rollback()
            return {"message": "An error occurred during signup", "error": str(e)}, 500