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

// ── Placeholder data (replace with real API calls later) ──────────────────────
renderStats({ total: 4, active: 2, raised: 21000, donors: 170 });

renderActivities([
    {
        description: 'Community Garden',
        category: 'Community',
        status: 'draft',
        created_at: '2026-04-01'
    },
    {
        description: 'Medical Fund for Uncle Lim',
        category: 'Medical',
        status: 'completed',
        created_at: '2026-03-26'
    }
]);

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
