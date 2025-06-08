# backend/app.py
import os
from datetime import datetime, timedelta
from functools import wraps
from urllib.parse import quote_plus

from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env

app = Flask(__name__)

# --- Configurations ---
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-super-secret-key') # Should be in .env
password = quote_plus('CSKsiva@66')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'mysql+pymysql://root:{password}@localhost:3306/mini_mart_db') # Should be in .env
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'your-jwt-secret-key') # Should be in .env
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=24)

# --- Extensions ---
db = SQLAlchemy(app)
# Configure CORS with explicit settings
CORS(app, 
     resources={r"/*": {
        #  "origins": ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8081" , "http://localhost:8082", "exp://192.168.167.73:8081","exp://192.168.167.73:8082"], 
         "origins": "*",
         "allow_headers": ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
         "expose_headers": ["Content-Type", "Authorization"],
         "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
         "supports_credentials": True,
         "max_age": 86400  # Cache preflight requests for 24 hours
     }})
jwt = JWTManager(app)

# Global error handler to ensure CORS headers are sent with error responses
@app.errorhandler(Exception)
def handle_error(e):
    code = 500
    if hasattr(e, 'code'):
        code = e.code
    return jsonify(error=str(e)), code

# JWT error handlers
@jwt.unauthorized_loader
def unauthorized_callback(callback):
    response = jsonify({
        'message': 'Missing Authorization Header',
        'error': 'authorization_required'
    })
    response.status_code = 401
    return response

@jwt.invalid_token_loader
def invalid_token_callback(callback):
    response = jsonify({
        'message': 'Invalid or expired token',
        'error': 'invalid_token'
    })
    response.status_code = 401
    return response

