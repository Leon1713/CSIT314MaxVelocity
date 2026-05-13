const STATUS_COLORS = {
    "active": '#22c55e',
    "inactive": '#f97316',
};

const STATUS_LABELS = {
    1: 'Active',
    0: 'Inactive',
};

const BADGE_CLASSES = {
    "active" : 'manage-badge-active',
    "inactive": 'manage-badge-inactive',
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
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

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
        card.querySelector('.manage-btn-edit').onclick = () => {
            window.location.href = `view_FRA.html?id=${act.id}&edit=true`;
        };
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
        const res = await fetch('https://fastapi-app-production-9d4a.up.railway.app/fundraiser/activities', {
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

// ── Delete confirm ─────────────────────────────────────────────────────────────
document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    deleteModal.hide();
    try {
        const res = await fetch(`https://fastapi-app-production-9d4a.up.railway.app/fundraiser/activity/${pendingDeleteId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            allActivities = allActivities.filter(a => a.id !== pendingDeleteId);
            applyFilters();
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
        await fetch('https://fastapi-app-production-9d4a.up.railway.app/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    window.location.href = 'login.html';
});
