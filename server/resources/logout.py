from flask import make_response
from flask_restful import Resource
from flask_jwt_extended import unset_refresh_cookies

class Logout(Resource):
    """Resource for logging out a user by unsetting JWT cookies."""
    def post(self):
        """Handle user logout."""
        response = make_response({"message": "Logout successful"}, 200)
        unset_refresh_cookies(response)
        return response