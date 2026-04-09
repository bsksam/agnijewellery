import sqlite3
import pyodbc
import os
import sys

def get_mssql_connection():
    # Attempting the primary location found during search
    txt_path = r"F:\SAMBATH\Agni_Jewallary\bin\Debug\ConnectData.txt"
    if not os.path.exists(txt_path):
        print(f"Error: Connection file not found at {txt_path}")
        return None
    
    try:
        with open(txt_path, 'r') as f:
            line = f.readline().strip()
            # If the file already contains a full connection string with "Data Source="
            if "Data Source=" in line:
                # Map "Data Source" to "Server" and "Initial Catalog" to "Database" for ODBC
                line = line.replace("Data Source=", "Server=")
                line = line.replace("Initial Catalog=", "Database=")
                # Map User ID and Password to UID and PWD for ODBC
                line = line.replace("User Id=", "UID=")
                line = line.replace("Password=", "PWD=")
                # Remove Integrated Security to force SQL Authentication (using sa/PWD)
                line = line.replace("Integrated Security=True;", "")
                line = line.replace("Integrated Security=True", "")
                # Remove any trailing "N" or other artifacts
                if line.endswith(";N"):
                    line = line[:-2]
                
                if "DRIVER=" not in line:
                    line = "DRIVER={SQL Server};" + line
                return pyodbc.connect(line)
            
            parts = line.split(';')
            if len(parts) >= 4:
                server = parts[0]
                user = parts[1]
                pwd = parts[2]
                db = parts[3]
                conn_str = f"DRIVER={{SQL Server}};SERVER={server};DATABASE={db};UID={user};PWD={pwd}"
                return pyodbc.connect(conn_str)
            else:
                print(f"Error: Invalid connection string format in {txt_path}")
                return None
    except Exception as e:
        print(f"Failed to connect to MSSQL: {e}")
        return None

def migrate():
    print("Starting Migration...")
    
    mssql_conn = get_mssql_connection()
    if not mssql_conn:
        return
    
    sqlite_path = "jewel.db"
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_cursor = sqlite_conn.cursor()
    
    mssql_cursor = mssql_conn.cursor()
    
    try:
        # 1. Migrate Categories
        print("Migrating Categories...")
        mssql_cursor.execute("SELECT DISTINCT CatName FROM CatMaster")
        categories = mssql_cursor.fetchall()
        for cat in categories:
            cat_name = cat[0]
            sqlite_cursor.execute(
                "INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)",
                (cat_name, f"Legacy Category: {cat_name}")
            )
        
        # 2. Migrate Products
        print("Migrating Products...")
        mssql_cursor.execute("""
            SELECT ProId, MetName, CatName, ProductName 
            FROM ProductTree 
            WHERE Active = 'Y'
        """)
        products = mssql_cursor.fetchall()
        for pro in products:
            legacy_id, met_name, cat_name, name = pro
            
            # Get new category ID
            sqlite_cursor.execute("SELECT id FROM categories WHERE name = ?", (cat_name,))
            cat_row = sqlite_cursor.fetchone()
            category_id = cat_row[0] if cat_row else 1
            
            sqlite_cursor.execute("""
                INSERT OR IGNORE INTO products (category_id, name, mc_per_gram, wastage_percent)
                VALUES (?, ?, ?, ?)
            """, (category_id, name, 0, 0))

        # 3. Migrate Active Stock (Tags)
        print("Migrating Stock Tags...")
        mssql_cursor.execute("""
            SELECT TagNo, ProductName, GrsWeight, NetWeight, LessWt, StoneValue, 
                   MaxWastagePer, MaxMcGr 
            FROM Tag 
            WHERE CANCEL = 'N'
        """)
        tags = mssql_cursor.fetchall()
        count = 0
        for tag in tags:
            tag_no, pro_name, grs, net, less, stone_val, wastage, mc = tag
            
            # Find our new product_id by name
            sqlite_cursor.execute("SELECT id FROM products WHERE name = ?", (pro_name,))
            pro_row = sqlite_cursor.fetchone()
            if not pro_row:
                continue
            
            product_id = pro_row[0]
            
            # Convert decimal types to float for SQLite compatibility
            grs_f = float(grs) if grs is not None else 0.0
            net_f = float(net) if net is not None else 0.0
            less_f = float(less) if less is not None else 0.0
            stone_f = float(stone_val) if stone_val is not None else 0.0
            wast_f = float(wastage) if wastage is not None else 0.0
            mc_f = float(mc) if mc is not None else 0.0
            
            sqlite_cursor.execute("""
                INSERT OR IGNORE INTO stock (
                    tag_no, product_id, gross_weight, net_weight, 
                    stone_weight, stone_value, wastage_percent, 
                    making_charge_per_gram, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')
            """, (tag_no, product_id, grs_f, net_f, less_f, stone_f, wast_f, mc_f))
            count += 1
            
        sqlite_conn.commit()
        print(f"Migration successful! Migrated {len(categories)} categories, {len(products)} products, and {count} tags.")

    except Exception as e:
        print(f"Migration failed: {e}")
        sqlite_conn.rollback()

    finally:
        mssql_conn.close()
        sqlite_conn.close()

if __name__ == "__main__":
    migrate()
