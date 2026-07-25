/* Autentikasi & Rate Limiter Middleware */

// Middleware untuk validasi API key (hanya aktif jika REQUIRE_API_KEY=true & API_KEY diset di .env)
const validateApiKey = (req, res, next) => {
    const requireApiKey = process.env.REQUIRE_API_KEY === 'true';
    const validApiKey = process.env.API_KEY;

    if (requireApiKey && validApiKey) {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey || apiKey !== validApiKey) {
            return res.status(401).json({ success: false, message: "Invalid or missing API key" });
        }
    }
    next();
};

// Middleware rate limiter sederhana
const rateLimiter = (() => {
    const requests = new Map();
    const WINDOW_MS = 60 * 1000; // 1 menit
    const MAX_REQUESTS = 100; // Batas permintaan per IP

    return (req, res, next) => {
        const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
        const now = Date.now();

        if (!requests.has(ip)) {
            requests.set(ip, []);
        }

        const userRequests = requests.get(ip);
        const validRequests = userRequests.filter(time => now - time < WINDOW_MS);

        if (validRequests.length >= MAX_REQUESTS) {
            return res.status(429).json({ 
                success: false, 
                message: "Terlalu banyak permintaan, silakan coba lagi nanti." 
            });
        }

        validRequests.push(now);
        requests.set(ip, validRequests);
        next();
    };
})();

module.exports = {
    validateApiKey,
    rateLimiter
};
