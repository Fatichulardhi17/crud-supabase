/* Helper Utilities */

const successResponse = (res, statusCode = 200, message = "Berhasil", data = null) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data
    });
};

const errorResponse = (res, statusCode = 500, message = "Terjadi kesalahan", error = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        ...(error && { error: error.message || error })
    });
};

module.exports = {
    successResponse,
    errorResponse
};
