const errorHandler = (err, req, res, next) => {
    // Determine if it's an operational error (e.g., thrown intentionally by a service)
    const statusCode = err.statusCode || 500;
    // Consider it operational if we explicitly attached a statusCode, otherwise it's a true unexpected 500
    const isOperational = err.statusCode !== undefined;

    // Log the error (can be integrated with a logging library like Winston later)
    if (!isOperational) {
        console.error('🔥 [UNEXPECTED ERROR]', err);
    } else {
        console.warn(`⚠️ [OPERATIONAL ERROR] ${req.method} ${req.url} - ${statusCode}: ${err.message}`);
    }

    // Return JSON response to the client
    res.status(statusCode).json({
        status: isOperational ? 'Fail' : 'Error',
        message: isOperational ? err.message : 'Internal Server Error'
    });
};

module.exports = errorHandler;
