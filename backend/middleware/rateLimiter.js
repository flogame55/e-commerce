const rateLimit = require('express-rate-limit');

// Rate limiter for authentication endpoints (login, register)
// Prevents brute-force password attacks and registration spam
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15-minute window
    max: 10,                    // limit each IP to 10 requests per window
    message: {
        status: 'Fail',
        message: 'Too many attempts. Please try again after 15 minutes.'
    },
    standardHeaders: true,     // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,      // Disable X-RateLimit-* headers
});

module.exports = { authLimiter };
