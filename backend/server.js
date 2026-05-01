const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const productRoutes = require('./routes/products'); // Modular Route Import

const app = express();
const PORT = 3000;
const dbPath = path.join(__dirname, 'database.db');

// --- 1. MIDDLEWARE CONFIGURATION ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// --- CATEGORY FILTER ROUTE (must be before 404 handler) ---
const allowedCategories = ['Vegetables', 'Fruits', 'Juice', 'Dried', 'Hat', 'All'];
const gatekeeper = (req, res, next) => {
    const requestedCategory = req.query.category;
    if (requestedCategory && allowedCategories.includes(requestedCategory)) {
        console.log(`Gatekeeper: Access Granted for ${requestedCategory}`);
        next();
    } else {
        console.log(`Gatekeeper: Access Denied for ${requestedCategory}`);
        res.status(403).json({ status: "Fail", message: "Invalid Category Envelope" });
    }
};
app.get('/api/products/filter', gatekeeper, (req, res) => {
    const category = req.query.category;
    const db = new sqlite3.Database(dbPath);
    let sql = "SELECT * FROM products";
    let params = [];
    if (category && category !== 'All') {
        sql += " WHERE category = ?";
        params.push(category);
    }
    db.all(sql, params, (err, rows) => {
        db.close();
        if (err) {
            res.status(500).json({ status: "Fail", error: err.message });
        } else {
            res.status(200).json(rows);
        }
    });
});

// --- OTHER PRODUCT ROUTES ---
app.use('/api/products', productRoutes);

// --- 404 HANDLER (must be last) ---
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`  E-Commerce Backend Server is Running!   `);
    console.log(`  URL: http://localhost:${PORT}           `);
    console.log(`  Serving Frontend from: Root Directory   `);
    console.log(`==========================================`);
});