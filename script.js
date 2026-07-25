document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = '/api/users';
    
    // DOM Elements
    const userTableBody = document.getElementById('userTableBody');
    const tableLoading = document.getElementById('tableLoading');
    const emptyState = document.getElementById('emptyState');
    const searchInput = document.getElementById('searchInput');
    const btnRefresh = document.getElementById('btnRefresh');
    const btnOpenAddModal = document.getElementById('btnOpenAddModal');
    const userModal = document.getElementById('userModal');
    const btnCloseModal = document.getElementById('btnCloseModal');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const userForm = document.getElementById('userForm');
    const modalTitle = document.getElementById('modalTitle');
    
    // Stats Elements
    const statTotalUsers = document.getElementById('statTotalUsers');
    const statActiveUsers = document.getElementById('statActiveUsers');
    const statAdmins = document.getElementById('statAdmins');
    const dbStatus = document.getElementById('dbStatus');
    const statusText = document.getElementById('statusText');

    let allUsers = [];

    // Check DB / Server Status
    async function checkHealth() {
        try {
            const res = await fetch('/api/health');
            if (res.ok) {
                dbStatus.classList.add('online');
                statusText.textContent = 'Server & DB Online';
            } else {
                statusText.textContent = 'Server Offline';
            }
        } catch (e) {
            statusText.textContent = 'Disconnected';
        }
    }

    // Fetch Users from API
    async function fetchUsers(searchQuery = '') {
        showLoading(true);
        try {
            const url = searchQuery ? `${API_BASE}?search=${encodeURIComponent(searchQuery)}` : API_BASE;
            const res = await fetch(url);
            const data = await res.json();

            if (res.ok && data.success) {
                allUsers = data.data || [];
                renderTable(allUsers);
                updateStats(allUsers);
            } else {
                showToast(data.message || 'Gagal memuat data user', 'error');
                renderTable([]);
            }
        } catch (err) {
            console.error(err);
            showToast('Kesalahan koneksi ke server', 'error');
            renderTable([]);
        } finally {
            showLoading(false);
        }
    }

    // Render Table Rows
    function renderTable(users) {
        userTableBody.innerHTML = '';
        if (!users || users.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');

        users.forEach(user => {
            const tr = document.createElement('tr');
            const initial = (user.name || 'U').charAt(0).toUpperCase();
            const isActive = (user.status || 'Active').toLowerCase() === 'active';

            tr.innerHTML = `
                <td>#${user.id}</td>
                <td>
                    <div class="user-info">
                        <div class="avatar">${initial}</div>
                        <div>
                            <div class="user-name">${escapeHtml(user.name || '-')}</div>
                            <div class="user-email">${escapeHtml(user.email || '-')}</div>
                        </div>
                    </div>
                </td>
                <td><span class="badge badge-role">${escapeHtml(user.role || 'User')}</span></td>
                <td>
                    <span class="badge ${isActive ? 'badge-active' : 'badge-inactive'}">
                        ${isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-edit-alt btn-edit" data-id="${user.id}">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger-alt btn-delete" data-id="${user.id}" data-name="${escapeHtml(user.name)}">
                        <i class="fa-solid fa-trash"></i> Hapus
                    </button>
                </td>
            `;
            userTableBody.appendChild(tr);
        });

        // Event listeners untuk tombol edit & hapus
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const targetUser = allUsers.find(u => u.id == id);
                if (targetUser) openModal(targetUser);
            });
        });

        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const name = e.currentTarget.getAttribute('data-name');
                confirmDelete(id, name);
            });
        });
    }

    // Update Dashboard Stats
    function updateStats(users) {
        statTotalUsers.textContent = users.length;
        const activeCount = users.filter(u => (u.status || '').toLowerCase() === 'active').length;
        statActiveUsers.textContent = activeCount;
        const adminCount = users.filter(u => ['admin', 'manager'].includes((u.role || '').toLowerCase())).length;
        statAdmins.textContent = adminCount;
    }

    // Modal Control
    function openModal(user = null) {
        userForm.reset();
        if (user) {
            modalTitle.textContent = 'Edit Data User';
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userRole').value = user.role || 'User';
            document.getElementById('userStatus').value = user.status || 'Active';
        } else {
            modalTitle.textContent = 'Tambah User Baru';
            document.getElementById('userId').value = '';
        }
        userModal.classList.remove('hidden');
    }

    function closeModal() {
        userModal.classList.add('hidden');
    }

    // Handle Form Submit (Create & Update)
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('userId').value;
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const role = document.getElementById('userRole').value;
        const status = document.getElementById('userStatus').value;

        const payload = { name, email, role, status };

        try {
            const isEdit = !!id;
            const url = isEdit ? `${API_BASE}/${id}` : API_BASE;
            const method = isEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok && data.success) {
                showToast(isEdit ? 'User berhasil diperbarui!' : 'User baru berhasil dibuat!', 'success');
                closeModal();
                fetchUsers(searchInput.value);
            } else {
                showToast(data.message || 'Gagal menyimpan data', 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Terjadi kesalahan saat menyimpan', 'error');
        }
    });

    // Hapus User
    async function confirmDelete(id, name) {
        if (confirm(`Apakah Anda yakin ingin menghapus user "${name}"?`)) {
            try {
                const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
                const data = await res.json();

                if (res.ok && data.success) {
                    showToast('User berhasil dihapus', 'success');
                    fetchUsers(searchInput.value);
                } else {
                    showToast(data.message || 'Gagal menghapus user', 'error');
                }
            } catch (err) {
                console.error(err);
                showToast('Terjadi kesalahan saat menghapus user', 'error');
            }
        }
    }

    // Toast Notification Utility
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${escapeHtml(message)}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3500);
    }

    // Helper Utilities
    function showLoading(isLoading) {
        if (isLoading) {
            tableLoading.classList.remove('hidden');
            emptyState.classList.add('hidden');
        } else {
            tableLoading.classList.add('hidden');
        }
    }

    function escapeHtml(str) {
        return str ? str.replace(/[&<>"']/g, function(m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
        }) : '';
    }

    // Debounce Search Input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetchUsers(e.target.value.trim());
        }, 300);
    });

    // Event Listeners
    btnOpenAddModal.addEventListener('click', () => openModal());
    btnCloseModal.addEventListener('click', closeModal);
    btnCancelModal.addEventListener('click', closeModal);
    btnRefresh.addEventListener('click', () => fetchUsers(searchInput.value));

    // Initialize
    checkHealth();
    fetchUsers();
});
