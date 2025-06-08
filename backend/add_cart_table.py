#!/usr/bin/env python3

"""
Database migration script to add the cart table
"""

import sqlite3
from datetime import datetime

def add_cart_table():
    """Add cart table to the database"""
    try:
        # Connect to the database
        conn = sqlite3.connect('mini_mart.db')
        cursor = conn.cursor()
        
        # Check if cart table already exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='cart'
        """)
        
        if cursor.fetchone():
            print("✅ Cart table already exists")
            conn.close()
            return
        
        # Create cart table
        cursor.execute("""
            CREATE TABLE cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id),
                FOREIGN KEY (product_id) REFERENCES products (id),
                UNIQUE(user_id, product_id)
            )
        """)
        
        # Create trigger to update updated_at column
        cursor.execute("""
            CREATE TRIGGER update_cart_updated_at 
            AFTER UPDATE ON cart
            BEGIN
                UPDATE cart SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END
        """)
        
        conn.commit()
        print("✅ Cart table created successfully")
        
        # Verify the table was created
        cursor.execute("SELECT sql FROM sqlite_master WHERE name='cart'")
        table_schema = cursor.fetchone()
        if table_schema:
            print("📋 Cart table schema:")
            print(table_schema[0])
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    print("🔄 Adding cart table to database...")
    add_cart_table()
    print("✅ Migration completed!")