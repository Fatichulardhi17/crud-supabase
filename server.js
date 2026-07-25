const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./src/config/supabase');
const userRoutes = require('./src/routes/userRoutes');
const { rateLimiter } = require('./src/middleware/auth');
const { errorHandler, notFoundHandler } = require('./src/middleware/erorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// File statis untuk UI (Frontend)
app.use(express.static(path.join(__dirname)));

// API Routes
app.use('/api/users', userRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// 404 & Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

// Jalankan Server secara lokal (jika tidak berjalan sebagai Netlify Function)
if (process.env.NETLIFY !== 'true' && require.main === module) {
    app.listen(PORT, async () => {
        console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
        console.log(`📋 Menguji koneksi ke Supabase...`);
        await testConnection();
    });
}

module.exports = app;
