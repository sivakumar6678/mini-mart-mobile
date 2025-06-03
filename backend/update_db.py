import os
import pymysql
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

# Database connection parameters - using the same as in app.py
password = 'CSKsiva@66'  # Not URL encoded for direct connection
db_name = 'mini_mart_db'
host = 'localhost'
user = 'root'
port = 3306

# Connect to the database
try:
    conn = pymysql.connect(
        host=host,
        user=user,
        password=password,
        database=db_name,
        port=int(port)
    )
    
    cursor = conn.cursor()
    
    # Check if the addresses table exists
    cursor.execute("SHOW TABLES LIKE 'addresses'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        # Check if the columns already exist
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'full_name'")
        full_name_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'street_address'")
        street_address_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'city'")
        city_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'state'")
        state_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'postal_code'")
        postal_code_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'phone_number'")
        phone_number_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'is_default'")
        is_default_exists = cursor.fetchone()
        
        cursor.execute("SHOW COLUMNS FROM addresses LIKE 'created_at'")
        created_at_exists = cursor.fetchone()
        
        # Add missing columns
        if not full_name_exists:
            print("Adding full_name column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN full_name VARCHAR(100) NOT NULL")
        
        if not street_address_exists:
            print("Adding street_address column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN street_address VARCHAR(255) NOT NULL")
        
        if not city_exists:
            print("Adding city column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN city VARCHAR(100) NOT NULL")
        
        if not state_exists:
            print("Adding state column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN state VARCHAR(100) NOT NULL")
        
        if not postal_code_exists:
            print("Adding postal_code column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN postal_code VARCHAR(20) NOT NULL")
        
        if not phone_number_exists:
            print("Adding phone_number column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN phone_number VARCHAR(20) NOT NULL")
        
        if not is_default_exists:
            print("Adding is_default column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN is_default BOOLEAN DEFAULT FALSE")
        
        if not created_at_exists:
            print("Adding created_at column to addresses table...")
            cursor.execute("ALTER TABLE addresses ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
        
        conn.commit()
        print("Database schema updated successfully!")
    else:
        # Create the addresses table
        print("Creating addresses table...")
        cursor.execute("""
        CREATE TABLE addresses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            street_address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            postal_code VARCHAR(20) NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            is_default BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """)
        conn.commit()
        print("Addresses table created successfully!")
    
except Exception as e:
    print(f"Error: {e}")
finally:
    if 'conn' in locals():
        conn.close()