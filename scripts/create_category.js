document.getElementById('cat-new-btn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('edit-modal-title').textContent = 'New Category';
    document.getElementById('edit-name').value   = '';
    document.getElementById('edit-desc').value   = '';
    document.getElementById('edit-status').value = '1';
    document.getElementById('edit-error').classList.add('hidden');
    editModal.show();
});

document.getElementById('edit-save-btn').addEventListener('click', async () => {
    if (editingId) return;
    const name   = document.getElementById('edit-name').value.trim();
    const desc   = document.getElementById('edit-desc').value.trim();
    const status = document.getElementById('edit-status').value;
    const errEl  = document.getElementById('edit-error');

    if (!name) {
        errEl.textContent = 'Category name is required.';
        errEl.classList.remove('hidden');
        return;
    }
    errEl.classList.add('hidden');

    try {
        const res = await fetch('http://127.0.0.1:8000/platform/categories', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_name: name, category_description: desc, is_active: Number(status) })
        });
        if (!res.ok) { const e = await res.json(); errEl.textContent = e.detail || 'Failed.'; errEl.classList.remove('hidden'); return; }
        editModal.hide();
        loadCategories();
        showSuccess('Category created successfully.');
    } catch { errEl.textContent = 'Could not connect.'; errEl.classList.remove('hidden'); }
});
