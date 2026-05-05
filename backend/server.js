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
        // Read current JSON
        const data = fs.readFileSync(authFile, 'utf8');
        const users = JSON.parse(data);

        // Check if username already exists
        const exists = users.find(u => u.username === email);
        if (exists) {
            return res.status(400).json({ message: "User already exists in JSON!" });
        }

        // Hash password before storing (Best Practice)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user object[cite: 5]
        const newUser = {
            username: email,
            password_hash: hashedPassword,
            first_name: first_name,
            reg_date: new Date().toISOString().split('T')[0]
        };

        // Save back to JSON[cite: 5]
        users.push(newUser);
        fs.writeFileSync(authFile, JSON.stringify(users, null, 4));

        res.status(201).json({ status: "Success", message: "User registered in auth_user.json" });
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: "Failed to save to JSON file" });
    }
});

// B. Login Logic
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Read JSON Source of Truth[cite: 5]
        const data = fs.readFileSync(authFile, 'utf8');
        const users = JSON.parse(data);

        // Find user by username (email)[cite: 5]
        const user = users.find(u => u.username === email);

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Compare provided password with hashed password in JSON[cite: 1, 4]
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (isMatch) {
            // Issue JWT Passport[cite: 1, 3]
            const token = jwt.sign({ email: user.username }, JWT_SECRET, { expiresIn: '1h' });

            return res.status(200).json({
                status: "Success",
                token: token,
                user: { first_name: user.first_name, email: user.username }
            });
        } else {
            return res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server Error" });
    }
});

/**
 * @route   POST /api/checkout
 * @desc    Atomic Transaction: Validate cart, email, and payment before saving order
 */
app.post('/api/checkout', async (req, res) => {
    // Phase 2: The Middleware Buffer (express.json) has unpacked the payload
    const { email, cartItems, cardNumber } = req.body;
    let errors = [];

    try {
        // --- 1. VALIDATION: SERVER-SIDE SURVIVAL ---

        // A. Inventory/Cart Check
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            errors.push("Your cart is empty.");
        }

        // B. Email Validation (RegEx Firewall)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push("Invalid email format.");
        }

        // C. Payment Validation (16-digit Mock)[cite: 2]
        const ccRegex = /^\d{16}$/;
        if (!ccRegex.test(cardNumber)) {
            errors.push("Credit card must be exactly 16 digits.");
        }

        // If any validation failed, stop here[cite: 2]
        if (errors.length > 0) {
            return res.status(400).json({ status: "Fail", message: errors.join(" ") });
        }

        // --- 2. CALCULATIONS: PROFIT PROTECTION[cite: 2] ---
        // Re-calculate on server to prevent price tampering in the browser[cite: 2]
        const getProductPrice = (productId) => {
            return new Promise((resolve, reject) => {
                db.get("SELECT price FROM products WHERE id = ?", [productId], (err, row) => {
                    if (err) reject(err);
                    else resolve(row ? row.price : null);
                });
            });
        };

        let totalAmount = 0;
        for (const item of cartItems) {
            const truePrice = await getProductPrice(item.id);
            if (truePrice === null) {
                return res.status(400).json({ status: "Fail", message: `Product with ID ${item.id} not found.` });
            }
            totalAmount += truePrice * item.quantity;
        }

        // --- 3. PERSISTENCE: THE ATOMIC SAVE[cite: 2] ---
        const orderId = `ORD-${Date.now()}`;
        const orderDate = new Date().toISOString();

        // SQL Transaction logic
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const sql = `INSERT INTO orders (order_id, user_email, total_price, order_date) 
                         VALUES (?, ?, ?, ?)`;

            db.run(sql, [orderId, email, totalAmount, orderDate], function (err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(400).json({ message: "Save Order step failed. Cart preserved." });
                }

                // If DB save is successful, we commit[cite: 2]
                db.run("COMMIT");

                // Success Handshake[cite: 2]
                res.status(201).json({
                    status: "Success",
                    message: "Order placed successfully!",
                    orderId: orderId
                });
            });
        });

    } catch (error) {
        // --- SYSTEM GRACEFUL FAILURE[cite: 2] ---
        console.error("Critical System Error:", error);
        res.status(400).json({ message: "Server encountered an error. Please try again." });
    }
});



// --- 6. REMAINING ROUTES ---
app.use('/api/products', productRoutes);

app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});