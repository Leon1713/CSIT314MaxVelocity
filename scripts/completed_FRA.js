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
function renderList(activities) {
    const list = document.getElementById('completed-activity-list');
    list.innerHTML = '';

    if (!activities.length) {
        list.innerHTML = '<p class="manage-empty">No completed activities found.</p>';
        return;
    }

    activities.forEach(act => {
        const pct = progressPct(act.current_amount, act.goal_amount);

        const card = document.createElement('div');
        card.className = 'manage-activity-card';
        card.innerHTML = `
            <div class="manage-card-icon-wrap" style="background:#f1f5f9;color:#64748b;">
                <i class="bi bi-archive-fill"></i>
            </div>
            <div class="manage-card-body">
                <div class="manage-card-title">${act.title || 'Untitled'}</div>
                <div class="manage-card-meta">${act.category_name || '—'} · ${act.service_type || '—'} · ended ${formatDate(act.end_date)}</div>
                <div class="manage-progress-wrap">
                    <div class="manage-progress-fill" style="width:${pct}%;background:#94a3b8;"></div>
                </div>
                <div class="manage-card-counts">
                    <span><i class="bi bi-eye-fill"></i> ${act.view_count || 0}</span>
                    <span><i class="bi bi-bookmark-fill"></i> ${act.shortlist_count || 0}</span>
                </div>
            </div>
            <div class="manage-card-right">
                <span class="manage-amount">${formatCurrency(act.current_amount)} / ${formatCurrency(act.goal_amount)}</span>
                <div class="manage-card-actions">
                    <button class="manage-btn manage-btn-view" title="View Details">
                        <i class="bi bi-eye-fill"></i>
                    </button>
                </div>
            </div>
        `;

        card.querySelector('.manage-btn-view').onclick = () => {
            window.location.href = `view_FRA.html?id=${act.id}&from=history`;
        };

        list.appendChild(card);
    });
}

// ── Load categories into dropdown ─────────────────────────────────────────────
async function loadCategories() {
    try {
        const res = await fetch('http://127.0.0.1:8000/fundraiser/categories', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const sel = document.getElementById('filter-category');
        (data.categories || []).forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.category_name;
            sel.appendChild(opt);
        });
    } catch (_) {}
}

loadCategories();

// ── Load from API ──────────────────────────────────────────────────────────────
async function loadCompleted(filters = {}) {
    const list = document.getElementById('completed-activity-list');
    list.innerHTML = '<p class="manage-empty">Loading…</p>';

    const params = new URLSearchParams();
    if (filters.keyword)     params.set('keyword',     filters.keyword);
    if (filters.category_id) params.set('category_id', filters.category_id);
    if (filters.date_from)   params.set('date_from',   filters.date_from);
    if (filters.date_to)     params.set('date_to',     filters.date_to);

    try {
        const url = `http://127.0.0.1:8000/fundraiser/completed_activities${params.toString() ? '?' + params : ''}`;
        const res = await fetch(url, { credentials: 'include' });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }
        if (!res.ok) throw new Error('Failed to load');

        const data = await res.json();
        renderList(data.activities || []);

        document.getElementById('dropdown-username').textContent = data.username || '';
        document.getElementById('dropdown-role').textContent = 'Fundraiser';

    } catch (err) {
        console.error('Load error:', err);
        list.innerHTML = '<p class="manage-empty">Failed to load completed activities.</p>';
    }
}

loadCompleted();

// ── Filter buttons ─────────────────────────────────────────────────────────────
document.getElementById('btn-search').addEventListener('click', () => {
    loadCompleted({
        keyword:     document.getElementById('filter-keyword').value.trim() || undefined,
        category_id: document.getElementById('filter-category').value || undefined,
        date_from:   document.getElementById('filter-date-from').value || undefined,
        date_to:     document.getElementById('filter-date-to').value || undefined,
    });
});

document.getElementById('btn-clear').addEventListener('click', () => {
    document.getElementById('filter-keyword').value   = '';
    document.getElementById('filter-category').value  = '';
    document.getElementById('filter-date-from').value = '';
    document.getElementById('filter-date-to').value   = '';
    loadCompleted();
});

document.getElementById('filter-keyword').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-search').click();
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
