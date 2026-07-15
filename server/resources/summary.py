from flask_restful import Resource
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import Product, Transaction, Category
from schemas import ProductSchema, TransactionSchema

from config import db

class Summary(Resource):
    @jwt_required()
    def get(self):
        user_id = get_jwt_identity()
        product_schema = ProductSchema(many=True)
        
        # Get total products for the user
        total_products = Product.query.filter_by(user_id=user_id).count()

        # Get total categories for the user
        total_categories = Category.query.filter_by(user_id=user_id).count()

        # Get total units in stock for the user
        total_units = (
            db.session.query(db.func.sum(Product.total_units))
            .filter_by(user_id=user_id)
            .scalar()
            or 0
        )

        # Get inventory value for the user
        inventory_value = (
            db.session.query(
                db.func.sum(Product.price * Product.total_units)
            )
            .filter_by(user_id=user_id)
            .scalar()
            or 0.0
        )

        # Get low stock products for the user
        low_stock_products = (
            Product.query
            .filter_by(user_id=user_id)
            .filter(Product.total_units > 0, Product.total_units <= Product.min_stock)
            .limit(10)
            .all()
        )
        low_stock_products_data = product_schema.dump(low_stock_products)

        # Get products with 0 units for the user
        zero_stock_products = (
            Product.query
            .filter_by(user_id=user_id)
            .filter(Product.total_units == 0)
            .limit(10)
            .all()
        )
        zero_stock_products_data = product_schema.dump(zero_stock_products)

        # Get recent products for the user
        recent_products = (
            Product.query
            .filter_by(user_id=user_id)
            .order_by(Product.id.desc())
            .limit(10)
            .all()
        )
        recent_products_data = product_schema.dump(recent_products)

        # Get recent transactions for the user
        transactions = (
            Transaction.query
            .filter_by(user_id=user_id)
            .order_by(Transaction.id.desc())
            .limit(10)
            .all()
        )
        transactions_data = TransactionSchema(many=True).dump(transactions)

        return {
            "total_products": total_products,
            "total_categories": total_categories,
            "total_units": total_units,
            "inventory_value": inventory_value,
            "low_stock_products": low_stock_products_data,
            "zero_stock_products": zero_stock_products_data,
            "recent_products": recent_products_data,
            "recent_transactions": transactions_data
        }, 200