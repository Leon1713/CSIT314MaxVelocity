let allCategories = [];
let editingId = null;
let pendingDeleteId = null;

const viewModal   = new bootstrap.Modal(document.getElementById('viewModal'));
const editModal   = new bootstrap.Modal(document.getElementById('editModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

function showSuccess(msg) {
    document.getElementById('cat-toast-msg').textContent = msg;
    bootstrap.Toast.getOrCreateInstance(document.getElementById('cat-success-toast'), { delay: 3000 }).show();
}

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

const gearBtn  = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');
gearBtn.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', e => e.stopPropagation());
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try { await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
    window.location.href = 'login.html';
});
