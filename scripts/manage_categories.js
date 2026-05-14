let allCategories = [];
let pendingDeleteId = null;
let editingId = null;

function showSuccess(msg) {
    document.getElementById('cat-toast-msg').textContent = msg;
    const toast = new bootstrap.Toast(document.getElementById('cat-success-toast'), { delay: 3000 });
    toast.show();
}

const viewModal   = new bootstrap.Modal(document.getElementById('viewModal'));
const editModal   = new bootstrap.Modal(document.getElementById('editModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

function statusBadge(isActive) {
    return isActive
        ? '<span class="cat-badge cat-badge-active"><span class="cat-badge-dot"></span>Active</span>'
        : '<span class="cat-badge cat-badge-inactive"><span class="cat-badge-dot"></span>Inactive</span>';
}

// ── Render ─────────────────────────────────────────────────────────────────────
function renderTable(cats) {
    const tbody = document.getElementById('cat-table-body');
    tbody.innerHTML = '';

    if (!cats.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="cat-empty">No categories found.</td></tr>`;
        return;
    }

    cats.forEach((c, i) => {
        const tr = document.createElement('tr');
        tr.className = 'cat-row';
        tr.innerHTML = `
            <td class="cat-col-num">${i + 1}</td>
            <td class="cat-col-name">${c.category_name}</td>
            <td class="cat-col-desc">${c.category_description || '—'}</td>
            <td class="cat-col-num">${c.campaign_count}</td>
            <td>${statusBadge(c.is_active)}</td>
            <td class="cat-col-date">${formatDate(c.created_at)}</td>
            <td>
                <div class="manage-card-actions">
                    <button class="manage-btn manage-btn-view" title="View"><i class="bi bi-eye-fill"></i></button>
                    <button class="manage-btn manage-btn-edit" title="Edit"><i class="bi bi-pencil-fill"></i></button>
                    <button class="manage-btn manage-btn-delete" title="Delete"><i class="bi bi-trash-fill"></i></button>
                </div>
            </td>
        `;

        tr.querySelector('.manage-btn-view').onclick   = () => { window.location.href = `view_category.html?id=${c.id}`; };
        tr.querySelector('.manage-btn-edit').onclick   = () => openEdit(c);
        tr.querySelector('.manage-btn-delete').onclick = () => openDelete(c);

        tbody.appendChild(tr);
    });
}

function applyFilters() {
    const q      = document.getElementById('cat-search').value.trim().toLowerCase();
    const status = document.getElementById('cat-status-filter').value;
    const result = allCategories.filter(c => {
        const matchName   = !q || c.category_name.toLowerCase().includes(q);
        const matchStatus = status === '' || String(c.is_active ? '1' : '0') === status;
        return matchName && matchStatus;
    });
    renderTable(result);
}

// ── Load ──────────────────────────────────────────────────────────────────────
async function loadCategories() {
    try {
        const res = await fetch('http://127.0.0.1:8000/platform/categories', { credentials: 'include' });
        if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        allCategories = data.categories || [];
        renderTable(allCategories);
    } catch {
        document.getElementById('cat-table-body').innerHTML =
            `<tr><td colspan="7" class="cat-empty">Failed to load categories.</td></tr>`;
    }
}

loadCategories();

// ── Filters ────────────────────────────────────────────────────────────────────
document.getElementById('cat-search').addEventListener('input', applyFilters);
document.getElementById('cat-status-filter').addEventListener('change', applyFilters);

// ── View ──────────────────────────────────────────────────────────────────────
function openView(c) {
    document.getElementById('view-grid').innerHTML = `
        <div class="cat-view-row"><span class="cat-view-label">Name</span><span>${c.category_name}</span></div>
        <div class="cat-view-row"><span class="cat-view-label">Description</span><span>${c.category_description || '—'}</span></div>
        <div class="cat-view-row"><span class="cat-view-label">Campaigns</span><span>${c.campaign_count}</span></div>
        <div class="cat-view-row"><span class="cat-view-label">Status</span><span>${statusBadge(c.is_active)}</span></div>
        <div class="cat-view-row"><span class="cat-view-label">Created</span><span>${formatDate(c.created_at)}</span></div>
    `;
    viewModal.show();
}

// ── Create / Edit ─────────────────────────────────────────────────────────────
document.getElementById('cat-new-btn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('edit-modal-title').textContent = 'New Category';
    document.getElementById('edit-name').value   = '';
    document.getElementById('edit-desc').value   = '';
    document.getElementById('edit-status').value = '1';
    document.getElementById('edit-error').classList.add('hidden');
    editModal.show();
});

function openEdit(c) {
    editingId = c.id;
    document.getElementById('edit-modal-title').textContent = 'Edit Category';
    document.getElementById('edit-name').value   = c.category_name;
    document.getElementById('edit-desc').value   = c.category_description || '';
    document.getElementById('edit-status').value = c.is_active ? '1' : '0';
    document.getElementById('edit-error').classList.add('hidden');
    editModal.show();
}

document.getElementById('edit-save-btn').addEventListener('click', async () => {
    const name   = document.getElementById('edit-name').value.trim();
    const desc   = document.getElementById('edit-desc').value.trim();
    const status = document.getElementById('edit-status').value;
    const errEl  = document.getElementById('edit-error');

    if (!name) {
        errEl.textContent = 'Category name is required.';
        errEl.classList.remove('hidden');
        return;
    }
    errEl.classList.add('hidden');

    const payload = { category_name: name, category_description: desc, is_active: Number(status) };
    const url     = editingId
        ? `http://127.0.0.1:8000/platform/categories/${editingId}`
        : 'http://127.0.0.1:8000/platform/categories';
    const method  = editingId ? 'PATCH' : 'POST';

    try {
        const res = await fetch(url, {
            method, credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) { const e = await res.json(); errEl.textContent = e.detail || 'Failed.'; errEl.classList.remove('hidden'); return; }
        editModal.hide();
        loadCategories();
        showSuccess(editingId ? 'Category updated successfully.' : 'Category created successfully.');
    } catch { errEl.textContent = 'Could not connect.'; errEl.classList.remove('hidden'); }
});

// ── Delete ─────────────────────────────────────────────────────────────────────
function openDelete(c) {
    pendingDeleteId = c.id;
    document.getElementById('delete-msg').textContent =
        `Delete "${c.category_name}"? This cannot be undone.`;
    deleteModal.show();
}

document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    deleteModal.hide();
    try {
        const res = await fetch(`http://127.0.0.1:8000/platform/categories/${pendingDeleteId}`, {
            method: 'DELETE', credentials: 'include'
        });
        if (res.ok) {
            allCategories = allCategories.filter(c => c.id !== pendingDeleteId);
            applyFilters();
        } else {
            const e = await res.json();
            alert(e.detail || 'Failed to delete category.');
        }
    } catch { alert('Could not connect to the server.'); }
    finally { pendingDeleteId = null; }
});

// ── Gear dropdown ─────────────────────────────────────────────────────────────
const gearBtn  = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');
gearBtn.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', e => e.stopPropagation());
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try { await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
    window.location.href = 'login.html';
});
