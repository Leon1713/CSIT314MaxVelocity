const STATUS_COLORS = {
    active: '#22c55e',
    inactive: '#ef4444',
    pending: '#f97316',
    completed: '#f59e0b',
    cancelled: '#ef4444',
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

function toInputDate(dateStr) {
    if (!dateStr) return '';
    return dateStr.split('T')[0].split(' ')[0];
}

function daysLeft(endDateStr) {
    if (!endDateStr) return '—';
    const diff = Math.ceil((new Date(endDateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// ── Routing ───────────────────────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const activityId = params.get('id');
const fromParam  = params.get('from');
const backHref   = fromParam === 'manage'  ? 'manage_FRA.html'
                 : fromParam === 'history' ? 'completed_FRA.html'
                 : 'fundraiser_dashboard.html';

document.getElementById('fra-back-link').href = backHref;
document.getElementById('fra-close-btn').href = backHref;

// ── Render view ───────────────────────────────────────────────────────────────
let activityData = null;

function renderView(a) {
    document.getElementById('fra-title').textContent          = a.title;
    document.getElementById('fra-banner-service').textContent = a.service_type;
    document.getElementById('fra-category').textContent       = a.category_name;
    document.getElementById('fra-raised').textContent         = formatCurrency(a.current_amount);
    document.getElementById('fra-goal').textContent           = formatCurrency(a.goal_amount);
    document.getElementById('fra-days').textContent           = daysLeft(a.end_date);
    document.getElementById('fra-views').textContent          = a.view_count ?? 0;
    document.getElementById('fra-shortlisted').textContent    = a.shortlist_count ?? 0;
    document.getElementById('fra-service-type').textContent   = a.service_type;
    document.getElementById('fra-start').textContent          = formatDate(a.start_date);
    document.getElementById('fra-end').textContent            = formatDate(a.end_date);

    const statusKey = typeof a.status === 'number'
        ? (a.status === 1 ? 'active' : 'inactive')
        : String(a.status ?? '').toLowerCase();
    const isActive = a.status === 1 || statusKey === 'active';
    const color = STATUS_COLORS[statusKey] || '#aaa';
    const label = statusKey.charAt(0).toUpperCase() + statusKey.slice(1) || '—';
    document.getElementById('fra-status-dot').style.background = color;
    document.getElementById('fra-status-text').textContent = label;
    const badge = document.getElementById('fra-status-badge');
    badge.style.background = isActive ? '#f0fdf4' : '#fee2e2';
    badge.style.border = isActive ? '1.5px solid #bbf7d0' : '1.5px solid #fecaca';
    badge.style.color = isActive ? '#166534' : '#991b1b';

    document.getElementById('dropdown-username').textContent = a.username || '';
    document.getElementById('dropdown-role').textContent = 'Fundraiser';
}

async function loadActivity() {
    if (!activityId) { window.location.href = 'fundraiser_dashboard.html'; return; }
    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${activityId}`, {
            credentials: 'include'
        });
        if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
        if (res.status === 404) { window.location.href = 'fundraiser_dashboard.html'; return; }
        if (!res.ok) throw new Error();
        activityData = await res.json();
        renderView(activityData);
        // Record view and update count in place
        fetch(`http://127.0.0.1:8000/fundraiser/activity/${activityId}/view`, {
            method: 'POST', credentials: 'include'
        }).then(() => {
            const el = document.getElementById('fra-views');
            if (el) el.textContent = (parseInt(el.textContent) || 0) + 1;
        }).catch(() => {});
    } catch (err) {
        console.error('Failed to load activity:', err);
    }
}

loadActivity();

function showToast(msg, delay = 2500) {
    document.getElementById('fra-toast-msg').textContent = msg;
    new bootstrap.Toast(document.getElementById('fra-success-toast'), { delay }).show();
}

// ── Modals ────────────────────────────────────────────────────────────────────
const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal'));
const deleteModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('deleteModal'));

// ── Edit ──────────────────────────────────────────────────────────────────────
document.getElementById('fra-edit-btn').addEventListener('click', async () => {
    const a = activityData;
    if (!a) return;

    // Pre-fill fields
    document.getElementById('edit-title').value = a.title || '';
    document.getElementById('edit-service').value = a.service_type || '';
    document.getElementById('edit-goal').value = a.goal_amount || '';
    document.getElementById('edit-start').value = toInputDate(a.start_date);
    document.getElementById('edit-end').value = toInputDate(a.end_date);
    document.getElementById('edit-status').value = (a.status === 1 || a.status === true) ? '1' : '0';
    document.getElementById('edit-error').classList.add('hidden');

    // Load categories into select
    const sel = document.getElementById('edit-category');
    sel.innerHTML = '<option value="" disabled>Loading…</option>';
    try {
        const res = await fetch('http://127.0.0.1:8000/fundraiser/categories', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            sel.innerHTML = '<option value="" disabled>Select category</option>';
            (data.categories || []).forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.category_name;
                if (cat.id === a.category_id) opt.selected = true;
                sel.appendChild(opt);
            });
        }
    } catch (_) { sel.innerHTML = '<option value="" disabled>Failed to load</option>'; }

    editModal.show();
});

document.getElementById('edit-save-btn').addEventListener('click', async () => {
    const errEl = document.getElementById('edit-error');
    errEl.classList.add('hidden');

    const payload = { // need see how modal looks like
        title: document.getElementById('edit-title').value.trim() || undefined,
        service_type: document.getElementById('edit-service').value.trim() || undefined,
        category_id: Number(document.getElementById('edit-category').value) || undefined,
        goal_amount: Number(document.getElementById('edit-goal').value) || undefined,
        start_date: document.getElementById('edit-start').value || undefined,
        end_date: document.getElementById('edit-end').value || undefined,
        status: Number(document.getElementById('edit-status').value),
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${activityId}`, {
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
        editModal.hide();
        loadActivity();
        showToast('Activity updated successfully.');
    } catch (_) {
        errEl.textContent = 'Could not connect to the server.';
        errEl.classList.remove('hidden');
    }
});

// ── Delete ────────────────────────────────────────────────────────────────────
document.getElementById('fra-delete-btn').addEventListener('click', () => {
    document.getElementById('delete-modal-msg').textContent =
        `Delete "${activityData?.title}"? This cannot be undone.`;
    deleteModal.show();
});

document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    deleteModal.hide();
    try {
        const del = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${activityId}`, {
            method: 'DELETE', credentials: 'include'
        });
        if (del.ok) {
            showToast('Activity deleted successfully.', 1800);
            setTimeout(() => { window.location.href = backHref; }, 1800);
        } else {
            const err = await del.json();
            alert(err.detail || 'Failed to delete activity.');
        }
    } catch (_) { alert('Could not connect to the server.'); }
});

// ── Gear dropdown ─────────────────────────────────────────────────────────────
const gearBtn = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');
gearBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', (e) => e.stopPropagation());
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try { await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' }); } catch (_) { }
    window.location.href = 'login.html';
});
