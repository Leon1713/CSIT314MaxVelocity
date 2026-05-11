const STATUS_COLORS = {
    active:    '#22c55e',
    pending:   '#f97316',
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

function daysLeft(endDateStr) {
    if (!endDateStr) return '—';
    const diff = Math.ceil((new Date(endDateStr) - new Date()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
}

// ── Load activity details ──────────────────────────────────────────────────────
async function loadActivity() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
        window.location.href = 'fundraiser_dashboard.html';
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${id}`, {
            credentials: 'include'
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }
        if (res.status === 404) {
            window.location.href = 'fundraiser_dashboard.html';
            return;
        }
        if (!res.ok) throw new Error('Failed to load activity');

        const a = await res.json();

        document.getElementById('fra-title').textContent        = a.title;
        document.getElementById('fra-banner-service').textContent = a.service_type;
        document.getElementById('fra-category').textContent        = a.category_name;
        document.getElementById('fra-raised').textContent       = formatCurrency(a.current_amount);
        document.getElementById('fra-goal').textContent         = formatCurrency(a.goal_amount);
        document.getElementById('fra-days').textContent         = daysLeft(a.end_date);
        document.getElementById('fra-service-type').textContent = a.service_type;
        document.getElementById('fra-start').textContent        = formatDate(a.start_date);
        document.getElementById('fra-end').textContent          = formatDate(a.end_date);

        const statusKey = a.status?.toLowerCase();
        const color = STATUS_COLORS[statusKey] || '#aaa';
        const label = a.status
            ? a.status.charAt(0).toUpperCase() + a.status.slice(1)
            : '—';
        document.getElementById('fra-status-dot').style.background = color;
        document.getElementById('fra-status-text').textContent     = label;

        document.getElementById('fra-edit-btn').onclick = () => {
            window.location.href = `edit_FRA.html?id=${a.id}`;
        };

    } catch (err) {
        console.error('Failed to load activity:', err);
    }
}

loadActivity();

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
