const BASE = 'http://127.0.0.1:8000';
let activeTab = 'all';
let openFRAId = null;
let pendingRemoveId = null;
let favouriteIds = new Set(); // kept in sync client-side after each DB op
let categoryMap = {};

// ── Helpers ──
const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = n => '$' + parseFloat(n || 0).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pct = (c, g) => g > 0 ? Math.min(100, Math.round(c / g * 100)) : 0;
const daysLeft = d => { if (!d) return '—'; const diff = Math.ceil((new Date(d) - new Date()) / 86400000); return diff > 0 ? diff + 'd left' : 'Ended'; };
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const showToast = msg => { document.getElementById('toast-msg').textContent = msg; bootstrap.Toast.getOrCreateInstance(document.getElementById('toast')).show(); };

// ── Build query string from current filters ──
// Every search is a fresh DB call with these as query params
function buildQS() {
    const p = new URLSearchParams();
    const kw = document.getElementById('f-keyword').value.trim();
    const cat = document.getElementById('f-category').value;
    const fr = document.getElementById('f-from').value;
    const to = document.getElementById('f-to').value;
    if (kw) p.set('keyword', kw);
    if (cat) p.set('category_id', cat);
    if (fr) p.set('date_from', fr);
    if (to) p.set('date_to', to);
    return p.toString();
}

// ── DB calls ──
// GET /donee/fundraising_activities[?keyword=&category_id=&date_from=&date_to=]
// Backend: returns all if no params, filters at SQL level if params present
async function dbSearchFRAs() {
    const qs = buildQS();
    const res = await fetch(`${BASE}/donee/fundraising_activities${qs ? '?' + qs : ''}`, { credentials: 'include' });
    if (res.status === 401) { window.location.href = 'login.html'; return []; }
    if (!res.ok) throw new Error();
    return res.json();
}

// GET /donee/favorites[?keyword=&category_id=&date_from=&date_to=]
// Backend: returns all saved if no params, filters at SQL level if params present
async function dbSearchFavourites() {
    const qs = buildQS();
    const res = await fetch(`${BASE}/donee/favorites${qs ? '?' + qs : ''}`, { credentials: 'include' });
    if (!res.ok) throw new Error();
    return res.json();
}

// GET /donee/favorites (no filter) — keeps favouriteIds set in sync
async function dbSyncFavIds() {
    const res = await fetch(`${BASE}/donee/favorites`, { credentials: 'include' });
    if (!res.ok) return;
    const favs = await res.json();
    favouriteIds = new Set(favs.map(f => f.fra_id));
    document.getElementById('count-fav').textContent = favouriteIds.size;
}

// GET /donee/fundraising_activities/{id} — single FRA for detail modal
async function dbGetFRA(fraId) {
    const res = await fetch(`${BASE}/donee/fundraising_activities/${fraId}`, { credentials: 'include' });
    if (!res.ok) throw new Error();
    return res.json();
}

// POST /donee/favorites/{id}
async function dbAddFav(fraId) {
    const res = await fetch(`${BASE}/donee/favorites/${fraId}`, { method: 'POST', credentials: 'include' });
    if (!res.ok) throw new Error();
}

