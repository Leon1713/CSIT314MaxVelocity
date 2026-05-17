function openEdit(c) {
    editingId = c.id;
    document.getElementById('edit-modal-title').textContent = 'Edit Category';
    document.getElementById('edit-name').value   = c.category_name;
    document.getElementById('edit-desc').value   = c.category_description || '';
    document.getElementById('edit-status').value = c.is_active ? '1' : '0';
    document.getElementById('edit-error').classList.add('hidden');
    editModal.show();
}

document.getElementById('edit-save-btn').addEventListener('click', async () => {
    if (!editingId) return;
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
        const res = await fetch(`http://127.0.0.1:8000/platform/categories/${editingId}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_name: name, category_description: desc, is_active: Number(status) })
        });
        if (!res.ok) { const e = await res.json(); errEl.textContent = e.detail || 'Failed.'; errEl.classList.remove('hidden'); return; }
        editModal.hide();
        loadCategories();
        showSuccess('Category updated successfully.');
    } catch { errEl.textContent = 'Could not connect.'; errEl.classList.remove('hidden'); }
});
