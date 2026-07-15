from flask import request, jsonify, make_response
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request

from config import app, db, api, jwt
from models import *
from resources import *

@app.before_request
def check_if_logged_in():
    open_access_list = ['signup', 'login', 'refresh', 'logout']

    if request.endpoint and request.endpoint not in open_access_list:
        try:
            verify_jwt_in_request()
        except Exception as e:
            return make_response(jsonify({'error': '401 Unauthorized'}), 401)


api.add_resource(Signup, '/signup')
api.add_resource(Login, '/login')
api.add_resource(TokenRefresh, '/refresh')
api.add_resource(Logout, '/logout')
api.add_resource(Me, '/me')
api.add_resource(CategoryList, '/categories')
api.add_resource(CategoryDetail, '/categories/<int:category_id>')
api.add_resource(ProductList, '/products')
api.add_resource(ProductDetail, '/products/<int:product_id>')
api.add_resource(TransactionList, '/transactions')
api.add_resource(TransactionDetail, '/transactions/<int:transaction_id>')
api.add_resource(Summary, '/summary')


if __name__ == '__main__':
    app.run(port=5555, debug=True)