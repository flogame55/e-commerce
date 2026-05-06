require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const productRoutes = require('./routes/products');
const fs = require('fs');

const app = express();
const PORT = 3000;

// --- 1. PRE-FLIGHT SECURITY CHECK ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1); // Stop server if security key is missing
}

// --- 2. DATABASE CONFIGURATION ---
const dbPath = path.join(__dirname, 'database.db');
const authFile = path.join(__dirname, 'data/auth_user.json');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to the Architecture of Trust (SQLite DB).");

        // Create the table if it doesn't exist
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
    }
});

// --- 3. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// --- 4. CATEGORY FILTER ROUTE (Optimized) ---
const allowedCategories = ['Vegetables', 'Fruits', 'Juice', 'Dried', 'Hat', 'All'];

const gatekeeper = (req, res, next) => {
    const requestedCategory = req.query.category;
    if (requestedCategory && allowedCategories.includes(requestedCategory)) {
        next();
    } else {
        res.status(403).json({ status: "Fail", message: "Invalid Category Envelope" });
    }
};

app.get('/api/products/filter', gatekeeper, (req, res) => {
    const category = req.query.category;

    // Use the global 'db' connection instead of creating a new one
    let sql = "SELECT * FROM products";
    let params = [];

    if (category && category !== 'All') {
        sql += " WHERE category = ?";
        params.push(category);
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(500).json({ status: "Fail", error: err.message });
        } else {
            res.status(200).json(rows);
        }
        // REMOVED db.close() - Keep the connection alive for other users!
    });
});


// --- 5. AUTHENTICATION ROUTES (JSON-ONLY VERSION) ---

// A. Registration Logic
app.post('/api/register', async (req, res) => {
    const { first_name, email, password } = req.body;

    // logic: Validation (Minimum requirements from homework)
    if (!first_name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Hash password before storing (Best Practice)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save back to SQLite Database
        const sql = `INSERT INTO users (first_name, email, password_hash) VALUES (?, ?, ?)`;
        db.run(sql, [first_name, email, hashedPassword], function(err) {
            if (err) {
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(400).json({ message: "User already exists in Database!" });
                }
                console.error("Registration DB Error:", err.message);
                return res.status(500).json({ message: "Failed to save to database" });
            }
            res.status(201).json({ status: "Success", message: "User registered in database" });
        });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// B. Login Logic
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Query SQLite Database for User
        db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
            if (err) {
                console.error("Login DB Error:", err.message);
                return res.status(500).json({ message: "Server Error" });
            }

            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Compare provided password with hashed password in DB
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
                // Issue JWT Passport
                const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

                return res.status(200).json({
                    status: "Success",
                    token: token,
                    user: { id: user.id, first_name: user.first_name, email: user.email }
                });
            } else {
                return res.status(401).json({ message: "Invalid email or password" });
            }
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

// Helper function to securely save an order using parameterized queries to prevent SQL Injection
const saveOrderToDB = (orderData) => {
    return new Promise((resolve, reject) => {
        const { user_id, product_id, quantity, total_price } = orderData;

        // Parameterized query using '?' placeholders
        const sql = `INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)`;

        db.run(sql, [user_id, product_id, quantity, total_price], function (err) {
            if (err) {
                console.error("Database Insert Error:", err.message);
                reject(err);
            } else {
                // this.lastID contains the ID of the newly inserted row
                resolve({ success: true, id: this.lastID });
            }
        });
    });
};

/**
 * @route   POST /api/checkout
 * @desc    Atomic Transaction: Validate, Save relational Order items, and Update Stock
 */
app.post('/api/checkout', async (req, res) => {
    const { user_id, cartItems } = req.body; // Expecting user_id now instead of just email

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ status: "Fail", message: "Your cart is empty." });
    }

    if (!user_id) {
        return res.status(401).json({ status: "Fail", message: "Invalid Session" });
    }

    try {
        // Validate that user_id actually exists in the users table
        const userExists = await new Promise((resolve, reject) => {
            db.get("SELECT id FROM users WHERE id = ?", [user_id], (err, row) => {
                if (err) reject(err);
                else resolve(!!row);
            });
        });

        if (!userExists) {
            return res.status(401).json({ status: "Fail", message: "Invalid Session" });
        }
    } catch (err) {
        console.error("User Validation Error:", err);
        return res.status(500).json({ message: "Server Error" });
    }

    // 1. START ATOMIC TRANSACTION
    // This ensures if one item fails to save, the whole process rolls back.
    db.serialize(async () => {
        db.run("BEGIN TRANSACTION");

        try {
            for (const item of cartItems) {
                // Prepare data for the relational schema
                const orderData = {
                    user_id: user_id,
                    product_id: item.id,
                    quantity: item.quantity,
                    total_price: item.price * item.quantity // Line item total
                };

                // 2. INVOKE SECURE HELPER[cite: 4]
                // saveOrderToDB uses parameterized queries (?) to block SQL Injection
                await saveOrderToDB(orderData);

                // 3. DEDUCT INVENTORY
                // Updates the 'products' table to reflect current stock
                db.run("UPDATE products SET quantity = quantity - ? WHERE id = ?",
                    [item.quantity, item.id]);
            }

            // 4. COMMIT ALL CHANGES
            db.run("COMMIT");
            res.status(201).json({
                status: "Success",
                message: "Order items saved to relational database."
            });

        } catch (error) {
            // 5. GRACEFUL ROLLBACK
            db.run("ROLLBACK");
            console.error("Relational Save Error:", error);
            res.status(500).json({
                status: "Fail",
                message: "Checkout failed. Inventory and cart preserved."
            });
        }
    });
});



// --- 6. REMAINING ROUTES ---
app.use('/api/products', productRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});