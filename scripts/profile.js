async function loadProfile() {
    try {
        const res = await fetch('http://127.0.0.1:8000/profile', { credentials: 'include' });

        if (res.status === 401) { window.location.href = 'login.html'; return; }
        if (!res.ok) throw new Error('Failed to load profile');

        const p = await res.json();

        // Header
        document.getElementById('profile-username').textContent = p.username || '—';
        document.getElementById('profile-email').textContent    = p.email    || '—';

        // Avatar initials
        const initials = ((p.first_name?.[0] || '') + (p.last_name?.[0] || '')).toUpperCase() || '?';
        const avatar   = document.getElementById('profile-avatar');
        if (initials !== '?') {
            avatar.textContent  = initials;
            avatar.style.fontSize = '1.6rem';
        }

        // Form fields
        document.getElementById('profile-first-name').value  = p.first_name || '';
        document.getElementById('profile-last-name').value   = p.last_name  || '';
        document.getElementById('profile-email-input').value = p.email      || '';
        document.getElementById('profile-phone').value       = p.phone      || '';
        document.getElementById('profile-bio').value         = p.bio        || '';
        document.getElementById('profile-city').value        = p.city       || '';
        document.getElementById('profile-country').value     = p.country    || '';

    } catch (err) {
        console.error('Profile load error:', err);
    }
}

loadProfile();

// ── Save ──────────────────────────────────────────────────────────────────────
const errorEl   = document.getElementById('profile-error');
const successEl = document.getElementById('profile-success');

document.getElementById('profile-save-btn').addEventListener('click', async () => {
    errorEl.classList.add('hidden');
    successEl.classList.add('hidden');

    const payload = {
        first_name: document.getElementById('profile-first-name').value.trim() || undefined,
        last_name:  document.getElementById('profile-last-name').value.trim()  || undefined,
        email:      document.getElementById('profile-email-input').value.trim() || undefined,
        phone:      document.getElementById('profile-phone').value.trim()       || undefined,
        bio:        document.getElementById('profile-bio').value.trim()         || undefined,
        city:       document.getElementById('profile-city').value.trim()        || undefined,
        country:    document.getElementById('profile-country').value.trim()     || undefined,
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    const btn = document.getElementById('profile-save-btn');
    btn.disabled = true;

    try {
        const res = await fetch('http://127.0.0.1:8000/profile', {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.detail || 'Failed to save changes.';
            errorEl.classList.remove('hidden');
        } else {
            successEl.classList.remove('hidden');
            // Refresh header display
            const fn = document.getElementById('profile-first-name').value.trim();
            const ln = document.getElementById('profile-last-name').value.trim();
            const initials = ((fn[0] || '') + (ln[0] || '')).toUpperCase();
            if (initials) {
                const avatar = document.getElementById('profile-avatar');
                avatar.textContent = initials;
                avatar.style.fontSize = '1.6rem';
            }
        }
    } catch (_) {
        errorEl.textContent = 'Could not connect to the server.';
        errorEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
    }
});
