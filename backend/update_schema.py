#!/usr/bin/env python3
# backend/update_schema.py
import os
from urllib.parse import quote_plus
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

app = Flask(__name__)

# Database configuration
password = quote_plus('CSKsiva@66')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'mysql+pymysql://root:{password}@localhost:3306/mini_mart_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

def column_exists(connection, table, column):
    """Check if a column exists in a table"""
    try:
        result = connection.execute(f"SHOW COLUMNS FROM {table} LIKE '{column}'")
        return result.rowcount > 0
    except Exception as e:
        print(f"Error checking if column exists: {e}")
        return False

def add_columns_to_products():
    """Add new columns to the products table"""
    with app.app_context():
        connection = db.engine.connect()
        
        # Define columns to add: (column_name, data_type, default_value)
        columns_to_add = [
            ("category", "VARCHAR(50)", "'Vegetables'"),
            ("discount_percentage", "FLOAT", "0"),
            ("featured", "BOOLEAN", "FALSE"),
            ("unit", "VARCHAR(20)", "'kg'"),
            ("description", "TEXT", "NULL"),
            ("sold_count", "INT", "0"),
            ("quantity", "INT", "0")
        ]
        
        for column_name, data_type, default_value in columns_to_add:
            try:
                # Check if column exists
                if not column_exists(connection, "products", column_name):
                    # Add column if it doesn't exist
                    sql = f"ALTER TABLE products ADD COLUMN {column_name} {data_type} DEFAULT {default_value}"
                    connection.execute(sql)
                    print(f"Added column: {column_name}")
                else:
                    print(f"Column {column_name} already exists")
            except Exception as e:
                print(f"Error adding column {column_name}: {e}")
        
        connection.close()
        print("Schema update completed.")

if __name__ == "__main__":
    add_columns_to_products()