// DELETE /donee/favorites/{id}
async function dbRemoveFav(fraId) {
    const res = await fetch(`${BASE}/donee/favorites/${fraId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error();
}

async function dbFetchCategories() {
    const res = await fetch(`${BASE}/categories`, {
        credentials: "include",
        method: 'GET'
    });
    if (!res.ok) throw new Error("Failed to load categories");
    return await res.json();
}

// ── Populate category dropdown (one-time DB call on load) ──
async function loadCategories() {
    const categories = await dbFetchCategories().catch((err) => []);

    categoryMap = Object.fromEntries(
        categories.map(c => [c.id, c.category_name])
    );

    const sel = document.getElementById('f-category');
    sel.innerHTML = ""; // clear old options

    const allOpt = document.createElement('option');
    allOpt.value = "";
    allOpt.textContent = "All Categories";
    sel.appendChild(allOpt);


    categories.forEach(c => {
        const o = document.createElement('option');
        o.value = c.id;
        o.textContent = c.category_name;
        sel.appendChild(o);
    });
}

// ── Render ──
function renderGrid(items, isFavTab) {
    const grid = document.getElementById('fra-grid');
    grid.innerHTML = '';
    document.getElementById('result-info').innerHTML = `Showing <span>${items.length}</span> campaign${items.length !== 1 ? 's' : ''}`;

    if (!items.length) {
        grid.innerHTML = `<div class="fra-empty"><div class="fra-empty-icon"><i class="bi bi-${isFavTab ? 'heart' : 'search'}"></i></div><div class="fra-empty-title">${isFavTab ? 'No saved campaigns' : 'No campaigns found'}</div><div class="fra-empty-sub">${isFavTab ? 'Save campaigns you like to find them here.' : 'Try adjusting your search or filters.'}</div></div>`;
        return;
    }

    items.forEach(f => {
        const fraId = f.id || f.fra_id;
        const title = f.campaign_title || f.service_type || `Campaign #${fraId}`;
        const p = pct(f.current_amount, f.goal_amount);
        const isFav = favouriteIds.has(fraId);
        const isAct = f.status == 1 || f.status === 'active' || f.status === true;

        const card = document.createElement('div');
        card.className = 'fra-card';
        card.innerHTML = `
                <div class="fra-bar"></div>
                <div class="fra-body">
                    <div class="fra-top">
                        <span class="fra-title">${esc(title)}</span>
                        <button class="fav-btn ${isFav ? 'saved' : ''}" data-id="${fraId}" title="${isFav ? 'Remove from favourites' : 'Save to favourites'}">
                            <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        </button>
                    </div>
                    ${categoryMap[f.category_id] ? `<span class="fra-cat"><i class="bi bi-tag-fill"></i>${esc(categoryMap[f.category_id])}</span>` : ''}
                    <p class="fra-desc">${esc(f.description || '—')}</p>
                    <div>
                        <div class="prog-bg"><div class="prog-fill" style="width:${p}%"></div></div>
                        <div class="prog-nums"><span class="raised">${fmt(f.current_amount)} raised</span><span>${p}% of ${fmt(f.goal_amount)}</span></div>
                    </div>
                </div>
                <div class="fra-foot">
                    <span class="fra-meta"><i class="bi bi-clock me-1"></i>${daysLeft(f.end_date)}</span>
                    <span class="fra-status ${isAct ? 'active' : 'ended'}">${isAct ? 'Active' : 'Ended'}</span>
                </div>`;

        // fav btn — DB call
        card.querySelector('.fav-btn').addEventListener('click', e => {
            e.stopPropagation();
            handleFavToggle(fraId, title, isFav);
        });
        // card click → DB call for single FRA
        card.querySelector('.fra-body').addEventListener('click', e => { if (!e.target.closest('.fav-btn')) openDetail(fraId); });
        card.querySelector('.fra-foot').addEventListener('click', () => openDetail(fraId));
        grid.appendChild(card);
    });
}

// ── Load current tab (always a DB call) ──
async function loadTab() {
    try {
        if (activeTab === 'all') {
            const fras = await dbSearchFRAs();
            document.getElementById('count-all').textContent = fras.length;
            renderGrid(fras, false);
        } else {
            const favs = await dbSearchFavourites();

            // fetch full FRA details for every favourite
            const fullFavs = await Promise.all(
                favs.map(f => dbGetFRA(f.fra_id))
            );

            document.getElementById('count-fav').textContent = fullFavs.length;
            renderGrid(fullFavs, true);
        }
    } catch (_) {
        document.getElementById('fra-grid').innerHTML = `<div class="fra-empty"><div class="fra-empty-icon"><i class="bi bi-exclamation-circle"></i></div><div class="fra-empty-title">Could not load campaigns.</div></div>`;
    }
}

function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tab-all').classList.toggle('active', tab === 'all');
    document.getElementById('tab-fav').classList.toggle('active', tab === 'fav');
    loadTab();
}

