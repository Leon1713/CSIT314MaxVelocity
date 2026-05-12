function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
}

function formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

async function loadCategory() {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) { window.location.href = 'manage_categories.html'; return; }

    try {
        const res = await fetch(`http://127.0.0.1:8000/platform/categories/${id}`, {
            credentials: 'include'
        });

        if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
        if (res.status === 404) { window.location.href = 'manage_categories.html'; return; }
        if (!res.ok) throw new Error('Failed to load category');

        const c = await res.json();

        // Banner
        document.getElementById('cat-name').textContent     = c.category_name;
        document.getElementById('cat-id-label').textContent = `Category #${c.id}`;

        // Stats
        document.getElementById('cat-campaigns').textContent = c.campaign_count;
        document.getElementById('cat-created').textContent   = formatDate(c.created_at);
        document.getElementById('cat-updated').textContent   = formatDate(c.updated_at || c.created_at);

        // Description
        document.getElementById('cat-description').textContent = c.category_description || 'No description provided.';

        // Status badge
        const isActive = c.is_active;
        document.getElementById('cat-status-dot').style.background = isActive ? '#22c55e' : '#ef4444';
        document.getElementById('cat-status-text').textContent      = isActive ? 'Active' : 'Inactive';
        const badge = document.getElementById('cat-status-badge');
        badge.style.background = isActive ? '#dcfce7' : '#fee2e2';
        badge.style.border     = isActive ? '1.5px solid #bbf7d0' : '1.5px solid #fecaca';
        badge.style.color      = isActive ? '#166534' : '#991b1b';

        // Full dates
        document.getElementById('cat-created-full').textContent = formatDateTime(c.created_at);
        document.getElementById('cat-updated-full').textContent = formatDateTime(c.updated_at || c.created_at);

        // Wire buttons now that we have the data
        const editModal   = new bootstrap.Modal(document.getElementById('editModal'));
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));

        // Edit — open modal pre-filled with current data
        document.getElementById('cat-edit-btn').addEventListener('click', () => {
            document.getElementById('edit-name').value   = c.category_name;
            document.getElementById('edit-desc').value   = c.category_description || '';
            document.getElementById('edit-status').value = c.is_active ? '1' : '0';
            document.getElementById('edit-error').classList.add('hidden');
            editModal.show();
        });

        document.getElementById('edit-save-btn').addEventListener('click', async () => {
            const name   = document.getElementById('edit-name').value.trim();
            const errEl  = document.getElementById('edit-error');
            if (!name) { errEl.textContent = 'Category name is required.'; errEl.classList.remove('hidden'); return; }
            errEl.classList.add('hidden');

            try {
                const res = await fetch(`http://127.0.0.1:8000/platform/categories/${c.id}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category_name:        name,
                        category_description: document.getElementById('edit-desc').value.trim(),
                        is_active:            Number(document.getElementById('edit-status').value),
                    })
                });
                if (!res.ok) { const e = await res.json(); errEl.textContent = e.detail || 'Failed.'; errEl.classList.remove('hidden'); return; }
                editModal.hide();
                loadCategory(); // reload the page data to reflect changes
            } catch (_) { errEl.textContent = 'Could not connect to the server.'; errEl.classList.remove('hidden'); }
        });

        document.getElementById('cat-delete-btn').addEventListener('click', () => {
            document.getElementById('delete-modal-msg').textContent =
                `Delete "${c.category_name}"? This cannot be undone.`;
            deleteModal.show();
        });

        document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
            deleteModal.hide();
            try {
                const del = await fetch(`http://127.0.0.1:8000/platform/categories/${c.id}`, {
                    method: 'DELETE', credentials: 'include'
                });
                if (del.ok) {
                    window.location.href = 'manage_categories.html';
                } else {
                    const err = await del.json();
                    alert(err.detail || 'Failed to delete category.');
                }
            } catch (_) { alert('Could not connect to the server.'); }
        });

    } catch (err) {
        console.error('Failed to load category:', err);
    }
}

loadCategory();

// ── Gear dropdown ─────────────────────────────────────────────────────────────
const gearBtn  = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');
gearBtn.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', e => e.stopPropagation());
document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try { await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' }); } catch (_) {}
    window.location.href = 'login.html';
});
