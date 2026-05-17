const BASE_URL = 'http://127.0.0.1:8000';

let userData      = null;
let pendingDelete = null;
let roles         = [];

// ── Helpers ────────────────────────────────────────────────────────────────────

function showToast(msg) {
    document.getElementById('fra-toast-msg').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('fra-success-toast')).show();
}

function statusBadge(isActive) {
    return isActive === 1
        ? '<span class="status-pill status-pill--active">Active</span>'
        : '<span class="status-pill status-pill--inactive">Inactive</span>';
}

function timeAgo(date) {
    if (!date) return '—';
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60)     return `${diff}s ago`;
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)}d ago`;
}

function formatDate(date) {
    if (!date) return '—';
    const parsedDate = date instanceof Date ? date : new Date(date);
    if (isNaN(parsedDate)) return '—';

    const day = String(parsedDate.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[parsedDate.getMonth()];
    const year = parsedDate.getFullYear();

    let hours = parsedDate.getHours();
    const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
}

// ── Render ─────────────────────────────────────────────────────────────────────

function renderView(user) {
    document.getElementById('us-strip-head').innerText     = user.username.slice(0, 2).toUpperCase();
    document.getElementById('header-username').innerText   = user.username;
    document.getElementById('header-role').innerText       = user.role_name || '—';
    document.getElementById('details-id').innerText         = user.user_id;
    document.getElementById('details-role').innerText       = user.role_name || '—';
    document.getElementById('details-created_at').innerText = formatDate(user.created_at);
    document.getElementById('details-last_login').innerText = formatDate(user.last_login);
    document.getElementById('details-email').innerText      = user.email;

    // Handle Status
    // const headerStatus  = document.getElementById('header-status');
    // const detailsStatus = document.getElementById('details-status');

    // headerStatus.childNodes[1].nodeValue = user.is_active === 1 ? 'Active' : 'Inactive';
    // detailsStatus.innerText              = user.is_active === 1 ? 'Active' : 'Inactive';

    // if (user.is_active === 1) {
    //     headerStatus.classList.replace('status-pill--inactive', 'status-pill--active');
    //     detailsStatus.classList.remove('red');
    // } else {
    //     headerStatus.classList.replace('status-pill--active', 'status-pill--inactive');
    //     detailsStatus.classList.add('red');
    // }

    // Handle Recent Activities Timeline Engine
    const activities = [
        { key: 'last_login', date: user.last_login ? new Date(user.last_login) : null, label: 'Logged in', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>' },
        { key: 'updated_at', date: user.updated_at ? new Date(user.updated_at) : null, label: 'Updated at', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/></svg>' },
        { key: 'created_at', date: user.created_at ? new Date(user.created_at) : null, label: 'Created at', icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>' }
    ];

    const sortedActivities = activities
        .filter(act => act.date !== null)
        .sort((a, b) => b.date - a.date);

    const parent = document.getElementById('details-recent-activity');
    parent.innerHTML = '';

    sortedActivities.forEach((act) => {
        const item = document.createElement('div');
        item.className = 'activity-list__item';
        item.innerHTML = `
            <div class="activity-list__icon">${act.icon}</div>
            <div class="activity-list__text">
                <p>${act.label}</p>
                <span>${formatDate(act.date)}</span>
            </div>
            <span class="activity-list__timestamp">${timeAgo(act.date)}</span>
        `;
        parent.appendChild(item);
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

async function loadData() {
    const userParams = new URLSearchParams(window.location.search);
    const userId     = userParams.get('id');

    if (!userId) {
        console.error('No target context ID found in URL variables.');
        return;
    }

    try {
        const res = await fetch(`${BASE_URL}/admin/user_accounts/${userId}`, {
            method: 'GET',
            credentials: 'include'
        });
        if (!res.ok) throw new Error('Fail to load user structural resources.');

        userData = await res.json();
        
        loadEditModalData(userData);
        renderView(userData);

        document.getElementById('manage-profiles-loader').classList.add('hidden');
        document.getElementById('account-card').classList.remove('hidden');
    } catch (err) {
        console.error(err);
        document.getElementById('manage-profiles-loader').innerText = 'Error Loading user';
    }
}

// ── Edit modal ─────────────────────────────────────────────────────────────────

function populateRoleDropdown(selectId, selectedId = null) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';

    roles.forEach(role => {
        const opt    = document.createElement('option');
        opt.value    = role.role_id;
        opt.text     = role.role_name;
        opt.selected = role.role_id == selectedId;
        select.append(opt);
    });
}

function loadEditModalData(user) {
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
}

document.getElementById('edit-acc-btn').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).show();
});

document.getElementById('editModalBtn').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).hide();
});

document.getElementById('edit-modal-close').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('editUserModal')).hide();
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
        const res = await fetch(`${BASE_URL}/admin/user_accounts/${userData.user_id}`, {
            method:      'PATCH',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update user account');

        editModal.hide();
        showToast(`${userData.username} updated successfully.`);
        await loadData();
    } catch (err) {
        console.log(err);
    }
});

// ── Password Visibility Toggle ─────────────────────────────────────────────────

document.getElementById('pw-toggle-btn').addEventListener('click', () => {
    const input  = document.getElementById('edit-password');
    const icon   = document.getElementById('pw-toggle-icon');
    const hidden = input.type === 'password';
    input.type     = hidden ? 'text'    : 'password';
    icon.className = hidden ? 'bi bi-eye-slash' : 'bi bi-eye';
});

// ── Delete / suspend modal ─────────────────────────────────────────────────────

document.getElementById('suspendBtn').addEventListener('click', () => {
    pendingDelete = userData;
    document.getElementById('delete-modal-msg').innerText = `Suspend ${pendingDelete.username}? This cannot be undone.`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).show();
});

document.getElementById('delete-modal-cancel').addEventListener('click', () => {
    bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal')).hide();
});

document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDelete) return;
    const deleteModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal'));

    try {
        const res = await fetch(`${BASE_URL}/admin/user_accounts/${pendingDelete.user_id}/suspend`, {
            method:      'POST',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed context endpoint confirmation parameters.');

        deleteModal.hide();
        showToast(`${pendingDelete.username} has been suspended.`);
        pendingDelete = null;
        await loadData();
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

// ── Init ───────────────────────────────────────────────────────────────────────

async function init() {
    roles = await loadRoles();
    await loadData();
}
init();