from flask import request, jsonify, make_response
from flask_jwt_extended import create_access_token, get_jwt_identity, verify_jwt_in_request

from config import app, db, api, jwt
from models import *
from resources import *

@app.before_request
def check_if_logged_in():
    open_access_paths = {'/api/signup', '/api/login', '/api/refresh', '/api/logout'}

    if request.path not in open_access_paths:
        try:
            verify_jwt_in_request()
        except Exception as e:
            return make_response(jsonify({'error': '401 Unauthorized'}), 401)


api.add_resource(Signup, '/api/signup')
api.add_resource(Login, '/api/login')
api.add_resource(TokenRefresh, '/api/refresh')
api.add_resource(Logout, '/api/logout')
api.add_resource(Me, '/api/me')
api.add_resource(CategoryList, '/api/categories')
api.add_resource(CategoryDetail, '/api/categories/<int:category_id>')
api.add_resource(ProductList, '/api/products')
api.add_resource(ProductDetail, '/api/products/<int:product_id>')
api.add_resource(TransactionList, '/api/transactions')
api.add_resource(TransactionDetail, '/api/transactions/<int:transaction_id>')
api.add_resource(Summary, '/api/summary')


if __name__ == '__main__':
    app.run(port=5555, debug=True)