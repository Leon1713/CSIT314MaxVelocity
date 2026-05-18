let editingActivityId = null;
const editFRAModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('editFRAModal'));

async function openEditModal(id) {
    editingActivityId = id;
    document.getElementById('fra-edit-error').classList.add('hidden');

    const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${id}`, { credentials: 'include' });
    if (!res.ok) return;
    const a = await res.json();

    document.getElementById('fra-edit-title').value   = a.title || '';
    document.getElementById('fra-edit-service').value = a.service_type || '';
    document.getElementById('fra-edit-goal').value    = a.goal_amount || '';
    document.getElementById('fra-edit-start').value   = a.start_date ? a.start_date.split('T')[0].split(' ')[0] : '';
    document.getElementById('fra-edit-end').value     = a.end_date   ? a.end_date.split('T')[0].split(' ')[0]   : '';
    document.getElementById('fra-edit-status').value  = a.status === 1 ? '1' : '0';

    const sel = document.getElementById('fra-edit-category');
    sel.innerHTML = '<option value="" disabled>Loading…</option>';
    try {
        const cRes = await fetch('http://127.0.0.1:8000/fundraiser/categories', { credentials: 'include' });
        if (cRes.ok) {
            const cData = await cRes.json();
            sel.innerHTML = '<option value="" disabled>Select category</option>';
            (cData.categories || []).forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = cat.category_name;
                if (cat.id === a.category_id) opt.selected = true;
                sel.appendChild(opt);
            });
        }
    } catch (_) { sel.innerHTML = '<option value="" disabled>Failed to load</option>'; }

    editFRAModal.show();
}

document.getElementById('fra-edit-save-btn').addEventListener('click', async () => {
    const errEl = document.getElementById('fra-edit-error');
    errEl.classList.add('hidden');
    const payload = {
        title:        document.getElementById('fra-edit-title').value.trim()       || undefined,
        service_type: document.getElementById('fra-edit-service').value.trim()     || undefined,
        category_id:  Number(document.getElementById('fra-edit-category').value)   || undefined,
        goal_amount:  Number(document.getElementById('fra-edit-goal').value)        || undefined,
        start_date:   document.getElementById('fra-edit-start').value              || undefined,
        end_date:     document.getElementById('fra-edit-end').value                || undefined,
        status:       Number(document.getElementById('fra-edit-status').value),
    };
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);
    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activity/${editingActivityId}`, {
            method: 'PATCH', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const e = await res.json();
            errEl.textContent = e.detail || 'Failed to save.';
            errEl.classList.remove('hidden');
            return;
        }
        editFRAModal.hide();
        loadActivities();
        showToast('Activity updated successfully.');
    } catch (_) {
        errEl.textContent = 'Could not connect to the server.';
        errEl.classList.remove('hidden');
    }
});
