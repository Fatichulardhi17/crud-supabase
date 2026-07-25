const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Validasi environment variables Supabase
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.");
}

// Inisialisasi client Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        },
        db: {
            schema: "public"
        }
    }
);

// Test koneksi Supabase
const testConnection = async () => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            if (error.message.includes("Could not find the table") || error.code === '42P01') {
                console.warn("⚠️  Koneksi Supabase Berhasil! (Catatan: Tabel 'users' belum dibuat di Supabase Dashboard).");
                return true;
            }
            console.error("❌ Koneksi Supabase gagal:", error.message);
            return false;
        }

        console.log("✅ Koneksi Supabase berhasil dan tabel 'users' terdeteksi!");
        return true;
    } catch (error) {
        console.error("❌ Koneksi database gagal:", error.message);
        return false;
    }
};

module.exports = {
    supabase,
    testConnection
};