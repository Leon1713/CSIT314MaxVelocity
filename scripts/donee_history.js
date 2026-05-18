const BASE = 'http://127.0.0.1:8000';
let openFRAId = null;

// ── Helpers ──────────────────────────────────────────────────────────────────
const esc     = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const fmt     = n => '$'+parseFloat(n||0).toLocaleString('en-SG',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-SG',{day:'numeric',month:'short',year:'numeric'}) : '—';
const fmtDT   = d => d ? new Date(d).toLocaleString('en-SG',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}) : '—';
const pct     = (c,g) => g > 0 ? Math.min(100, Math.round(c / g * 100)) : 0;

// ── Build query string from active filters ────────────────────────────────────
function buildQS() {
    const p   = new URLSearchParams();
    const kw  = document.getElementById('f-keyword').value.trim();
    const cat = document.getElementById('f-category').value;
    const fr  = document.getElementById('f-from').value;
    const to  = document.getElementById('f-to').value;
    if (kw)  p.set('keyword',     kw);
    if (cat) p.set('category_id', cat);
    if (fr)  p.set('date_from',   fr);
    if (to)  p.set('date_to',     to);
    return p.toString();
}

// ── Single fetch: GET /donee/donations[?filters] ──────────────────────────────
// Backend returns donation rows already merged with FRA + category details.
async function fetchDonations() {
    const qs  = buildQS();
    const res = await fetch(`${BASE}/donee/donations${qs ? '?' + qs : ''}`, { credentials: 'include' });
    if (res.status === 401) { window.location.href = 'login.html'; return []; }
    if (!res.ok) throw new Error('fetch failed');
    return res.json();
}

// ── Populate summary stats from an array of donation rows ─────────────────────
// Called once on init with the full unfiltered set so stats always show all-time.
function renderSummary(all) {
    const total     = all.reduce((s, d) => s + parseFloat(d.amount || 0), 0);
    const campaigns = new Set(all.map(d => d.fra_id)).size;
    document.getElementById('sum-total').textContent     = fmt(total);
    document.getElementById('sum-count').textContent     = all.length;
    document.getElementById('sum-campaigns').textContent = campaigns;
}

// ── Populate category dropdown from donation rows (runs once on init) ─────────
function populateCategories(all) {
    const seen = {};
    all.forEach(d => {
        if (d.category_id && d.category_name) seen[d.category_id] = d.category_name;
    });
    const sel = document.getElementById('f-category');
    // Clear any previously added options (keep the default "All Categories")
    while (sel.options.length > 1) sel.remove(1);
    Object.entries(seen).forEach(([id, name]) => {
        const o = document.createElement('option');
        o.value = id;
        o.textContent = name;
        sel.appendChild(o);
    });
}

