const express = require('express');
const path = require('path');
const cors = require('cors');
const productRoutes = require('./routes/products'); // Modular Route Import

const app = express();
const PORT = 3000;

// --- 1. MIDDLEWARE CONFIGURATION ---

/** 
 * CORS: Essential since your frontend (root) and backend (/backend folder) 
 * are technically separate origins during development.
 */
app.use(cors());

/**
 * Body Parser: Allows Express to read JSON data sent in POST/PUT requests,
 * which you will need when saving the shopping cart to the database.
 */
app.use(express.json());

// --- 2. STATIC FILE SERVING ---

/**
 * Serving Frontend: Because server.js is inside the /backend/ folder, 
 * we use '../' to point Express to your HTML, CSS, and JS files 
 * located in the root directory.
 */
app.use(express.static(path.join(__dirname, '../')));

// --- 3. API ROUTE MOUNTING ---

/**
 * Product Routes: All requests starting with /api/products will be 
 * handled by the modular products.js route file.
 */
app.use('/api/products', productRoutes);

// --- 4. ERROR HANDLING ---

/**
 * 404 Handler: Catches any requests that don't match your static 
 * files or API routes.
 */
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// --- 5. START SERVER ---

app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`  E-Commerce Backend Server is Running!   `);
    console.log(`  URL: http://localhost:${PORT}           `);
    console.log(`  Serving Frontend from: Root Directory   `);
    console.log(`==========================================`);
});