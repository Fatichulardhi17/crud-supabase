/* Global Error Handler Middleware */

const errorHandler = (err, req, res, next) => {
    console.error("Internal Server Error:", err);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || "Terjadi kesalahan internal pada server.";

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Endpoint ${req.originalUrl} tidak ditemukan.`
    });
};

module.exports = {
    errorHandler,
    notFoundHandler
};
