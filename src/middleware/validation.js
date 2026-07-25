/* Input Validation Middleware */

const validateUser = (req, res, next) => {
    const { name, email } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Nama wajib diisi."
        });
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Email wajib diisi."
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
            success: false,
            message: "Format email tidak valid."
        });
    }

    next();
};

const validateUserUpdate = (req, res, next) => {
    const { name, email } = req.body;

    if (name !== undefined && (typeof name !== 'string' || name.trim() === '')) {
        return res.status(400).json({
            success: false,
            message: "Nama tidak boleh kosong."
        });
    }

    if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: "Format email tidak valid."
            });
        }
    }

    next();
};

module.exports = {
    validateUser,
    validateUserUpdate
};
