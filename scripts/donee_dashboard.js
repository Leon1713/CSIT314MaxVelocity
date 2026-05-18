
const BASE = 'http://127.0.0.1:8000';

function fmt(n) {
    return '$' + parseFloat(n || 0).toLocaleString('en-SG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
}
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

async function loadDashboard() {
    // Session / username
    try {
        const res = await fetch(`${BASE}/hub`, { credentials: 'include' });
        if (res.status === 401) { window.location.href = 'login.html'; return; }
        const user = await res.json();
        document.getElementById('donee-username').textContent = user.username || user.email || '—';
        document.getElementById('dropdown-username').textContent = user.username || user.email || '';
        document.getElementById('dropdown-role').textContent = user.role_name || 'Donee';
    } catch (_) { }

    // Donations (no filters → returns all → DB call)
    try {
        const res = await fetch(`${BASE}/donee/donations`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const donations = await res.json();

        const total = donations.reduce((s, d) => s + parseFloat(d.amount || 0), 0);
        document.getElementById('stat-donated').textContent = fmt(total);
        document.getElementById('stat-count').textContent = donations.length;

        // Render recent 5
        const list = document.getElementById('recent-donations-list');
        list.innerHTML = '';
        const recent = donations.slice(0, 5);
        if (!recent.length) {
            list.innerHTML = '<div class="fr-no-activity">No donations yet. <a href="donee_browse_fra.html" style="color:var(--fundly-primary);">Browse campaigns</a></div>';
        } else {
            recent.forEach((d, i) => {
                list.insertAdjacentHTML('beforeend', `
                            <div class="fr-activity-item" onclick="window.location.href='donee_donation_history.html'">
                                <span class="fr-status-dot" style="background:var(--fundly-primary)"></span>
                                <div class="fr-activity-info">
                                    <span class="fr-activity-name">${esc(d.campaign_title || 'Campaign #' + d.fra_id)}</span>
                                    <span class="fr-activity-meta">${esc(d.category_name || '—')}</span>
                                </div>
                                <span class="fr-activity-date" style="color:var(--fundly-primary);font-weight:800;">${fmt(d.amount)}</span>
                            </div>
                            ${i < recent.length - 1 ? '<div class="fr-activity-divider"></div>' : ''}
                        `);
            });
        }
    } catch (_) {
        document.getElementById('stat-donated').textContent = '$0.00';
        document.getElementById('stat-count').textContent = '0';
        document.getElementById('recent-donations-list').innerHTML =
            '<div class="fr-no-activity">Could not load donations.</div>';
    }

    // Favourites count (DB call)
    try {
        const res = await fetch(`${BASE}/donee/favorites`, { credentials: 'include' });
        if (!res.ok) throw new Error();
        const favs = await res.json();
        document.getElementById('stat-favs').textContent = favs.length;
    } catch (_) {
        document.getElementById('stat-favs').textContent = '0';
    }
}

// Gear dropdown
document.getElementById('hub-gear-btn').addEventListener('click', () => {
    document.getElementById('hub-settings-dropdown').classList.toggle('hidden');
});
document.addEventListener('click', e => {
    if (!e.target.closest('.hub-gear-wrap')) {
        document.getElementById('hub-settings-dropdown').classList.add('hidden');
    }
});

// Logout
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    await fetch(`${BASE}/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
});

loadDashboard();