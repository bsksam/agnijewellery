import sqlite3
import os

db_path = 'jewel.db'
schema_path = 'src/db/schema.sql'

def init_db():
    if not os.path.exists(schema_path):
        print(f"Error: {schema_path} not found.")
        return

    connection = sqlite3.connect(db_path)
    with open(schema_path, 'r') as f:
        schema = f.read()
    
    try:
        connection.executescript(schema)
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        connection.close()

if __name__ == '__main__':
    init_db()
