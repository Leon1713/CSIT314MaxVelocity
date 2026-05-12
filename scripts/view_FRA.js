const STATUS_COLORS = {
    active:    '#22c55e',
    pending:   '#f97316',
    completed: '#f59e0b',
    cancelled: '#ef4444',
    inactive:  '#f97316',
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
    return dateStr.split('T')[0].split(' ')[0]; // ensure YYYY-MM-DD
}

function daysLeft(endDateStr) {
    if (!endDateStr) return '—';
    const diff = Math.ceil((new Date(endDateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// ── Load activity details ──────────────────────────────────────────────────────
const params     = new URLSearchParams(window.location.search);
const activityId = params.get('id');
const fromManage = params.get('edit') === 'true' || params.get('from') === 'manage';
const backHref   = fromManage ? 'manage_FRA.html' : 'fundraiser_dashboard.html';

document.getElementById('fra-back-link').href  = backHref;
document.getElementById('fra-close-btn').href  = backHref;
let activityData = null;
let categories   = [];

async function loadActivity() {
    if (!activityId) { window.location.href = 'fundraiser_dashboard.html'; return; }

    try {
        const [actRes, catRes] = await Promise.all([
            fetch(`http://127.0.0.1:8000/fundraiser/activity/${activityId}`, { credentials: 'include' }),
            fetch('http://127.0.0.1:8000/fundraiser/categories',             { credentials: 'include' })
        ]);

        if (actRes.status === 401 || actRes.status === 403) { window.location.href = 'login.html'; return; }
        if (actRes.status === 404) { window.location.href = 'fundraiser_dashboard.html'; return; }
        if (!actRes.ok) throw new Error('Failed to load activity');

        activityData = await actRes.json();
        if (catRes.ok) {
            const catData = await catRes.json();
            categories = catData.categories || [];
        }

        renderView(activityData);
        if (fromManage) enterEditMode();

    } catch (err) {
        console.error('Failed to load activity:', err);
    }
}

function renderView(a) {
    document.getElementById('fra-title').textContent          = a.title;
    document.getElementById('fra-banner-service').textContent = a.service_type;
    document.getElementById('fra-category').textContent       = a.category_name;
    document.getElementById('fra-raised').textContent         = formatCurrency(a.current_amount);
    document.getElementById('fra-goal').textContent           = formatCurrency(a.goal_amount);
    document.getElementById('fra-days').textContent           = daysLeft(a.end_date);
    document.getElementById('fra-service-type').textContent   = a.service_type;
    document.getElementById('fra-start').textContent          = formatDate(a.start_date);
    document.getElementById('fra-end').textContent            = formatDate(a.end_date);

    const statusKey = typeof a.status === 'number'
        ? (a.status === 1 ? 'active' : 'inactive')
        : String(a.status ?? '').toLowerCase();
    const color = STATUS_COLORS[statusKey] || '#aaa';
    const label = statusKey.charAt(0).toUpperCase() + statusKey.slice(1) || '—';
    document.getElementById('fra-status-dot').style.background = color;
    document.getElementById('fra-status-text').textContent     = label;

    document.getElementById('dropdown-username').textContent = a.username || '';
    document.getElementById('dropdown-role').textContent     = 'Fundraiser';
}

// ── Edit mode toggle ──────────────────────────────────────────────────────────
function enterEditMode() {
    const a = activityData;

    // Populate inputs with current values
    document.getElementById('edit-title').value        = a.title        || '';
    document.getElementById('edit-service').value      = a.service_type || '';
    document.getElementById('edit-goal').value         = a.goal_amount  || '';
    document.getElementById('edit-service-desc').value = a.service_type || '';
    document.getElementById('edit-start').value        = toInputDate(a.start_date);
    document.getElementById('edit-end').value          = toInputDate(a.end_date);

    // Populate category dropdown
    const sel = document.getElementById('edit-category');
    sel.innerHTML = '<option value="" disabled>Select category</option>';
    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.category_name;
        if (cat.id === a.category_id) opt.selected = true;
        sel.appendChild(opt);
    });

    // Toggle elements
    document.querySelectorAll('.fra-view').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.fra-edit').forEach(el => el.classList.remove('hidden'));
    document.querySelector('.hub-nav-title').textContent = 'Edit Fund Raising Activity';
}

function exitEditMode() {
    document.querySelectorAll('.fra-edit').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.fra-view').forEach(el => el.classList.remove('hidden'));
    document.querySelector('.hub-nav-title').textContent = 'View Fund Raising Activity';
}

// ── Modals ────────────────────────────────────────────────────────────────────
const saveModal   = new bootstrap.Modal(document.getElementById('saveModal'));
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

// Edit button
document.getElementById('fra-edit-btn').addEventListener('click', enterEditMode);

// Cancel edit — go back to manage page if we came from there, otherwise stay on view
document.getElementById('fra-cancel-edit-btn').addEventListener('click', () => {
    if (fromManage) {
        window.location.href = 'manage_FRA.html';
    } else {
        exitEditMode();
    }
});

// Save Changes → show modal
document.getElementById('fra-save-btn').addEventListener('click', () => saveModal.show());

// Save confirmed → PATCH
document.getElementById('save-confirm-btn').addEventListener('click', async () => {
    saveModal.hide();

    const payload = {
        title:        document.getElementById('edit-title').value.trim()        || undefined,
        service_type: document.getElementById('edit-service').value.trim()      || undefined,
        category_id:  Number(document.getElementById('edit-category').value)    || undefined,
        goal_amount:  Number(document.getElementById('edit-goal').value)        || undefined,
        start_date:   document.getElementById('edit-start').value               || undefined,
        end_date:     document.getElementById('edit-end').value                 || undefined,
    };
    // Remove undefined keys
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${activityId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || 'Failed to save changes.');
            return;
        }

        // Refresh activity data and return to view mode
        const updated = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${activityId}`, { credentials: 'include' });
        activityData = await updated.json();
        renderView(activityData);
        exitEditMode();

    } catch (_) {
        alert('Could not connect to the server.');
    }
});

// Delete
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
            window.location.href = 'fundraiser_dashboard.html';
        } else {
            const err = await del.json();
            alert(err.detail || 'Failed to delete activity.');
        }
    } catch (_) {
        alert('Could not connect to the server.');
    }
});

// ── Gear dropdown ─────────────────────────────────────────────────────────────
const gearBtn  = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');
gearBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', (e) => e.stopPropagation());
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try { await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
    window.location.href = 'login.html';
});

loadActivity();
