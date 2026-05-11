const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const error = new Error('Access denied. No token provided.');
        error.statusCode = 401;
        return next(error);
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach verified user identity to request
        next();
    } catch (err) {
        const error = new Error('Invalid or expired token.');
        error.statusCode = 403;
        next(error);
    }
};

module.exports = authenticate;
