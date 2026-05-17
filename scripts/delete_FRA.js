document.getElementById('delete-confirm-btn').addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    deleteModal.hide();
    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${pendingDeleteId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            loadActivities();
            showToast('Activity deleted successfully.');
        } else {
            const err = await res.json();
            alert(err.detail || 'Failed to delete activity.');
        }
    } catch (_) {
        alert('Could not connect to the server.');
    } finally {
        pendingDeleteId = null;
    }
});
