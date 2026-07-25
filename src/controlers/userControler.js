const { supabase } = require("../config/supabase");
const { successResponse, errorResponse } = require("../utils/helpers");

// GET /api/users - Ambil semua user
const getAllUsers = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = supabase.from('users').select('*');

        if (search) {
            query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
        }

        const { data, error } = await query.order('id', { ascending: true });

        if (error) {
            return errorResponse(res, 500, "Gagal mengambil data user dari Supabase", error);
        }

        return successResponse(res, 200, "Berhasil mengambil data user", data || []);
    } catch (err) {
        next(err);
    }
};

// GET /api/users/:id - Ambil detail user berdasarkan ID
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return errorResponse(res, 404, "User tidak ditemukan");
            }
            return errorResponse(res, 500, "Gagal mengambil data user", error);
        }

        return successResponse(res, 200, "Detail user ditemukan", data);
    } catch (err) {
        next(err);
    }
};

// POST /api/users - Tambah user baru
const createUser = async (req, res, next) => {
    try {
        const { name, email, role, status } = req.body;

        const newUser = {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: role || "User",
            status: status || "Active"
        };

        const { data, error } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (error) {
            return errorResponse(res, 400, "Gagal menambahkan user", error);
        }

        return successResponse(res, 201, "User berhasil ditambahkan", data);
    } catch (err) {
        next(err);
    }
};

// PUT /api/users/:id - Update user berdasarkan ID
const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, role, status } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (email !== undefined) updateData.email = email.trim().toLowerCase();
        if (role !== undefined) updateData.role = role;
        if (status !== undefined) updateData.status = status;

        if (Object.keys(updateData).length === 0) {
            return errorResponse(res, 400, "Tidak ada data yang diperbarui");
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return errorResponse(res, 400, "Gagal memperbarui data user", error);
        }

        if (!data) {
            return errorResponse(res, 404, "User tidak ditemukan untuk diperbarui");
        }

        return successResponse(res, 200, "User berhasil diperbarui", data);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/users/:id - Hapus user berdasarkan ID
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('users')
            .delete()
            .eq('id', id)
            .select();

        if (error) {
            return errorResponse(res, 500, "Gagal menghapus user", error);
        }

        if (!data || data.length === 0) {
            return errorResponse(res, 404, "User tidak ditemukan");
        }

        return successResponse(res, 200, "User berhasil dihapus", data[0]);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
