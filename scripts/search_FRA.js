async function searchActivities() {
    const q            = document.getElementById('manage-search').value.trim();
    const filterStatus = document.getElementById('manage-status-filter').value;
    const params       = new URLSearchParams();
    if (q) params.set('q', q);
    if (filterStatus !== '') params.set('filter_status', filterStatus);
    try {
        const res = await fetch(`http://127.0.0.1:8000/fundraiser/activities/search?${params}`, { credentials: 'include' });
        if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderList(data.activities || []);
    } catch {
        document.getElementById('manage-activity-list').innerHTML =
            '<p class="manage-empty">Failed to load activities.</p>';
    }
}

document.getElementById('manage-search').addEventListener('input', searchActivities);
document.getElementById('manage-status-filter').addEventListener('change', searchActivities);
