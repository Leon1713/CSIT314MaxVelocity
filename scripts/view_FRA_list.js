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

let allActivities = [];
let pendingDeleteId = null;

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

document.getElementById('manage-new-btn').addEventListener('click', () => {
    window.location.href = 'create_FRA.html';
});

document.getElementById('manage-history-btn').addEventListener('click', () => {
    window.location.href = 'completed_FRA.html';
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
