const STATUS_COLORS = {
    1: '#22c55e',
    0: '#f97316',
};

const STATUS_LABELS = {
    1: 'Active',
    0: 'Inactive',
};

const BADGE_CLASSES = {
    1 : 'manage-badge-active',
    0: 'manage-badge-inactive',
};



function formatCurrency(amount) {
    return '$' + Number(amount).toLocaleString();
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function progressPct(current, goal) {
    if (!goal || goal === 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
}

// ── Render ─────────────────────────────────────────────────────────────────────
let allActivities = [];
let pendingDeleteId = null;
let editingActivityId = null;

function showToast(msg) {
    document.getElementById('fra-toast-msg').textContent = msg;
    new bootstrap.Toast(document.getElementById('fra-success-toast'), { delay: 2500 }).show();
}
const deleteModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal'));

function renderList(activities) {
    const list = document.getElementById('manage-activity-list');
    list.innerHTML = '';

    if (!activities.length) {
        list.innerHTML = '<p class="manage-empty">No activities found.</p>';
        return;
    }

    activities.forEach(act => {
        const statusLabel = STATUS_LABELS[act.status] ?? String(act.status);
        const badgeClass  = BADGE_CLASSES[act.status] ?? 'manage-badge-inactive';
        const dotColor    = STATUS_COLORS[act.status]  ?? '#aaa';
        const pct         = progressPct(act.current_amount, act.goal_amount);

        const card = document.createElement('div');
        card.className = 'manage-activity-card';
        card.innerHTML = `
            <div class="manage-card-icon-wrap">
                <i class="bi bi-cash-stack"></i>
            </div>
            <div class="manage-card-body">
                <div class="manage-card-title">${act.title || 'Untitled'}</div>
                <div class="manage-card-meta">${act.category_name || '—'} | ${formatDate(act.end_date)}</div>
                <div class="manage-progress-wrap">
                    <div class="manage-progress-fill" style="width:${pct}%"></div>
                </div>
                <div class="manage-card-counts">
                    <span><i class="bi bi-eye-fill"></i> ${act.view_count || 0}</span>
                    <span><i class="bi bi-bookmark-fill"></i> ${act.shortlist_count || 0}</span>
                </div>
            </div>
            <div class="manage-card-right">
                <span class="manage-badge ${badgeClass}">
                    <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${dotColor};margin-right:4px;vertical-align:middle;"></span>
                    ${statusLabel}
                </span>
                <span class="manage-amount">${formatCurrency(act.current_amount)}/${formatCurrency(act.goal_amount)}</span>
                <div class="manage-card-actions">
                    <button class="manage-btn manage-btn-view" title="View">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                    <button class="manage-btn manage-btn-edit" title="Edit">
                        <i class="bi bi-pencil-fill"></i>
                    </button>
                    <button class="manage-btn manage-btn-delete" title="Delete">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.manage-btn-view').onclick = () => {
            window.location.href = `view_FRA.html?id=${act.id}&from=manage`;
        };
        card.querySelector('.manage-btn-edit').onclick = () => openEditModal(act.id);
        card.querySelector('.manage-btn-delete').onclick = () => {
            pendingDeleteId = act.id;
            document.getElementById('delete-modal-msg').textContent =
                `Delete "${act.title}"? This cannot be undone.`;
            deleteModal.show();
        };

        list.appendChild(card);
    });
}

function applyFilters() {
    const query  = document.getElementById('manage-search').value.trim().toLowerCase();
    const status = document.getElementById('manage-status-filter').value;

    const filtered = allActivities.filter(act => {
        const matchTitle  = !query  || act.title?.toLowerCase().includes(query);
        const matchStatus = status === '' || String(act.status) === status;
        return matchTitle && matchStatus;
    });

    renderList(filtered);
}

// ── Load from API ──────────────────────────────────────────────────────────────
async function loadActivities() {
    try {
        const res = await fetch('http://127.0.0.1:8000/fundraiser/activities', {
            credentials: 'include'
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }
        if (!res.ok) throw new Error('Failed to load activities');

        const data = await res.json();
        allActivities = data.activities || [];
        renderList(allActivities);

        document.getElementById('dropdown-username').textContent = data.username || '';
        document.getElementById('dropdown-role').textContent = 'Fundraiser';

    } catch (err) {
        console.error('Load error:', err);
        document.getElementById('manage-activity-list').innerHTML =
            '<p class="manage-empty">Failed to load activities.</p>';
    }
}

loadActivities();

// ── Filters ────────────────────────────────────────────────────────────────────
document.getElementById('manage-search').addEventListener('input', applyFilters);
document.getElementById('manage-status-filter').addEventListener('change', applyFilters);

// ── New Activity button ────────────────────────────────────────────────────────
document.getElementById('manage-new-btn').addEventListener('click', () => {
    window.location.href = 'create_FRA.html';
});

document.getElementById('manage-history-btn').addEventListener('click', () => {
    window.location.href = 'completed_FRA.html';
});

// ── Delete confirm ─────────────────────────────────────────────────────────────
document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    deleteModal.hide();
    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${pendingDeleteId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            allActivities = allActivities.filter(a => a.id !== pendingDeleteId);
            applyFilters();
            showToast('Activity deleted successfully.');
        } else {
            const err = await res.json();
            alert(err.detail || 'Failed to delete activity.');
        }
    } catch (_) {
        alert('Could not connect to the server.');
    } finally {
        pendingDeleteId = null;
    }
});

// ── Edit modal ────────────────────────────────────────────────────────────────
const editFRAModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editFRAModal'));

async function openEditModal(id) {
    editingActivityId = id;
    document.getElementById('fra-edit-error').classList.add('hidden');

    // Fetch full details
    const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${id}`, { credentials: 'include' });
    if (!res.ok) return;
    const a = await res.json();

    document.getElementById('fra-edit-title').value   = a.title || '';
    document.getElementById('fra-edit-service').value = a.service_type || '';
    document.getElementById('fra-edit-goal').value    = a.goal_amount || '';
    document.getElementById('fra-edit-start').value   = a.start_date ? a.start_date.split('T')[0].split(' ')[0] : '';
    document.getElementById('fra-edit-end').value     = a.end_date   ? a.end_date.split('T')[0].split(' ')[0]   : '';
    document.getElementById('fra-edit-status').value  = a.status === 1 ? '1' : '0';

    // Load categories
    const sel = document.getElementById('fra-edit-category');
    sel.innerHTML = '<option value="" disabled>Loading…</option>';
    try {
        const cRes = await fetch('http://127.0.0.1:8000/fundraiser/categories', { credentials: 'include' });
        if (cRes.ok) {
            const cData = await cRes.json();
            sel.innerHTML = '<option value="" disabled>Select category</option>';
            (cData.categories || []).forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.category_name;
                if (cat.id === a.category_id) opt.selected = true;
                sel.appendChild(opt);
            });
        }
    } catch (_) { sel.innerHTML = '<option value="" disabled>Failed to load</option>'; }

    editFRAModal.show();
}

document.getElementById('fra-edit-save-btn').addEventListener('click', async () => {
    const errEl = document.getElementById('fra-edit-error');
    errEl.classList.add('hidden');
    const payload = {
        title:        document.getElementById('fra-edit-title').value.trim()   || undefined,
        service_type: document.getElementById('fra-edit-service').value.trim() || undefined,
        category_id:  Number(document.getElementById('fra-edit-category').value) || undefined,
        goal_amount:  Number(document.getElementById('fra-edit-goal').value)   || undefined,
        start_date:   document.getElementById('fra-edit-start').value          || undefined,
        end_date:     document.getElementById('fra-edit-end').value            || undefined,
        status:       Number(document.getElementById('fra-edit-status').value),
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${editingActivityId}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const e = await res.json();
            errEl.textContent = e.detail || 'Failed to save.';
            errEl.classList.remove('hidden');
            return;
        }
        editFRAModal.hide();
        loadActivities();
        showToast('Activity updated successfully.');
    } catch (_) {
        errEl.textContent = 'Could not connect to the server.';
        errEl.classList.remove('hidden');
    }
});

// ── Gear dropdown ─────────────────────────────────────────────────────────────
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
        await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    window.location.href = 'login.html';
});
