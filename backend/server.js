require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const productRoutes = require('./routes/products');

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


// --- 5. AUTHENTICATION ROUTE ---
app.post('/api/login', (req, res) => {
    // A. Capture the data from the Request Body (The Envelope)
    const { email, password } = req.body;

    // B. Validation: Stop early if data is missing
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    // C. Define the Query inside the route
    const query = `SELECT * FROM users WHERE email = ?`;

    // D. Database Execution
    db.get(query, [email], async (err, user) => {
        if (err) {
            console.error("DB QUERY ERROR:", err.message); // Visible in Terminal
            return res.status(500).json({ message: "Database error" });
        }

        // E. Security: Check if user exists[cite: 4]
        if (!user) {
            return res.status(401).json({ status: "Fail", message: "Invalid email or password" });
        }

        try {
            // F. Compare the input password with the Bcrypt hash in DB[cite: 4]
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
                // G. Success: Sign the JWT Token (The Passport)[cite: 4]
                const payload = { user_id: user.id, email: user.email };
                const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

                return res.status(200).json({
                    status: "Success",
                    token: token,
                    user: {
                        first_name: user.first_name,
                        email: user.email
                    }
                });
            } else {
                // Password didn't match
                return res.status(401).json({ status: "Fail", message: "Invalid email or password" });
            }
        } catch (bcryptErr) {
            console.error("BCRYPT COMPARE ERROR:", bcryptErr); // Visible in Terminal
            return res.status(500).json({ message: "Error processing login comparison" });
        }
    });
});

/**
 * @route   POST /api/register
 * @desc    Create a new user with a hashed password
 * @access  Public
 */
app.post('/api/register', async (req, res) => {
    const { first_name, email, password } = req.body;

    // 1. Validation: Ensure no empty envelopes reach the DB
    if (!first_name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // 2. Layer 2 Defense: Hashing the password[cite: 1, 4]
        // We use a salt round of 10 to balance security and performance
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Database Logic: Inserting the new identity[cite: 1, 4]
        const sql = `INSERT INTO users (first_name, email, password_hash) VALUES (?, ?, ?)`;

        db.run(sql, [first_name, email, hashedPassword], function (err) {
            if (err) {
                // Handle "409 Conflict" if the email already exists
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(409).json({ message: "Email already registered" });
                }
                console.error("Registration Error:", err.message);
                return res.status(500).json({ message: "Internal server error" });
            }

            // 4. Success Response[cite: 1, 4]
            res.status(201).json({
                status: "Success",
                message: "User registered successfully",
                user_id: this.lastID
            });
        });
    } catch (error) {
        console.error("Bcrypt Hashing Error:", error);
        res.status(500).json({ message: "Error securing password" });
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