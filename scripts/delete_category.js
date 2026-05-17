function openDelete(c) {
    pendingDeleteId = c.id;
    document.getElementById('delete-msg').textContent =
        `Delete "${c.category_name}"? This cannot be undone.`;
    deleteModal.show();
}

document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    deleteModal.hide();
    try {
        const res = await fetch(`http://127.0.0.1:8000/platform/categories/${pendingDeleteId}`, {
            method: 'DELETE', credentials: 'include'
        });
        if (res.ok) {
            allCategories = allCategories.filter(c => c.id !== pendingDeleteId);
            applyFilters();
        } else {
            const e = await res.json();
            alert(e.detail || 'Failed to delete category.');
        }
    } catch { alert('Could not connect to the server.'); }
    finally { pendingDeleteId = null; }
});