// ── Render table ──────────────────────────────────────────────────────────────
function renderTable(donations) {
    const tbody          = document.getElementById('dh-tbody');
    const filteredTotal  = donations.reduce((s, d) => s + parseFloat(d.amount || 0), 0);

    document.getElementById('result-info').innerHTML =
        `Showing <span>${donations.length}</span> donation${donations.length !== 1 ? 's' : ''}` +
        (donations.length ? ` · Total: <span>${fmt(filteredTotal)}</span>` : '');

    if (!donations.length) {
        tbody.innerHTML = `
            <tr><td colspan="6">
                <div class="dh-empty">
                    <div class="dh-empty-icon"><i class="bi bi-clock-history"></i></div>
                    <div class="dh-empty-title">No donations found</div>
                    <div class="dh-empty-sub">Try adjusting your search or date range.</div>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    donations.forEach((d, i) => {
        const tr = document.createElement('tr');
        tr.className = 'dh-row';
        tr.innerHTML = `
            <td style="color:#ccc;font-weight:700;font-size:.78rem;">${i + 1}</td>
            <td class="dh-campaign" title="${esc(d.campaign_title || 'Campaign #' + d.fra_id)}">${esc(d.campaign_title || 'Campaign #' + d.fra_id)}</td>
            <td>${d.category_name
                ? `<span class="dh-cat"><i class="bi bi-tag-fill"></i>${esc(d.category_name)}</span>`
                : '<span style="color:#ddd">—</span>'}</td>
            <td class="dh-amount">${fmt(d.amount)}</td>
            <td class="dh-date">${fmtDate(d.created_at)}</td>
            <td><button class="manage-btn manage-btn-view" title="View details"><i class="bi bi-eye-fill"></i></button></td>`;
        tr.querySelector('.manage-btn-view').addEventListener('click', e => { e.stopPropagation(); openDetail(d); });
        tr.addEventListener('click', () => openDetail(d));
        tbody.appendChild(tr);
    });
}

// ── Show skeleton while loading ───────────────────────────────────────────────
function showSkeleton() {
    document.getElementById('dh-tbody').innerHTML = `
        <tr><td colspan="6" style="padding:32px;text-align:center;">
            <div style="display:flex;flex-direction:column;gap:8px;max-width:300px;margin:0 auto;">
                <div class="skel" style="width:100%"></div>
                <div class="skel" style="width:80%"></div>
                <div class="skel" style="width:90%"></div>
            </div>
        </td></tr>`;
}

// ── Detail modal ──────────────────────────────────────────────────────────────
function openDetail(d) {
    openFRAId = d.fra_id;
    const p         = pct(d.current_amount || 0, d.goal_amount || 0);
    const fraActive = d.fra_status == 1 || d.fra_status === 'active';

    document.getElementById('don-detail').innerHTML = `
        <div class="don-banner">
            <div class="don-banner-lbl">You donated</div>
            <span class="don-banner-amt">${fmt(d.amount)}</span>
            <div class="don-banner-date">${fmtDT(d.created_at)}</div>
        </div>
        <div class="don-detail-grid">
            <div class="don-detail-item">
                <div class="don-detail-lbl">Campaign</div>
                <div class="don-detail-val">${esc(d.campaign_title || 'Campaign #' + d.fra_id)}</div>
            </div>
            <div class="don-detail-item">
                <div class="don-detail-lbl">Category</div>
                <div class="don-detail-val">${esc(d.category_name || '—')}</div>
            </div>
            <div class="don-detail-item">
                <div class="don-detail-lbl">Campaign Status</div>
                <div class="don-detail-val" style="color:${fraActive ? '#16a34a' : '#c0392b'}">
                    ${fraActive ? '● Active' : '● Ended'}
                </div>
            </div>
            <div class="don-detail-item">
                <div class="don-detail-lbl">Campaign Ends</div>
                <div class="don-detail-val">${fmtDate(d.fra_end_date)}</div>
            </div>
        </div>
        <div class="don-prog-section">
            <div class="don-prog-header">
                <span class="don-prog-title">Campaign Progress</span>
                <span class="don-prog-pct">${p}% funded</span>
            </div>
            <div class="don-prog-bg"><div class="don-prog-fill" style="width:${p}%"></div></div>
            <div class="don-prog-nums">
                <span>${fmt(d.current_amount || 0)} raised</span>
                <span>Goal: ${fmt(d.goal_amount || 0)}</span>
            </div>
        </div>
        ${d.description ? `
        <div>
            <div style="font-size:.72rem;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:.4px;margin-bottom:5px;">About this campaign</div>
            <p style="font-size:.85rem;color:#666;line-height:1.6;margin:0;">${esc(d.description)}</p>
        </div>` : ''}`;

    bootstrap.Modal.getOrCreateInstance(document.getElementById('donModal')).show();
}

// Navigate to the specific FRA page when "View Campaign" is clicked
document.getElementById('view-campaign-btn').addEventListener('click', () => {
    bootstrap.Modal.getInstance(document.getElementById('donModal')).hide();
    if (openFRAId) {
        window.location.href = `donee_donate.html?id=${openFRAId}`;
    } else {
        window.location.href = 'donee_browse_fra.html';
    }
});

// ── Filter events ─────────────────────────────────────────────────────────────
let debounce;
document.getElementById('f-keyword').addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(loadTable, 350);
});
document.getElementById('f-category').addEventListener('change', loadTable);
document.getElementById('f-from').addEventListener('change', loadTable);
document.getElementById('f-to').addEventListener('change', loadTable);
document.getElementById('clear-btn').addEventListener('click', () => {
    ['f-keyword', 'f-from', 'f-to'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-category').value = '';
    loadTable();
});

// ── Load filtered table (called on every filter change) ───────────────────────
async function loadTable() {
    showSkeleton();
    try {
        const donations = await fetchDonations();
        renderTable(donations);
    } catch (_) {
        document.getElementById('dh-tbody').innerHTML = `
            <tr><td colspan="6">
                <div class="dh-empty">
                    <div class="dh-empty-icon"><i class="bi bi-exclamation-circle"></i></div>
                    <div class="dh-empty-title">Could not load donations.</div>
                </div>
            </td></tr>`;
    }
}

// ── Gear / logout ─────────────────────────────────────────────────────────────
document.getElementById('hub-gear-btn').addEventListener('click', () =>
    document.getElementById('hub-settings-dropdown').classList.toggle('hidden'));
document.addEventListener('click', e => {
    if (!e.target.closest('.hub-gear-wrap'))
        document.getElementById('hub-settings-dropdown').classList.add('hidden');
});
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    await fetch(`${BASE}/logout`, { method: 'POST', credentials: 'include' });
    window.location.href = 'login.html';
});

async function fetchSession()
{
     const res = await fetch(`${BASE}/hub`, { credentials: 'include' });
        if (res.status === 401) { window.location.href = 'login.html'; return; }
        const user = await res.json();
        document.getElementById('dropdown-username').textContent = user.username || user.email || '';
        document.getElementById('dropdown-role').textContent = user.role_name || 'Donee';
}

// ── Init: one fetch, derive everything from it ────────────────────────────────
(async () => {
    showSkeleton();
    try {
        await fetchSession()
        // Fetch unfiltered first — used for summary stats + category dropdown
        const all = await fetchDonations();
        renderSummary(all);
        populateCategories(all);
        renderTable(all);
    } catch (_) {
        document.getElementById('dh-tbody').innerHTML = `
            <tr><td colspan="6">
                <div class="dh-empty">
                    <div class="dh-empty-icon"><i class="bi bi-exclamation-circle"></i></div>
                    <div class="dh-empty-title">Could not load donations.</div>
                </div>
            </td></tr>`;
    }
})();