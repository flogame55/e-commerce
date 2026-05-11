const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

// Import Database Configuration to establish connection on startup
require('./config/database');

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const checkoutRoutes = require('./routes/checkout');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// --- 1. PRE-FLIGHT SECURITY CHECK ---
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
    process.exit(1); // Stop server if security key is missing
}

// --- 2. MIDDLEWARE ---
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ALLOWED_ORIGIN    // e.g., 'https://yourstore.com'
        : '*',                           // allow everything in development
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '../')));

// --- 3. ROUTES ---
app.use('/api', authRoutes); // Handles /api/register and /api/login
app.use('/api/products', productRoutes); // Handles /api/products and /api/products/filter
app.use('/api/checkout', checkoutRoutes); // Handles /api/checkout

// --- 4. FALLBACK ---
app.use((req, res, next) => {
    const error = new Error("API endpoint not found");
    error.statusCode = 404;
    next(error);
});

// --- 5. CENTRALIZED ERROR HANDLING ---
app.use(errorHandler);

// --- 6. SERVER START ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});