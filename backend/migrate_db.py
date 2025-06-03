import os
import sys
import pymysql
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

# Database connection parameters
DB_HOST = 'localhost'
DB_PORT = 3306
DB_USER = 'root'
DB_PASSWORD = 'CSKsiva@66'  # From .env
DB_NAME = 'mini_mart_db'

def get_connection():
    try:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except pymysql.MySQLError as e:
        print(f"Error connecting to MySQL database: {e}")
        sys.exit(1)

def create_addresses_table():
    print("Creating addresses table...")
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Check if table exists
            cursor.execute("SHOW TABLES LIKE 'addresses'")
            if cursor.fetchone():
                print("Addresses table already exists.")
                return
            
            # Create addresses table
            cursor.execute('''
            CREATE TABLE addresses (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                full_name VARCHAR(255) NOT NULL,
                street_address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                postal_code VARCHAR(20) NOT NULL,
                phone_number VARCHAR(20) NOT NULL,
                is_default BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
        conn.commit()
        print("Addresses table created successfully.")
    except pymysql.MySQLError as e:
        print(f"Error creating addresses table: {e}")
    finally:
        conn.close()

def update_orders_table():
    print("Updating orders table...")
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Check if columns already exist
            cursor.execute("SHOW COLUMNS FROM orders LIKE 'address_id'")
            address_id_exists = cursor.fetchone() is not None
            
            cursor.execute("SHOW COLUMNS FROM orders LIKE 'payment_method'")
            payment_method_exists = cursor.fetchone() is not None
            
            cursor.execute("SHOW COLUMNS FROM orders LIKE 'payment_transaction_id'")
            payment_transaction_id_exists = cursor.fetchone() is not None
            
            # Add columns if they don't exist
            if not address_id_exists:
                cursor.execute('ALTER TABLE orders ADD COLUMN address_id INT')
                print("Added address_id column to orders table.")
            
            if not payment_method_exists:
                cursor.execute('ALTER TABLE orders ADD COLUMN payment_method VARCHAR(50)')
                print("Added payment_method column to orders table.")
            
            if not payment_transaction_id_exists:
                cursor.execute('ALTER TABLE orders ADD COLUMN payment_transaction_id VARCHAR(100)')
                print("Added payment_transaction_id column to orders table.")
            
            if not address_id_exists or not payment_method_exists or not payment_transaction_id_exists:
                print("Orders table updated successfully.")
            else:
                print("All required columns already exist in orders table.")
            
        conn.commit()
    except pymysql.MySQLError as e:
        print(f"Error updating orders table: {e}")
    finally:
        conn.close()

def main():
    print("Starting database migration...")
    create_addresses_table()
    update_orders_table()
    print("Database migration completed successfully.")

if __name__ == "__main__":
    main()