// ── Detail modal — DB call ──
async function openDetail(fraId) {
    openFRAId = fraId;
    document.getElementById('detail-body').innerHTML = `<div class="text-center py-3"><span class="spinner-border spinner-border-sm" style="color:var(--fundly-primary)"></span></div>`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('detailModal')).show();
    try {
        const f = await dbGetFRA(fraId);
        const p = pct(f.current_amount, f.goal_amount);
        const title = f.campaign_title || f.service_type || `Campaign #${fraId}`;
        document.getElementById('detail-body').innerHTML = `
                <div class="detail-banner">
                    <h5>${esc(title)}</h5>
                    <p style="color: white">${categoryMap[f.category_id] ? esc(categoryMap[f.category_id]) : ''}</p>
                </div>
                <div class="detail-stats">
                    <div class="detail-stat"><span class="detail-stat-val">${fmt(f.current_amount)}</span><span class="detail-stat-lbl">Raised</span></div>
                    <div class="detail-stat"><span class="detail-stat-val">${fmt(f.goal_amount)}</span><span class="detail-stat-lbl">Goal</span></div>
                    <div class="detail-stat"><span class="detail-stat-val">${daysLeft(f.end_date)}</span><span class="detail-stat-lbl">Deadline</span></div>
                </div>
                <div>
                    <div class="detail-slabel">Progress — ${p}%</div>
                    <div class="detail-prog-bg"><div class="detail-prog-fill" style="width:${p}%"></div></div>
                </div>
                <div>
                    <div class="detail-slabel">Description</div>
                    <p style="font-size:.88rem;color:#555;line-height:1.65;margin:0;">${esc(f.description || 'No description provided.')}</p>
                </div>
                <div class="detail-dates">
                    <div class="detail-date"><div class="detail-date-lbl">Start Date</div><div class="detail-date-val">${fmtDate(f.start_date)}</div></div>
                    <div class="detail-date"><div class="detail-date-lbl">End Date</div><div class="detail-date-val">${fmtDate(f.end_date)}</div></div>
                </div>`;
    } catch (_) {
        document.getElementById('detail-body').innerHTML = `<p style="color:#aaa;text-align:center;">Could not load details.</p>`;
    }
    syncModalFavBtn(fraId);
}

function syncModalFavBtn(fraId) {
    const isFav = favouriteIds.has(fraId);
    const btn = document.getElementById('modal-fav-btn');
    btn.classList.toggle('saved', isFav);
    btn.querySelector('i').className = `bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}`;
    document.getElementById('modal-fav-label').textContent = isFav ? 'Saved ✓' : 'Save to Favourites';
}

document.getElementById('modal-donate-btn').addEventListener('click', (e) => {
    if (openFRAId != null) window.location.href = "donee_donate.html?id=" + openFRAId;
})

document.getElementById('modal-fav-btn').addEventListener('click', () => {
    if (openFRAId != null) handleFavToggle(openFRAId, '', favouriteIds.has(openFRAId));
});

// ── Fav toggle — DB call ──
async function handleFavToggle(fraId, title, currentlyFav) {
    if (currentlyFav && activeTab === 'fav') {
        pendingRemoveId = fraId;
        document.getElementById('remove-msg').textContent = `Remove "${title || 'this campaign'}" from your favourites?`;
        bootstrap.Modal.getOrCreateInstance(document.getElementById('removeModal')).show();
        return;
    }
    await doFavToggle(fraId, currentlyFav);
}

document.getElementById('remove-confirm-btn').addEventListener('click', async () => {
    bootstrap.Modal.getInstance(document.getElementById('removeModal')).hide();
    if (pendingRemoveId != null) { await doFavToggle(pendingRemoveId, true); pendingRemoveId = null; }
});

async function doFavToggle(fraId, currentlyFav) {
    try {
        if (currentlyFav) { await dbRemoveFav(fraId); favouriteIds.delete(fraId); showToast('Removed from favourites.'); }
        else { await dbAddFav(fraId); favouriteIds.add(fraId); showToast('Saved to favourites!'); }
        document.getElementById('count-fav').textContent = favouriteIds.size;
        if (openFRAId === fraId) syncModalFavBtn(fraId);
        await loadTab(); // refresh grid — DB call
    } catch (_) { showToast('Something went wrong.'); }
}

// ── Filter events (debounced keyword, immediate for dropdowns/dates) ──
let debounce;
document.getElementById('f-keyword').addEventListener('input', () => { clearTimeout(debounce); debounce = setTimeout(loadTab, 350); });
document.getElementById('f-category').addEventListener('change', loadTab);
document.getElementById('f-from').addEventListener('change', loadTab);
document.getElementById('f-to').addEventListener('change', loadTab);
document.getElementById('clear-btn').addEventListener('click', () => {
    ['f-keyword', 'f-from', 'f-to'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('f-category').value = '';
    loadTab();
});

// ── Gear / logout ──
document.getElementById('hub-gear-btn').addEventListener('click', () => document.getElementById('hub-settings-dropdown').classList.toggle('hidden'));
document.addEventListener('click', e => { if (!e.target.closest('.hub-gear-wrap')) document.getElementById('hub-settings-dropdown').classList.add('hidden'); });
document.getElementById('hub-logout-btn').addEventListener('click', async () => { await fetch(`${BASE}/logout`, { method: 'POST', credentials: 'include' }); window.location.href = 'login.html'; });

// ── Init ──
(async () => {
    await dbSyncFavIds();    // DB: load all fav fra_ids
    await loadCategories();  // DB: populate category dropdown
    await loadTab();         // DB: load initial grid (all FRAs, no filter)
})();