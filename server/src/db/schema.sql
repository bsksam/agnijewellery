-- Jewelry Management System Schema (Production Grade)

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    hsn_code TEXT,
    tax_percent REAL DEFAULT 3.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER REFERENCES categories(id),
    name TEXT NOT NULL,
    purity TEXT,
    mc_per_gram REAL DEFAULT 0,
    wastage_percent REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Daily Rates
CREATE TABLE IF NOT EXISTS daily_rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE DEFAULT CURRENT_DATE,
    metal TEXT NOT NULL,
    purity TEXT NOT NULL,
    selling_rate REAL NOT NULL,
    buying_rate REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(date, metal, purity)
);

-- Stock (Tags)
CREATE TABLE IF NOT EXISTS stock (
    tag_no TEXT PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    gross_weight REAL NOT NULL,
    net_weight REAL NOT NULL,
    stone_weight REAL DEFAULT 0,
    stone_value REAL DEFAULT 0,
    making_charge_per_gram REAL DEFAULT 0,
    wastage_percent REAL DEFAULT 0,
    status TEXT DEFAULT 'AVAILABLE',
    show_in_gallery BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sales
CREATE TABLE IF NOT EXISTS sales (
    bill_no TEXT PRIMARY KEY,
    bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    customer_name TEXT,
    customer_mobile TEXT,
    gross_amount REAL NOT NULL,
    tax_amount REAL DEFAULT 0,
    discount_amount REAL DEFAULT 0,
    net_amount REAL NOT NULL,
    payment_mode TEXT,
    staff_id TEXT,
    total_weight REAL DEFAULT 0,
    remarks TEXT
);

-- Sales Items
CREATE TABLE IF NOT EXISTS sales_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_no TEXT REFERENCES sales(bill_no),
    tag_no TEXT REFERENCES stock(tag_no),
    product_id INTEGER REFERENCES products(id),
    weight REAL NOT NULL,
    rate REAL NOT NULL,
    wastage REAL DEFAULT 0,
    mc REAL DEFAULT 0,
    stone_value REAL DEFAULT 0,
    total_amount REAL NOT NULL
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    mobile TEXT UNIQUE NOT NULL,
    gstin TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Repairs
CREATE TABLE IF NOT EXISTS repairs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_card_no TEXT UNIQUE,
    customer_name TEXT,
    customer_mobile TEXT,
    item_description TEXT,
    estimated_cost REAL,
    advance_paid REAL,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders (Special Orders)
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE,
    customer_name TEXT,
    customer_mobile TEXT,
    order_details TEXT,
    advance_paid REAL,
    status TEXT DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Savings Schemes
CREATE TABLE IF NOT EXISTS customer_schemes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT,
    customer_mobile TEXT,
    scheme_id INTEGER,
    account_no TEXT UNIQUE,
    start_date DATETIME,
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Scheme Payments
CREATE TABLE IF NOT EXISTS scheme_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_scheme_id INTEGER,
    amount REAL,
    installment_no INTEGER,
    payment_mode TEXT,
    receipt_no TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Buybacks
CREATE TABLE IF NOT EXISTS buybacks (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_mobile TEXT,
    total_weight REAL NOT NULL,
    total_value REAL NOT NULL,
    payment_mode TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS buyback_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyback_id TEXT REFERENCES buybacks(id),
    karat TEXT,
    weight REAL NOT NULL,
    purity_percent REAL DEFAULT 100,
    rate_applied REAL NOT NULL,
    value REAL NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed Admin
INSERT OR IGNORE INTO users (username, password_hash, role, name) 
VALUES ('admin', '$2a$10$Xm7W/Nf9v/Y6O6v7I4Z6ue8p3v5X/P6o7J9V9v7V9v7V9v7V9v7V6', 'admin', 'Agni Admin');
