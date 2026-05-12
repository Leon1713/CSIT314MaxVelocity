function formatCurrency(amount) {
    if (amount >= 1000000) return '$' + (amount / 1000000).toFixed(1) + 'M';
    if (amount >= 1000)    return '$' + (amount / 1000).toFixed(0) + 'K';
    return '$' + Number(amount).toLocaleString();
}

function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60)    return `${diff} secs ago`;
    if (diff < 3600)  return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)} days ago`;
}

function activityMeta(act) {
    const created = act.created_at ? new Date(act.created_at) : null;
    const updated = act.updated_at ? new Date(act.updated_at) : null;

    if (!act.is_active) {
        return { label: `Category "${act.category_name}" deactivated`, color: '#ef4444', time: act.updated_at || act.created_at };
    }
    if (updated && created && Math.abs(updated - created) > 1000) {
        return { label: `Category "${act.category_name}" updated`, color: '#3b82f6', time: act.updated_at };
    }
    return { label: `Category "${act.category_name}" created`, color: '#22c55e', time: act.created_at };
}

function renderActivity(items) {
    const list = document.getElementById('platform-activity-list');
    list.innerHTML = '';

    if (!items.length) {
        list.innerHTML = '<p class="platform-empty">No recent activity.</p>';
        return;
    }

    items.forEach((act, i) => {
        if (i > 0) {
            const div = document.createElement('div');
            div.className = 'platform-activity-divider';
            list.appendChild(div);
        }

        const meta = activityMeta(act);
        const item = document.createElement('div');
        item.className = 'platform-activity-item platform-activity-item--clickable';
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => {
            window.location.href = `view_category.html?id=${act.id}`;
        });
        item.innerHTML = `
            <div class="platform-activity-icon" style="background:${meta.color}20;color:${meta.color};">
                <i class="bi bi-tag-fill"></i>
            </div>
            <div class="platform-activity-body">
                <span class="platform-activity-title" style="color:${meta.color}">${meta.label}</span>
                <span class="platform-activity-meta">Platform Admin · Category Management</span>
            </div>
            <span class="platform-activity-time">${timeAgo(meta.time)}</span>
        `;
        list.appendChild(item);
    });
}

async function loadDashboard() {
    try {
        const res = await fetch('http://127.0.0.1:8000/platform/stats', { credentials: 'include' });

        if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
        if (!res.ok) throw new Error('Failed to load platform data');

        const data = await res.json();

        document.getElementById('platform-username').textContent      = data.username || '—';
        document.getElementById('stat-categories').textContent        = data.stats.total_categories;
        document.getElementById('stat-campaigns').textContent         = data.stats.active_campaigns;
        document.getElementById('stat-raised').textContent            = formatCurrency(data.stats.total_raised);
        document.getElementById('stat-users').textContent             = data.stats.platform_users;
        document.getElementById('dropdown-username').textContent      = data.username || '';
        document.getElementById('dropdown-role').textContent          = 'Platform Mgmt';

        renderActivity(data.recent_activity || []);

    } catch (err) {
        console.error('Platform dashboard error:', err);
    }
}

loadDashboard();

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
