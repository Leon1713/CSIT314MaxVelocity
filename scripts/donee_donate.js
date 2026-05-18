const BASE = 'http://127.0.0.1:8000';

        // ── Helpers ──
        const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const fmt = n => '$' + parseFloat(n || 0).toLocaleString('en-SG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const pct = (c, g) => g > 0 ? Math.min(100, Math.round(c / g * 100)) : 0;
        const fmtDate = d => d ? new Date(d).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
        const daysLeft = d => {
            if (!d) return '—';
            const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
            return diff > 0 ? diff + 'd left' : 'Ended';
        };
        const showToast = msg => {
            document.getElementById('fv-toast-msg').textContent = msg;
            bootstrap.Toast.getOrCreateInstance(document.getElementById('fv-toast')).show();
        };

        // ── Read id from URL ──
        const fraId = new URLSearchParams(location.search).get('id');
        let favouriteIds = new Set();

        if (!fraId) {
            document.getElementById('fv-hero-body').innerHTML =
                `<div style="text-align:center;padding:32px;color:#aaa;font-weight:700;">No campaign selected.</div>`;
        }

        // ── GET /donee/fundraising_activities/{fra_id} ──
        async function loadFRA() {
            try {
                const res = await fetch(`${BASE}/donee/fundraising_activities/${fraId}`, { credentials: 'include' });
                if (res.status === 401) { window.location.href = 'login.html'; return; }
                if (!res.ok) throw new Error();
                const f = await res.json();
                renderHero(f);
            } catch (_) {
                document.getElementById('fv-hero-body').innerHTML =
                    `<div style="text-align:center;padding:32px;color:#aaa;font-weight:700;">
                    <i class="bi bi-exclamation-circle" style="font-size:2rem;display:block;margin-bottom:8px;color:var(--fundly-primary);opacity:.4"></i>
                    Could not load campaign.
                </div>`;
            }
        }

        // ── GET /donee/favorites — to know saved state ──
        async function syncFavIds() {
            try {
                const res = await fetch(`${BASE}/donee/favorites`, { credentials: 'include' });
                if (!res.ok) return;
                const favs = await res.json();
                favouriteIds = new Set(favs.map(f => f.fra_id));  // backend Favorite.to_dict() returns fra_id
            } catch (_) { }
        }

        // ── Render FRA detail ──
        function renderHero(f) {
            const p = pct(f.current_amount, f.goal_amount);
            // DB stores status as tinyint 1 (active) / 0 (ended)
            const isAct = f.status == 1 || f.status === 'active' || f.status === true;
            const isFav = favouriteIds.has(Number(fraId));
            // campaign_title is the primary display name; service_type is a sub-label / type tag
            const title = f.campaign_title || f.service_type || `Campaign #${fraId}`;

            document.getElementById('fv-hero-body').innerHTML = `
            ${f.category_name
                    ? `<span class="fv-badge"><i class="bi bi-tag-fill"></i>${esc(f.category_name)}</span>`
                    : ''}

            <div class="fv-title">${esc(title)}</div>

            <div class="fv-status-row">
                <span class="fv-pill ${isAct ? 'active' : 'ended'}">${isAct ? '● Active' : '● Ended'}</span>
                ${f.service_type && f.service_type !== title
                    ? `<span class="fv-tag"><i class="bi bi-tags-fill"></i>${esc(f.service_type)}</span>`
                    : ''}
            </div>

            <div>
                <div class="fv-prog-bg"><div class="fv-prog-fill" id="fv-prog-fill"></div></div>
                <div class="fv-prog-nums">
                    <span class="raised">${fmt(f.current_amount)} raised</span>
                    <span class="goal">${p}% of ${fmt(f.goal_amount)}</span>
                </div>
            </div>

            <div class="fv-stats">
                <div class="fv-stat">
                    <span class="fv-stat-val">${fmt(f.current_amount)}</span>
                    <span class="fv-stat-lbl">Raised</span>
                </div>
                <div class="fv-stat">
                    <span class="fv-stat-val">${fmt(f.goal_amount)}</span>
                    <span class="fv-stat-lbl">Goal</span>
                </div>
                <div class="fv-stat">
                    <span class="fv-stat-val">${daysLeft(f.end_date)}</span>
                    <span class="fv-stat-lbl">Time Left</span>
                </div>
            </div>

            <div>
                <div class="fv-slabel">About this campaign</div>
                <p class="fv-desc">${esc(f.description || 'No description provided.')}</p>
            </div>

            <div class="fv-dates">
                <div class="fv-date-box">
                    <div class="fv-date-lbl">Start Date</div>
                    <div class="fv-date-val">${fmtDate(f.start_date)}</div>
                </div>
                <div class="fv-date-box">
                    <div class="fv-date-lbl">End Date</div>
                    <div class="fv-date-val">${fmtDate(f.end_date)}</div>
                </div>
            </div>

            <button class="fv-fav-btn ${isFav ? 'saved' : ''}" id="fv-fav-btn">
                <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                <span id="fv-fav-label">${isFav ? 'Saved to Favourites' : 'Save to Favourites'}</span>
            </button>`;

            // Animate progress bar
            requestAnimationFrame(() => {
                setTimeout(() => {
                    const fill = document.getElementById('fv-prog-fill');
                    if (fill) fill.style.width = p + '%';
                }, 60);
            });

            document.getElementById('fv-fav-btn').addEventListener('click', toggleFav);
        }

        // ── POST /donee/favorites/{fra_id}  or  DELETE /donee/favorites/{fra_id} ──
        async function toggleFav() {
            const id = Number(fraId);
            const isFav = favouriteIds.has(id);
            try {
                const res = await fetch(`${BASE}/donee/favorites/${fraId}`,
                    { method: isFav ? 'DELETE' : 'POST', credentials: 'include' });
                if (!res.ok) throw new Error();

                const btn = document.getElementById('fv-fav-btn');
                const lbl = document.getElementById('fv-fav-label');
                if (isFav) {
                    favouriteIds.delete(id);
                    btn.classList.remove('saved');
                    btn.querySelector('i').className = 'bi bi-heart';
                    lbl.textContent = 'Save to Favourites';
                    showToast('Removed from favourites.');
                } else {
                    favouriteIds.add(id);
                    btn.classList.add('saved');
                    btn.querySelector('i').className = 'bi bi-heart-fill';
                    lbl.textContent = 'Saved to Favourites';
                    showToast('Saved to favourites!');
                }
            } catch (_) { showToast('Something went wrong.'); }
        }

        // ── Preset buttons ──
        document.querySelectorAll('.fv-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.fv-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('fv-amount').value = btn.dataset.val;
                clearErr();
            });
        });
        document.getElementById('fv-amount').addEventListener('input', () => {
            document.querySelectorAll('.fv-preset').forEach(b => b.classList.remove('active'));
            clearErr();
        });
        function clearErr() {
            document.getElementById('fv-err').textContent = '';
            document.getElementById('fv-amount').classList.remove('error');
        }

        // ── POST /donee/donations/{fra_id}?amount={amount} ──
        // The backend route is:
        //   @router.post("/donations/{fra_id}")
        //   def make_donation(fra_id, amount, user ...):
        // Both fra_id (path) and amount (query param) are read by FastAPI automatically.
        document.getElementById('fv-donate-btn').addEventListener('click', async () => {
            const raw = document.getElementById('fv-amount').value;
            const amount = parseFloat(raw);

            if (!raw || isNaN(amount) || amount <= 0) {
                document.getElementById('fv-err').textContent = 'Please enter a valid donation amount.';
                document.getElementById('fv-amount').classList.add('error');
                return;
            }
            if (amount < 1) {
                document.getElementById('fv-err').textContent = 'Minimum donation is $1.';
                document.getElementById('fv-amount').classList.add('error');
                return;
            }

            const btn = document.getElementById('fv-donate-btn');
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span> Processing…`;

            try {
                const res = await fetch(
                    `${BASE}/donee/donations/${fraId}?amount=${encodeURIComponent(amount)}`,
                    { method: 'POST', credentials: 'include' }
                );

                if (res.status === 401) { window.location.href = 'login.html'; return; }
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || 'Donation failed.');
                }

                // Show success state
                document.getElementById('fv-donate-form').style.display = 'none';
                const s = document.getElementById('fv-success');
                s.style.display = 'flex';
                document.getElementById('fv-success-msg').innerHTML =
                    `Your <strong>${fmt(amount)}</strong> donation has been recorded.<br>Every contribution makes a difference. 💛`;

                showToast(`Donated ${fmt(amount)} — thank you!`);

                // Reload FRA so progress bar reflects new current_amount
                await loadFRA();

            } catch (e) {
                btn.disabled = false;
                btn.innerHTML = `<i class="bi bi-heart-fill"></i> Donate Now`;
                document.getElementById('fv-err').textContent = e.message || 'Something went wrong.';
            }
        });

        // ── Donate Again ──
        document.getElementById('fv-another-btn').addEventListener('click', () => {
            document.getElementById('fv-success').style.display = 'none';
            const form = document.getElementById('fv-donate-form');
            form.style.display = 'flex';
            form.style.flexDirection = 'column';
            document.getElementById('fv-amount').value = '';
            document.querySelectorAll('.fv-preset').forEach(b => b.classList.remove('active'));
            const btn = document.getElementById('fv-donate-btn');
            btn.disabled = false;
            btn.innerHTML = `<i class="bi bi-heart-fill"></i> Donate Now`;
            clearErr();
        });

        // ── Gear / logout ──
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

        // ── Init ──
        if (fraId) {
            (async () => {
                await syncFavIds();  // load fav state before rendering hero
                await loadFRA();
            })();
        }