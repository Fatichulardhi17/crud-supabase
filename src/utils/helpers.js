/* Helper Utilities */

const successResponse = (res, statusCode = 200, message = "Berhasil", data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, statusCode = 500, message = "Terjadi kesalahan", error = null) => {
    const errorDetails = error ? (error.message || JSON.stringify(error)) : null;
    const fullMessage = errorDetails ? `${message} (${errorDetails})` : message;

    return res.status(statusCode).json({
        success: false,
        message: fullMessage,
        ...(errorDetails && { details: errorDetails })
    });
};

module.exports = {
    successResponse,
    errorResponse
};
