const BASE_URL = 'http://127.0.0.1:8000';

let accounts    = [];
let pendingDelete = null;
let pendingEdit   = null;
let roles         = [];

const search       = document.getElementById('cat-search');
const statusFilter = document.getElementById('cat-status-filter');

// ── Helpers ────────────────────────────────────────────────────────────────────

function showToast(msg) {
    document.getElementById('cat-toast-msg').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('cat-success-toast')).show();
}

function statusBadge(isActive) {
    return isActive
        ? '<span class="cat-badge cat-badge-active"><span class="cat-badge-dot"></span>Active</span>'
        : '<span class="cat-badge cat-badge-inactive"><span class="cat-badge-dot"></span>Inactive</span>';
}

function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60)     return `${diff}s ago`;
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

// ── Render ─────────────────────────────────────────────────────────────────────

function renderTable(users) {
    const tbody = document.getElementById('cat-table-body');
    tbody.innerHTML = '';

    if (!users.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="cat-empty">No users found.</td></tr>`;
        return;
    }

    users.forEach((u, i) => {
        const tr = document.createElement('tr');
        tr.className = 'cat-row';
        tr.innerHTML = `
            <td class="cat-col-num">${i + 1}</td>
            <td class="cat-col-name">${u.username}</td>
            <td class="cat-col-desc">${u.role_name || '—'}</td>
            <td class="cat-col-num">${timeAgo(new Date(u.last_login))}</td>
            <td>${statusBadge(u.is_active)}</td>
            <td class="cat-col-date">${formatDate(u.created_at)}</td>
            <td>
                <div class="manage-card-actions">
                    <button class="manage-btn manage-btn-view"   title="View"><i class="bi bi-eye-fill"></i></button>
                    <button class="manage-btn manage-btn-edit"   title="Edit"><i class="bi bi-pencil-fill"></i></button>
                    <button class="manage-btn manage-btn-delete" title="Delete"><i class="bi bi-trash-fill"></i></button>
                </div>
            </td>
        `;

        tr.querySelector('.manage-btn-view').onclick   = () => { window.location.href = `view_account.html?id=${u.user_id}`; };
        tr.querySelector('.manage-btn-edit').onclick   = () => openEditModal(u);
        tr.querySelector('.manage-btn-delete').onclick = () => openDeleteModal(u);

        tbody.appendChild(tr);
    });
}

// ── Data loading ───────────────────────────────────────────────────────────────

async function loadRoles() {
    try {
        const res = await fetch(`${BASE_URL}/admin/user_profiles`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to retrieve profiles');
        roles = await res.json();
        return roles;
    } catch (err) {
        console.log(err);
        return [];
    }
}

async function loadData(filters = {}) {
    const url = new URL(`${BASE_URL}/admin/user_accounts`);

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '')
            url.searchParams.append(key, value);
    });

    try {
        const res = await fetch(url, { credentials: 'include', method: 'GET' });
        if (!res.ok) throw new Error('Error getting user resources');

        accounts = await res.json();
        renderTable(accounts);
    } catch (err) {
        console.log(err);
    }
}

// ── New user modal ─────────────────────────────────────────────────────────────

function populateRoleDropdown(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value    = '';
    placeholder.disabled = true;
    placeholder.selected = !selectedId;
    placeholder.text     = 'Please select a role';
    select.append(placeholder);

    roles.forEach(role => {
        const opt    = document.createElement('option');
        opt.value    = role.role_id;
        opt.text     = role.role_name;
        opt.selected = role.role_id == selectedId;
        select.append(opt);
    });
}

document.getElementById('cat-new-btn').addEventListener('click', () => {
    populateRoleDropdown('new-user-role');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('newUserModal')).show();
});

document.getElementById('new-user-pw-toggle').addEventListener('click', () => {
    const input  = document.getElementById('new-user-password');
    const icon   = document.getElementById('new-user-pw-icon');
    const hidden = input.type === 'password';
    input.type     = hidden ? 'text'              : 'password';
    icon.className = hidden ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
});

document.getElementById('new-user-submit-btn').addEventListener('click', async () => {
    const submitBtn = document.getElementById('new-user-submit-btn');
    const errorEl   = document.getElementById('new-user-error');

    const payload = {
        username:   document.getElementById('new-user-username').value.trim(),
        email:      document.getElementById('new-user-email').value.trim(),
        password:   document.getElementById('new-user-password').value,
        role_id:    document.getElementById('new-user-role').value,
        first_name: document.getElementById('new-user-first-name').value.trim(),
        last_name:  document.getElementById('new-user-last-name').value.trim(),
        phone:      document.getElementById('new-user-phone').value.trim(),
    };

    const missing = Object.entries(payload).find(([_, v]) => !v);
    if (missing) {
        errorEl.textContent = 'Please fill in all fields.';
        errorEl.classList.remove('hidden');
        return;
    }

    errorEl.classList.add('hidden');
    submitBtn.disabled    = true;
    submitBtn.textContent = 'Creating…';

    try {
        const res = await fetch(`${BASE_URL}/admin/create_account`, {
            method:      'POST',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify(payload),
            credentials: 'include'
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to create user.');
        }

        bootstrap.Modal.getInstance(document.getElementById('newUserModal')).hide();
        showToast('User created successfully.');
        await loadData({ search: search.value });

    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    } finally {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Create User';
    }
});

document.getElementById('newUserModal').addEventListener('hidden.bs.modal', () => {
    ['new-user-first-name', 'new-user-last-name', 'new-user-username',
     'new-user-phone', 'new-user-email', 'new-user-password'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('new-user-role').selectedIndex = 0;
    document.getElementById('new-user-error').classList.add('hidden');
    document.getElementById('new-user-password').type = 'password';
    document.getElementById('new-user-pw-icon').className = 'bi bi-eye-fill';
});

// ── Edit modal ─────────────────────────────────────────────────────────────────

function openEditModal(user) {
    pendingEdit = user;

    populateRoleDropdown('edit-role', user.role_id);

    document.getElementById('username-strip-modal').innerText = user.username.slice(0, 2).toUpperCase();
    document.getElementById('modal-uname').innerText          = user.username;
    document.getElementById('modal-email').innerText          = user.email;
    document.getElementById('edit-first-name').value          = user.first_name || '';
    document.getElementById('edit-last-name').value           = user.last_name  || '';
    document.getElementById('edit-username').value            = user.username;
    document.getElementById('edit-email').value               = user.email;
    document.getElementById('edit-phone').value               = user.phone || '';
    document.getElementById('edit-password').value            = '';

    bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).show();
}

document.getElementById('editModalBtn').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).hide();
});

document.getElementById('edit-modal-close').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).hide();
});

document.getElementById('pw-toggle-btn').addEventListener('click', () => {
    const input  = document.getElementById('edit-password');
    const icon   = document.getElementById('pw-toggle-icon');
    const hidden = input.type === 'password';
    input.type     = hidden ? 'text'    : 'password';
    icon.className = hidden ? 'bi bi-eye-slash' : 'bi bi-eye';
});

document.getElementById('editmodal-save-changes').addEventListener('click', async () => {
    const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal'));

    const payload = {
        first_name: document.getElementById('edit-first-name').value,
        last_name:  document.getElementById('edit-last-name').value,
        username:   document.getElementById('edit-username').value,
        email:      document.getElementById('edit-email').value,
        phone:      document.getElementById('edit-phone').value,
        role_id:    document.getElementById('edit-role').value,
        password:   document.getElementById('edit-password').value
    };

    try {
        const res = await fetch(`${BASE_URL}/admin/user_accounts/${pendingEdit.user_id}`, {
            method:      'PATCH',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update user account');

        editModal.hide();
        showToast(`${pendingEdit.username} updated successfully.`);
        pendingEdit = null;
        await loadData({ search: search.value });

    } catch (err) {
        console.log(err);
    }
});

// ── Delete / suspend modal ─────────────────────────────────────────────────────

function openDeleteModal(user) {
    pendingDelete = user;
    document.getElementById('delete-msg').innerText = `Suspend ${user.username}? This cannot be undone.`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show();
}

document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDelete) return;

    const deleteModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal'));

    try {
        const res = await fetch(`${BASE_URL}/admin/user_accounts/${pendingDelete.user_id}/suspend`, {
            method:      'POST',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to suspend user.');

        deleteModal.hide();
        showToast(`${pendingDelete.username} has been suspended.`);
        pendingDelete = null;
        await loadData({ search: search.value });

    } catch (err) {
        console.log(err);
    }
});

// ── Gear dropdown ──────────────────────────────────────────────────────────────

const gearBtn  = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');

gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
});

document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', (e) => e.stopPropagation());

document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try {
        await fetch(`${BASE_URL}/logout`, { method: 'POST', credentials: 'include' });
    } catch (_) {}
    window.location.href = 'login.html';
});

// ── Search ─────────────────────────────────────────────────────────────────────

search.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    loadData({ search: search.value.trim(), is_active: statusFilter.value });
});

// ── Init ───────────────────────────────────────────────────────────────────────

async function init() {
    roles = await loadRoles();
    await loadData();
}
init();