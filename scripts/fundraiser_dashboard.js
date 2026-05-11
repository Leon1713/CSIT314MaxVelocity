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

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
}

function renderStats({ total, active, raised, donors }) {
    document.getElementById('stat-total').textContent  = total;
    document.getElementById('stat-active').textContent = active;
    document.getElementById('stat-raised').textContent = formatCurrency(raised);
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
            divider.className = 'fr-activity-divider';
            list.appendChild(divider);
        }

        const color  = STATUS_COLORS[act.status?.toLowerCase()] || '#aaa';
        const status = act.status
            ? act.status.charAt(0).toUpperCase() + act.status.slice(1)
            : '—';

        const item = document.createElement('div');
        item.className = 'fr-activity-item';
        item.innerHTML = `
            <span class="fr-status-dot" style="background:${color}"></span>
            <div class="fr-activity-info">
                <span class="fr-activity-name">${act.description || 'Untitled'}</span>
                <span class="fr-activity-meta">${act.category || '—'} · ${status}</span>
            </div>
            <span class="fr-activity-date">${formatDate(act.created_at)}</span>
        `;
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

        document.getElementById('dropdown-username').textContent = data.username;
        document.getElementById('dropdown-role').textContent = 'Fundraiser';

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

loadDashboard();

// ── Overview button navigation ────────────────────────────────────────────────
document.getElementById('btn-create-activity').addEventListener('click', () => {
    window.location.href = 'create_FRA.html';
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
