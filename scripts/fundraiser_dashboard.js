// Status dot colour map
const STATUS_COLORS = {
    active:    '#22c55e',
    draft:     '#22c55e',
    pending:   '#f97316',
    completed: '#f59e0b',
    cancelled: '#ef4444',
};

function formatCurrency(amount) {
    return '$' + Number(amount).toLocaleString();
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

function renderStats({ total_activities, active, total_raised, donors }) {
    document.getElementById('stat-total').textContent  = total_activities;
    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-raised').textContent = formatCurrency(total_raised);
    document.getElementById('stat-donors').textContent = donors;
}

function renderActivities(activities) {
    const list = document.getElementById('fr-activity-list');
    list.innerHTML = '';

    if (!activities.length) {
        list.innerHTML = '<p class="fr-no-activity">No recent activity.</p>';
        return;
    }

    activities.forEach((act, i) => {
        if (i > 0) {
            const divider = document.createElement('div');
            divider.className = 'platform-activity-divider';
            list.appendChild(divider);
        }

        const statusStr = typeof act.status === 'number'
            ? (act.status === 1 ? 'active' : 'inactive')
            : String(act.status ?? '').toLowerCase();
        const color  = STATUS_COLORS[statusStr] || '#aaa';
        const status = statusStr.charAt(0).toUpperCase() + statusStr.slice(1) || '—';

        const item = document.createElement('div');
        item.className = 'platform-activity-item platform-activity-item--clickable';
        item.innerHTML = `
            <div class="platform-activity-icon" style="background:${color}20;color:${color};">
                <i class="bi bi-cash-stack"></i>
            </div>
            <div class="platform-activity-body">
                <span class="platform-activity-title" style="color:${color}">${act.description || 'Untitled'}</span>
                <span class="platform-activity-meta">${act.category || '—'} · ${status}</span>
            </div>
            <span class="platform-activity-time">${timeAgo(act.created_at)}</span>
        `;
        item.addEventListener('click', () => {
            window.location.href = `view_FRA.html?id=${act.id}`;
        });
        list.appendChild(item);
    });
}

// ── Load dashboard data from API ──────────────────────────────────────────────
async function loadDashboard() {
    try {
        const res = await fetch('http://127.0.0.1:8000/fundraiser/stats', {
            method: 'GET', 
            credentials: 'include'
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        if (!res.ok) throw new Error('Failed to load dashboard data');

        const data = await res.json();

        renderStats(data.stats);
        renderActivities(data.recent_activities);

        document.getElementById('dropdown-username').textContent = data.username || '';
        document.getElementById('dropdown-role').textContent     = 'Fundraiser';
        document.getElementById('fr-username').textContent       = data.username || '';

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

loadDashboard();

// ── Overview button navigation ────────────────────────────────────────────────
document.getElementById('btn-create-activity').addEventListener('click', () => {
    window.location.href = 'create_FRA.html';
});

document.getElementById('btn-manage-activities').addEventListener('click', () => {
    window.location.href = 'manage_FRA.html';
});

document.getElementById('btn-view-history').addEventListener('click', () => {
    window.location.href = 'completed_FRA.html';
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
        await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    window.location.href = 'login.html';
});
