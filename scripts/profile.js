async function loadProfile() {
    try {
        const res = await fetch('http://127.0.0.1:8000/profile', { credentials: 'include' });

        if (res.status === 401) { window.location.href = 'login.html'; return; }
        if (!res.ok) throw new Error('Failed to load profile');

        const p = await res.json();

        // Header
        document.getElementById('profile-username').textContent = p.username || '—';
        document.getElementById('profile-email').textContent    = p.email    || '—';

        // Avatar: photo > initials > default icon
        const avatarImg  = document.getElementById('profile-avatar-img');
        const avatarIcon = document.getElementById('profile-avatar-icon');
        if (p.profile_picture_url) {
            avatarImg.src = p.profile_picture_url;
            avatarImg.classList.remove('hidden');
            avatarIcon.classList.add('hidden');
        } else {
            const initials = ((p.first_name?.[0] || '') + (p.last_name?.[0] || '')).toUpperCase();
            if (initials) {
                avatarIcon.classList.add('hidden');
                const sp = document.createElement('span');
                sp.textContent  = initials;
                sp.style.cssText = 'font-size:1.6rem;font-weight:800;';
                document.getElementById('profile-avatar').prepend(sp);
            }
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

// ── Photo upload ──────────────────────────────────────────────────────────────
document.getElementById('profile-avatar').addEventListener('click', () => {
    document.getElementById('profile-picture-input').click();
});

document.getElementById('profile-picture-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = ev => {
        const img  = document.getElementById('profile-avatar-img');
        const icon = document.getElementById('profile-avatar-icon');
        img.src = ev.target.result;
        img.classList.remove('hidden');
        icon.classList.add('hidden');
    };
    reader.readAsDataURL(file);

    // Upload to backend
    const form = new FormData();
    form.append('file', file);
    try {
        const res = await fetch('http://127.0.0.1:8000/profile/picture', {
            method: 'POST',
            credentials: 'include',
            body: form
        });
        if (!res.ok) {
            const err = await res.json();
            alert(err.detail || 'Upload failed.');
        }
    } catch (_) {
        alert('Could not connect to the server.');
    }
    e.target.value = '';
});

// ── Save Changes ──────────────────────────────────────────────────────────────
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
            // Refresh header name display
            const fn = document.getElementById('profile-first-name').value.trim();
            const ln = document.getElementById('profile-last-name').value.trim();
            document.getElementById('profile-username').textContent = fn || ln
                ? `${fn} ${ln}`.trim()
                : document.getElementById('profile-username').textContent;
        }
    } catch (_) {
        errorEl.textContent = 'Could not connect to the server.';
        errorEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
    }
});
