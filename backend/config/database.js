const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to the Architecture of Trust (SQLite DB).");

        // Create the users table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            reg_date TEXT DEFAULT CURRENT_TIMESTAMP
        )`, (tableErr) => {
            if (tableErr) {
                console.error("Error creating users table:", tableErr.message);
            } else {
                console.log("Users table is verified and ready.");
            }
        });
        
        // Create the orders table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            total_price REAL NOT NULL,
            order_date TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )`, (tableErr) => {
            if (tableErr) {
                console.error("Error creating orders table:", tableErr.message);
            } else {
                console.log("Orders table is verified and ready.");
            }
        });
    }
});

module.exports = db;
