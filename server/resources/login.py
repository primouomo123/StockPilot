from flask import request, make_response
from flask_restful import Resource
from flask_jwt_extended import create_access_token, create_refresh_token, set_refresh_cookies

from models import User
from schemas import UserSchema

class Login(Resource):
    """Resource for user login."""
    def post(self):
        """Handle user login."""
        request_json = request.get_json()

        if request_json is None:
            return {"message": "No input data provided"}, 400
        
        username = request_json.get("username")
        password = request_json.get("password")

        if not username or not password:
            return {"message": "Username and password are required"}, 400
        
        username = username.strip().lower()

        try:
            user = User.query.filter_by(username=username).first()
            if not user or not user.authenticate(password):
                return {"message": "Invalid username or password"}, 401

            access_token = create_access_token(identity=str(user.id))
            refresh_token = create_refresh_token(identity=str(user.id))

            schema = UserSchema()
            response = make_response({"access_token": access_token,
                                        "user": schema.dump(user)}, 200)
            set_refresh_cookies(response, refresh_token)
            return response
        
        except Exception as e:
            return {"message": "An error occurred during login", "error": str(e)}, 500