# --- Database Models ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False) # 'customer' or 'admin'
    city = db.Column(db.String(100), nullable=False)
    shops = db.relationship('Shop', backref='owner', lazy=True, cascade="all, delete-orphan")
    orders = db.relationship('Order', backref='customer', lazy=True)
    addresses = db.relationship('Address', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# We'll define the order_items table after all the models

class Shop(db.Model):
    __tablename__ = 'shops'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    products = db.relationship('Product', backref='shop', lazy=True, cascade="all, delete-orphan")

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(255), nullable=True) # Placeholder for image path/URL
    shop_id = db.Column(db.Integer, db.ForeignKey('shops.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=0) # Available quantity of the product
    category = db.Column(db.String(50), nullable=False, default='Vegetables') # Product category
    discount_percentage = db.Column(db.Float, nullable=False, default=0) # Discount percentage
    featured = db.Column(db.Boolean, nullable=False, default=False) # Whether product is featured
    description = db.Column(db.Text, nullable=True) # Product description
    unit = db.Column(db.String(20), nullable=False, default='kg') # Unit of measurement
    sold_count = db.Column(db.Integer, nullable=False, default=0) # Number of units sold

class Address(db.Model):
    __tablename__ = 'addresses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # Legacy column, will be same as full_name
    full_name = db.Column(db.String(100), nullable=False)
    street_address = db.Column(db.String(255), nullable=False)
    landmark = db.Column(db.String(100), nullable=True)  # Added to match DB schema
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(20), nullable=False)  # Legacy column, will be same as postal_code
    postal_code = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)  # Legacy column, will be same as phone_number
    phone_number = db.Column(db.String(20), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship to orders
    orders = db.relationship('Order', backref='delivery_address', lazy=True)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    address_id = db.Column(db.Integer, db.ForeignKey('addresses.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(50), nullable=False, default='Pending') # e.g., Pending, Confirmed, Shipped, Delivered
    payment_method = db.Column(db.String(50), nullable=True)
    payment_transaction_id = db.Column(db.String(100), nullable=True)
    
    # We'll define the relationships after all models are defined


# Association table for many-to-many relationship between orders and products
order_items = db.Table('order_items',
    db.Column('order_id', db.Integer, db.ForeignKey('orders.id'), primary_key=True),
    db.Column('product_id', db.Integer, db.ForeignKey('products.id'), primary_key=True),
    db.Column('quantity', db.Integer, nullable=False, default=1),
    db.Column('shop_id', db.Integer, db.ForeignKey('shops.id'), nullable=False) # To associate order item with shop
)

# Now define the relationships
Shop.orders = db.relationship('Order', secondary=order_items, overlaps="products,orders")
Product.orders = db.relationship('Order', secondary=order_items, back_populates='products', overlaps="orders")
Order.products = db.relationship('Product', secondary=order_items, back_populates='orders', overlaps="orders")

# --- Helper Decorators for Role-Based Access ---
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_identity = get_jwt_identity()
        user = User.query.filter_by(email=current_user_identity).first()
        if not user or user.role != 'admin':
            return jsonify(message="Admins only!"), 403
        return fn(*args, **kwargs)
    return wrapper

def customer_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_identity = get_jwt_identity() # This is the email
        user = User.query.filter_by(email=current_user_identity).first()
        if not user or user.role != 'customer':
            return jsonify(message="Customers only!"), 403
        return fn(*args, **kwargs)
    return wrapper

# --- Authentication Routes ---
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role') # 'customer' or 'admin'
    city = data.get('city')

    if not all([name, email, password, role, city]):
        return jsonify(message="Missing required fields"), 400
    
    if role not in ['customer', 'admin']:
        return jsonify(message="Invalid role specified"), 400

    if User.query.filter_by(email=email).first():
        return jsonify(message="Email already registered"), 409

    new_user = User(name=name, email=email, role=role, city=city)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify(message="User registered successfully"), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify(message="Email and password are required"), 400

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=email) # Identity can be user.id or user.email
        return jsonify(
            access_token=access_token,
            role=user.role,
            city=user.city,
            name=user.name,
            user_id=user.id
        ), 200
    else:
        return jsonify(message="Invalid email or password"), 401

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    if not user:
        return jsonify(message="User not found"), 404
    return jsonify(id=user.id, name=user.name, email=user.email, role=user.role, city=user.city), 200

@app.route('/api/auth/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify(message="User not found"), 404
    
    data = request.get_json()
    
    # Update user fields
    if 'name' in data:
        user.name = data['name']
    if 'city' in data:
        user.city = data['city']
    
    # Don't allow changing email or role through this endpoint for security
    
    # Update password if provided
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify(message="Profile updated successfully"), 200

# --- Address Routes ---
@app.route('/api/addresses', methods=['GET'])
@jwt_required()
def get_addresses():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify(message="User not found"), 404
    
    addresses = Address.query.filter_by(user_id=user.id).order_by(Address.is_default.desc(), Address.created_at.desc()).all()
    
    result = []
    for address in addresses:
        result.append({
            'id': address.id,
            'full_name': address.full_name,
            'street_address': address.street_address,
            'city': address.city,
            'state': address.state,
            'postal_code': address.postal_code,
            'phone_number': address.phone_number,
            'is_default': address.is_default
        })
    
    return jsonify(result), 200

@app.route('/api/addresses', methods=['POST'])
@jwt_required()
def add_address():
    data = request.get_json()
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify(message="User not found"), 404
    
    # Validate required fields
    required_fields = ['full_name', 'street_address', 'city', 'state', 'postal_code', 'phone_number']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify(message=f"Missing required field: {field}"), 400
    
    # Check if this is the first address for the user
    is_first_address = Address.query.filter_by(user_id=user.id).count() == 0
    
    # Create new address
    new_address = Address(
        user_id=user.id,
        name=data['full_name'],  # Set legacy field
        full_name=data['full_name'],
        street_address=data['street_address'],
        landmark=data.get('landmark', ''),  # Optional field
        city=data['city'],
        state=data['state'],
        pincode=data['postal_code'],  # Set legacy field
        postal_code=data['postal_code'],
        phone=data['phone_number'],  # Set legacy field
        phone_number=data['phone_number'],
        is_default=data.get('is_default', is_first_address)  # First address is default by default
    )
    
    # If this address is set as default, unset any existing default
    if new_address.is_default:
        Address.query.filter_by(user_id=user.id, is_default=True).update({'is_default': False})
    
    db.session.add(new_address)
    db.session.commit()
    
    return jsonify({
        'message': 'Address added successfully',
        'address_id': new_address.id,
        'is_default': new_address.is_default
    }), 201

@app.route('/api/addresses/<int:address_id>', methods=['PUT'])
@jwt_required()
def update_address(address_id):
    data = request.get_json()
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify(message="User not found"), 404
    
    address = Address.query.filter_by(id=address_id, user_id=user.id).first()
    if not address:
        return jsonify(message="Address not found or does not belong to this user"), 404
    
    # Update fields
    if 'full_name' in data:
        address.full_name = data['full_name']
        address.name = data['full_name']  # Update legacy field
    if 'street_address' in data:
        address.street_address = data['street_address']
    if 'landmark' in data:
        address.landmark = data['landmark']
    if 'city' in data:
        address.city = data['city']
    if 'state' in data:
        address.state = data['state']
    if 'postal_code' in data:
        address.postal_code = data['postal_code']
        address.pincode = data['postal_code']  # Update legacy field
    if 'phone_number' in data:
        address.phone_number = data['phone_number']
        address.phone = data['phone_number']  # Update legacy field
    
    # Handle default address setting
    if 'is_default' in data and data['is_default'] and not address.is_default:
        # Unset any existing default address
        Address.query.filter_by(user_id=user.id, is_default=True).update({'is_default': False})
        address.is_default = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Address updated successfully',
        'address_id': address.id
    }), 200

@app.route('/api/addresses/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_address(address_id):
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify(message="User not found"), 404
    
    address = Address.query.filter_by(id=address_id, user_id=user.id).first()
    if not address:
        return jsonify(message="Address not found or does not belong to this user"), 404
    
    was_default = address.is_default
    
    # Check if this address is used in any orders
    orders_with_address = Order.query.filter_by(address_id=address_id).count()
    if orders_with_address > 0:
        return jsonify(message="Cannot delete address as it is used in orders"), 400
    
    db.session.delete(address)
    
    # If this was the default address, set another address as default if available
    if was_default:
        next_address = Address.query.filter_by(user_id=user.id).first()
        if next_address:
            next_address.is_default = True
    
    db.session.commit()
    
    return jsonify({
        'message': 'Address deleted successfully'
    }), 200

@app.route('/api/addresses/default', methods=['GET'])
@jwt_required()
def get_default_address():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()
    
    if not user:
        return jsonify(message="User not found"), 404
    
    default_address = Address.query.filter_by(user_id=user.id, is_default=True).first()
    
    if not default_address:
        return jsonify(message="No default address found"), 404
    
    return jsonify({
        'id': default_address.id,
        'full_name': default_address.full_name,
        'street_address': default_address.street_address,
        'city': default_address.city,
        'state': default_address.state,
        'postal_code': default_address.postal_code,
        'phone_number': default_address.phone_number,
        'is_default': default_address.is_default
    }), 200


# --- Shop Routes ---
@app.route('/api/shops', methods=['POST'])
@admin_required
def create_shop():
    data = request.get_json()
    name = data.get('name')
    city = data.get('city') # Shop city, can be different from owner's registration city if needed
    
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()

    if not name or not city:
        return jsonify(message="Shop name and city are required"), 400

    # Optional: Check if admin already owns a shop
    existing_shop = Shop.query.filter_by(owner_id=owner.id).first()
    if existing_shop:
        return jsonify(message=f"Admin already owns shop: {existing_shop.name}"), 409


    new_shop = Shop(name=name, city=city, owner_id=owner.id)
    db.session.add(new_shop)
    db.session.commit()
    return jsonify(message="Shop created successfully", shop_id=new_shop.id, name=new_shop.name, city=new_shop.city), 201

@app.route('/api/shops/my', methods=['GET'])
@admin_required
def get_my_shop():
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()
    if not shop:
        return jsonify(message="No shop found for this admin."), 404 # Or return an empty object/array
    return jsonify(id=shop.id, name=shop.name, city=shop.city, owner_id=shop.owner_id), 200


@app.route('/api/shops/city/<city_name>', methods=['GET'])
@jwt_required() # Any logged in user can see shops
def get_shops_by_city(city_name):
    shops = Shop.query.filter(Shop.city.ilike(f"%{city_name}%")).all()
    if not shops:
        return jsonify(message=f"No shops found in {city_name}"), 404
    
    return jsonify([{'id': shop.id, 'name': shop.name, 'city': shop.city} for shop in shops]), 200

# --- Product Routes ---
@app.route('/api/products', methods=['POST'])
@admin_required
def add_product():
    data = request.get_json()
    name = data.get('name')
    price = data.get('price')
    image_url = data.get('image_url', '') # Optional image_url
    
    # Get additional fields but don't use them in the model yet
    category = data.get('category', 'Vegetables')  # Default to vegetables
    discount_percentage = data.get('discount_percentage', 0)
    featured = data.get('featured', False)
    unit = data.get('unit', 'kg')  # Default unit for produce
    description = data.get('description', 'Fresh and locally sourced')
    quantity = data.get('quantity', 0)  # Default quantity is 0

    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop. Create a shop first."), 400
    
    if not name or price is None:
        return jsonify(message="Product name and price are required"), 400
    
    try:
        price = float(price)
        if price <= 0:
            raise ValueError
    except ValueError:
        return jsonify(message="Invalid price format"), 400

    # Create product with only the columns that exist in the database
    new_product = Product(
        name=name, 
        price=price, 
        image_url=image_url, 
        shop_id=shop.id,
        quantity=quantity
    )
    
    # Try to set additional attributes if they exist in the model
    try:
        if hasattr(new_product, 'category'):
            new_product.category = category
        if hasattr(new_product, 'discount_percentage'):
            new_product.discount_percentage = float(discount_percentage)
        if hasattr(new_product, 'featured'):
            new_product.featured = featured
        if hasattr(new_product, 'unit'):
            new_product.unit = unit
        if hasattr(new_product, 'description'):
            new_product.description = description
    except Exception as e:
        print(f"Error setting product attributes: {e}")
    
    db.session.add(new_product)
    db.session.commit()
    
    # Return the created product with default values for missing columns
    product_data = {
        'id': new_product.id,
        'name': new_product.name,
        'price': new_product.price,
        'image_url': new_product.image_url,
        'shop_id': new_product.shop_id,
        'shop_name': shop.name,
        'category': category,
        'discount_percentage': discount_percentage,
        'featured': featured,
        'unit': unit,
        'description': description,
        'sold_count': 0,
        'quantity': new_product.quantity
    }
    
    return jsonify({
        'message': "Product added successfully",
        'product_id': new_product.id,
        'product': product_data
    }), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    data = request.get_json()
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop."), 403

    product = Product.query.filter_by(id=product_id, shop_id=shop.id).first()
    if not product:
        return jsonify(message="Product not found or does not belong to this shop"), 404

    # Update basic fields that are guaranteed to exist
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        try:
            price = float(data['price'])
            if price <= 0: raise ValueError
            product.price = price
        except ValueError:
            return jsonify(message="Invalid price format"), 400
    if 'image_url' in data:
        product.image_url = data['image_url']
    if 'quantity' in data:
        try:
            quantity = int(data['quantity'])
            if quantity < 0: raise ValueError
            product.quantity = quantity
        except ValueError:
            return jsonify(message="Invalid quantity format"), 400
    
    # Update all fields
    try:
        # Update category field
        if 'category' in data:
            product.category = data['category']
        
        # Update discount_percentage field
        if 'discount_percentage' in data:
            try:
                discount = float(data['discount_percentage'])
                if discount < 0 or discount > 100: raise ValueError
                product.discount_percentage = discount
            except ValueError:
                return jsonify(message="Invalid discount percentage"), 400
        
        # Update featured field
        if 'featured' in data:
            product.featured = bool(data['featured'])
        
        # Update unit field
        if 'unit' in data:
            product.unit = data['unit']
        
        # Update description field
        if 'description' in data:
            product.description = data['description']
    except Exception as e:
        print(f"Error updating product attributes: {e}")
    
    db.session.commit()
    
    # Return the updated product with all fields
    product_data = {
        'id': product.id,
        'name': product.name,
        'price': product.price,
        'image_url': product.image_url,
        'shop_id': product.shop_id,
        'shop_name': product.shop.name,
        'quantity': product.quantity,
        'category': product.category,
        'discount_percentage': product.discount_percentage,
        'featured': product.featured,
        'unit': product.unit,
        'description': product.description,
        'sold_count': product.sold_count
    }
    
    return jsonify(product_data), 200

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@admin_required
def delete_product(product_id):
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop."), 403

    product = Product.query.filter_by(id=product_id, shop_id=shop.id).first()
    if not product:
        return jsonify(message="Product not found or does not belong to this shop"), 404
        
    db.session.delete(product)
    db.session.commit()
    return jsonify(message="Product deleted successfully"), 200


@app.route('/api/shops/<int:shop_id>/products', methods=['GET'])
def get_products_by_shop(shop_id):
    shop = Shop.query.get(shop_id)
    if not shop:
        return jsonify(message="Shop not found"), 404
    
    products = Product.query.filter_by(shop_id=shop_id).all()
    
    result = []
    for p in products:
        product_data = {
            'id': p.id, 
            'name': p.name, 
            'price': p.price, 
            'image_url': p.image_url,
            'shop_id': p.shop_id,
            'shop_name': shop.name,
            'city': shop.city,
            'quantity': p.quantity,
            'category': p.category,
            'discount_percentage': p.discount_percentage,
            'featured': p.featured,
            'unit': p.unit,
            'description': p.description,
            'sold_count': p.sold_count
        }
            
        result.append(product_data)
    
    return jsonify(result), 200

@app.route('/api/products', methods=['GET'])
def get_all_products():
    """Get all products with shop information - public endpoint, no auth required"""
    products = Product.query.all()
    
    if not products:
        return jsonify(message="No products found"), 404
    
    # Get shop information for each product
    result = []
    for p in products:
        shop = Shop.query.get(p.shop_id)
        
        # Add default values for columns that might not exist in the database
        product_data = {
            'id': p.id,
            'name': p.name,
            'price': p.price,
            'image_url': p.image_url,
            'shop_id': p.shop_id,
            'shop_name': shop.name,
            'city': shop.city,
            'category': 'Vegetables',  # Default category
            'discount_percentage': 0,  # Default discount
            'featured': False,  # Default featured status
            'unit': 'kg',  # Default unit for produce
            'description': 'Fresh and locally sourced',  # Default description
            'sold_count': 0,  # Default sold count
            'quantity': p.quantity  # Available quantity
        }
        
        # Try to access attributes that might not exist in the database
        try:
            if hasattr(p, 'category') and p.category:
                product_data['category'] = p.category
            if hasattr(p, 'discount_percentage') and p.discount_percentage is not None:
                product_data['discount_percentage'] = p.discount_percentage
            if hasattr(p, 'featured') and p.featured is not None:
                product_data['featured'] = p.featured
            if hasattr(p, 'unit') and p.unit:
                product_data['unit'] = p.unit
            if hasattr(p, 'description') and p.description:
                product_data['description'] = p.description
            if hasattr(p, 'sold_count') and p.sold_count is not None:
                product_data['sold_count'] = p.sold_count
        except Exception as e:
            print(f"Error accessing product attributes: {e}")
            
        result.append(product_data)
    
    return jsonify(result), 200

@app.route('/api/products/city/<city_name>', methods=['GET'])
def get_products_by_city(city_name):
    # Find shops in the city
    shops_in_city = Shop.query.filter(Shop.city.ilike(f"%{city_name}%")).all()
    if not shops_in_city:
        return jsonify(message=f"No shops found in {city_name}, hence no products."), 404

    shop_ids = [shop.id for shop in shops_in_city]
    products = Product.query.filter(Product.shop_id.in_(shop_ids)).all()
    
    if not products:
        return jsonify(message=f"No products found in {city_name}"), 404

    result = []
    for p in products:
        product_data = {
            'id': p.id, 
            'name': p.name, 
            'price': p.price, 
            'image_url': p.image_url,
            'shop_id': p.shop_id,
            'shop_name': p.shop.name,
            'city': p.shop.city,
            'category': 'Vegetables',  # Default category
            'discount_percentage': 0,  # Default discount
            'featured': False,  # Default featured status
            'unit': 'kg',  # Default unit for produce
            'description': 'Fresh and locally sourced',  # Default description
            'sold_count': 0,  # Default sold count
            'quantity': p.quantity  # Available quantity
        }
        
        # Try to access attributes that might not exist in the database
        try:
            if hasattr(p, 'category') and p.category:
                product_data['category'] = p.category
            if hasattr(p, 'discount_percentage') and p.discount_percentage is not None:
                product_data['discount_percentage'] = p.discount_percentage
            if hasattr(p, 'featured') and p.featured is not None:
                product_data['featured'] = p.featured
            if hasattr(p, 'unit') and p.unit:
                product_data['unit'] = p.unit
            if hasattr(p, 'description') and p.description:
                product_data['description'] = p.description
            if hasattr(p, 'sold_count') and p.sold_count is not None:
                product_data['sold_count'] = p.sold_count
        except Exception as e:
            print(f"Error accessing product attributes: {e}")
            
        result.append(product_data)
    
    return jsonify(result), 200


# --- Order Routes ---
@app.route('/api/orders', methods=['POST'])
@customer_required
def place_order():
    data = request.get_json()
    cart_items = data.get('items') # Expected format: [{"product_id": X, "quantity": Y}, ...]
    payment_info = data.get('payment', {})
    address_id = data.get('address_id')
    
    current_user_email = get_jwt_identity()
    customer = User.query.filter_by(email=current_user_email).first()

    if not cart_items:
        return jsonify(message="Cart is empty"), 400
    
    # Validate address
    if not address_id:
        return jsonify(message="Delivery address is required"), 400
    
    address = Address.query.filter_by(id=address_id, user_id=customer.id).first()
    if not address:
        return jsonify(message="Invalid delivery address"), 400

    # Create new order with address and payment info
    new_order = Order(
        customer_id=customer.id, 
        address_id=address.id,
        total_amount=0, # Total amount calculated later
        payment_method=payment_info.get('method'),
        payment_transaction_id=payment_info.get('transaction_id')
    )
    
    db.session.add(new_order)
    db.session.flush() # To get new_order.id

    total_order_amount = 0

    for item_data in cart_items:
        product = Product.query.get(item_data.get('product_id'))
        quantity = item_data.get('quantity')

        if not product or not isinstance(quantity, int) or quantity <= 0:
            db.session.rollback() # Important: rollback if any item is invalid
            return jsonify(message=f"Invalid product or quantity for product ID {item_data.get('product_id')}."), 400
            
        # Check if there's enough quantity available
        if product.quantity < quantity:
            db.session.rollback()
            return jsonify(message=f"Not enough quantity available for {product.name}. Available: {product.quantity}, Requested: {quantity}"), 400
        
        # Add to order_items association
        stmt = order_items.insert().values(
            order_id=new_order.id, 
            product_id=product.id, 
            quantity=quantity,
            shop_id=product.shop_id # Store shop_id with the item
        )
        db.session.execute(stmt)
        
        # Reduce product quantity immediately when order is placed
        product.quantity -= quantity
        
        # Calculate price (considering any discounts)
        item_price = product.price
        if hasattr(product, 'discount_percentage') and product.discount_percentage > 0:
            item_price = item_price * (1 - (product.discount_percentage / 100))
            
        total_order_amount += item_price * quantity
    
    # Add COD fee if applicable
    if payment_info.get('method') == 'cod':
        total_order_amount += 40  # ₹40 COD fee
    
    new_order.total_amount = total_order_amount
    db.session.commit()

    return jsonify(
        message="Order placed successfully", 
        order_id=new_order.id, 
        total_amount=new_order.total_amount,
        delivery_address={
            'full_name': address.full_name,
            'street_address': address.street_address,
            'city': address.city,
            'state': address.state,
            'postal_code': address.postal_code
        }
    ), 201

@app.route('/api/orders/customer', methods=['GET'])
@customer_required
def get_customer_orders():
    current_user_email = get_jwt_identity()
    customer = User.query.filter_by(email=current_user_email).first()
    
    orders = Order.query.filter_by(customer_id=customer.id).order_by(Order.created_at.desc()).all()
    
    result = []
    for order in orders:
        order_data = {
            'id': order.id,
            'created_at': order.created_at.isoformat(),
            'total_amount': order.total_amount,
            'status': order.status,
            'payment_method': order.payment_method,
            'payment_transaction_id': order.payment_transaction_id,
            'items': []
        }
        
        # Add address information if available
        if order.address_id:
            address = Address.query.get(order.address_id)
            if address:
                order_data['delivery_address'] = {
                    'id': address.id,
                    'full_name': address.full_name,
                    'street_address': address.street_address,
                    'city': address.city,
                    'state': address.state,
                    'postal_code': address.postal_code,
                    'phone_number': address.phone_number
                }
        
        # Fetch items for this order
        items_in_order = db.session.query(Product, order_items.c.quantity).\
            join(order_items, Product.id == order_items.c.product_id).\
            filter(order_items.c.order_id == order.id).all()
        
        for product, quantity in items_in_order:
            order_data['items'].append({
                'product_id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': quantity,
                'shop_id': product.shop_id
            })
        result.append(order_data)
        
    return jsonify(result), 200

@app.route('/api/orders/shop', methods=['GET'])
@admin_required
def get_shop_orders():
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()

    if not shop:
        return jsonify(message="Admin does not have a shop."), 404

    # Find orders that contain products from this admin's shop
    # This query is a bit more complex as orders can span multiple shops if cart allows.
    # For simplicity, this version assumes an order item is tied to a shop_id in order_items.
    
    order_ids_with_shop_items = db.session.query(order_items.c.order_id).\
        filter(order_items.c.shop_id == shop.id).distinct().all()
    
    if not order_ids_with_shop_items:
        return jsonify([]), 200 # No orders for this shop

    actual_order_ids = [oid[0] for oid in order_ids_with_shop_items]
    
    orders = Order.query.filter(Order.id.in_(actual_order_ids)).order_by(Order.created_at.desc()).all()

    result = []
    for order in orders:
        order_data = {
            'id': order.id,
            'customer_id': order.customer_id,
            'customer_name': order.customer.name, # Assuming backref works
            'customer_city': order.customer.city,
            'created_at': order.created_at.isoformat(),
            'total_amount': order.total_amount, # This is total for the whole order
            'status': order.status,
            'items_for_this_shop': []
        }
        
        # Fetch items specific to this shop for this order
        items_for_shop_in_order = db.session.query(Product, order_items.c.quantity).\
            join(order_items, Product.id == order_items.c.product_id).\
            filter(order_items.c.order_id == order.id, order_items.c.shop_id == shop.id).all()
            
        shop_specific_total = 0
        for product, quantity in items_for_shop_in_order:
            order_data['items_for_this_shop'].append({
                'product_id': product.id,
                'name': product.name,
                'price': product.price,
                'quantity': quantity,
                'image_url': product.image_url if hasattr(product, 'image_url') else None
            })
            shop_specific_total += product.price * quantity
        
        order_data['shop_specific_total_amount'] = shop_specific_total
        result.append(order_data)
        
    return jsonify(result), 200

@app.route('/api/orders/<int:order_id>/status', methods=['PUT'])
@admin_required
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('status')
    
    if not new_status:
        return jsonify(message="New status is required"), 400
        
    # Validate status value
    valid_statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify(message=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"), 400
    
    # Get current user's shop
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()
    
    if not shop:
        return jsonify(message="Admin does not have a shop."), 403
    
    # Check if order exists and contains items from this shop
    order_has_shop_items = db.session.query(order_items).\
        filter(order_items.c.order_id == order_id, order_items.c.shop_id == shop.id).first()
    
    if not order_has_shop_items:
        return jsonify(message="Order not found or does not contain items from your shop"), 404
    
    # Update order status
    order = Order.query.get(order_id)
    if not order:
        return jsonify(message="Order not found"), 404
    
    # If status is changing to "Shipped", reduce product quantities
    if new_status == 'Shipped' and order.status != 'Shipped':
        # Get all items in this order for this shop
        order_items_for_shop = db.session.query(order_items).filter(
            order_items.c.order_id == order_id,
            order_items.c.shop_id == shop.id
        ).all()
        
        for item in order_items_for_shop:
            product = Product.query.get(item.product_id)
            if product:
                # Check if there's enough quantity
                if product.quantity < item.quantity:
                    return jsonify(message=f"Not enough quantity for product {product.name}. Available: {product.quantity}, Required: {item.quantity}"), 400
                
                # Reduce the quantity
                product.quantity -= item.quantity
        
    order.status = new_status
    db.session.commit()
    
    return jsonify(message=f"Order status updated to {new_status}", order_id=order_id, status=new_status), 200

@app.route('/api/orders/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    try:
        # Get the current user
        current_user_email = get_jwt_identity()
        current_user = User.query.filter_by(email=current_user_email).first()
        
        if not current_user:
            return jsonify(message="User not found"), 404
        
        # Get the order
        order = Order.query.get(order_id)
        if not order:
            return jsonify(message="Order not found"), 404
        
        # Check if user is authorized to cancel this order
        # Customers can only cancel their own orders
        if current_user.role == 'customer':
            if order.customer_id != current_user.id:
                return jsonify(message="Unauthorized to cancel this order"), 403
        # Shop owners can cancel orders containing their products
        elif current_user.role == 'shop_owner':
            shop = Shop.query.filter_by(owner_id=current_user.id).first()
            if not shop:
                return jsonify(message="Shop not found for this owner"), 404
                
            # Check if this shop has any items in the order
            order_has_shop_items = db.session.query(order_items).\
                filter(order_items.c.order_id == order_id, order_items.c.shop_id == shop.id).first()
            if not order_has_shop_items:
                return jsonify(message="Order does not contain items from your shop"), 403
        else:
            return jsonify(message="Unauthorized to cancel orders"), 403
        
        # Check if order can be cancelled (not delivered or already cancelled)
        if order.status == 'Delivered':
            return jsonify(message="Cannot cancel a delivered order"), 400
        
        if order.status == 'Cancelled':
            return jsonify(message="Order is already cancelled"), 400
        
        # Update the order status to Cancelled
        order.status = 'Cancelled'
        db.session.commit()
        
        return jsonify(
            message="Order cancelled successfully",
            order_id=order.id,
            status=order.status
        ), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"Error cancelling order: {str(e)}")
        return jsonify(message=f"Error cancelling order: {str(e)}"), 500

@app.route('/api/admin/analytics', methods=['GET'])
@admin_required
def get_shop_analytics():
    """
    Get analytics data for the admin's shop
    Returns:
        - Total sales
        - Total orders
        - Active customers
        - Average order value
        - Revenue data (daily/weekly)
        - Order status breakdown
        - Top selling products
    """
    current_user_email = get_jwt_identity()
    owner = User.query.filter_by(email=current_user_email).first()
    shop = Shop.query.filter_by(owner_id=owner.id).first()
    
    if not shop:
        return jsonify(message="Admin does not have a shop."), 404
    
    # Get time range from query parameters (default to last 30 days)
    days = request.args.get('days', 30, type=int)
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Find orders that contain products from this shop
    order_ids_with_shop_items = db.session.query(order_items.c.order_id).\
        filter(order_items.c.shop_id == shop.id).distinct().all()
    
    if not order_ids_with_shop_items:
        # Return empty analytics if no orders
        return jsonify({
            'totalSales': 0,
            'totalOrders': 0,
            'activeCustomers': 0,
            'averageOrderValue': 0,
            'revenueData': [],
            'orderStatusData': {},
            'topProducts': []
        }), 200
    
    actual_order_ids = [oid[0] for oid in order_ids_with_shop_items]
    
    # Get orders within the time range
    orders = Order.query.filter(
        Order.id.in_(actual_order_ids),
        Order.created_at >= start_date
    ).order_by(Order.created_at.desc()).all()
    
    # Calculate total sales for this shop
    total_sales = 0
    order_values = []
    customer_ids = set()
    order_status_counts = {
        'Pending': 0,
        'Processing': 0,
        'Shipped': 0,
        'Delivered': 0,
        'Cancelled': 0
    }
    
    # Group revenue by date
    revenue_by_date = {}
    
    for order in orders:
        # Get items for this shop in this order
        items_for_shop = db.session.query(Product, order_items.c.quantity).\
            join(order_items, Product.id == order_items.c.product_id).\
            filter(order_items.c.order_id == order.id, order_items.c.shop_id == shop.id).all()
        
        # Calculate shop-specific total for this order
        shop_specific_total = sum(product.price * quantity for product, quantity in items_for_shop)
        
        # Add to total sales
        total_sales += shop_specific_total
        
        # Add to order values for average calculation
        if shop_specific_total > 0:
            order_values.append(shop_specific_total)
        
        # Add customer to unique customers set
        customer_ids.add(order.customer_id)
        
        # Count order status
        if order.status in order_status_counts:
            order_status_counts[order.status] += 1
        
        # Add to revenue by date
        order_date = order.created_at.date().isoformat()
        if order_date in revenue_by_date:
            revenue_by_date[order_date] += shop_specific_total
        else:
            revenue_by_date[order_date] = shop_specific_total
    
    # Calculate average order value
    avg_order_value = sum(order_values) / len(order_values) if order_values else 0
    
    # Format revenue data for chart
    revenue_data = [{'date': date, 'revenue': revenue} for date, revenue in revenue_by_date.items()]
    revenue_data.sort(key=lambda x: x['date'])  # Sort by date
    
    # Get top selling products
    top_products_query = db.session.query(
        Product,
        db.func.sum(order_items.c.quantity).label('total_quantity'),
        db.func.sum(Product.price * order_items.c.quantity).label('total_revenue')
    ).\
    join(order_items, Product.id == order_items.c.product_id).\
    filter(
        order_items.c.shop_id == shop.id,
        order_items.c.order_id.in_(actual_order_ids)
    ).\
    group_by(Product.id).\
    order_by(db.text('total_quantity DESC')).\
    limit(5).all()
    
    top_products = [
        {
            'id': product.id,
            'name': product.name,
            'sales': int(total_quantity),
            'revenue': float(total_revenue)
        }
        for product, total_quantity, total_revenue in top_products_query
    ]
    
    # Prepare response
    analytics_data = {
        'totalSales': float(total_sales),
        'totalOrders': len(orders),
        'activeCustomers': len(customer_ids),
        'averageOrderValue': float(avg_order_value),
        'revenueData': revenue_data,
        'orderStatusData': order_status_counts,
        'topProducts': top_products
    }
    
    return jsonify(analytics_data), 200


# --- Error Handlers ---
@app.errorhandler(500)
def handle_500_error(e):
    response = jsonify({"message": "Internal server error", "error": str(e)})
    response.status_code = 500
    return response

@app.errorhandler(404)
def handle_404_error(e):
    response = jsonify({"message": "Resource not found", "error": str(e)})
    response.status_code = 404
    return response

# Removed the after_request handler as CORS is now handled by Flask-CORS extension

# --- Main Execution ---
if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Create database tables if they don't exist
    app.run(debug=True, host='0.0.0.0', port=5000) # Run on port 5000
    