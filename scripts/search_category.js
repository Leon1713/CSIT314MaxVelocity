async function searchCategories() {
    const q            = document.getElementById('cat-search').value.trim();
    const filterStatus = document.getElementById('cat-status-filter').value;
    const params       = new URLSearchParams();
    if (q) params.set('q', q);
    if (filterStatus !== '') params.set('filter_status', filterStatus);
    try {
        const res = await fetch(`http://127.0.0.1:8000/platform/categories/search?${params}`, { credentials: 'include' });
        if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
        if (!res.ok) throw new Error();
        const data = await res.json();
        renderTable(data.categories || []);
    } catch {
        document.getElementById('cat-table-body').innerHTML =
            `<tr><td colspan="7" class="cat-empty">Failed to load categories.</td></tr>`;
    }
}

document.getElementById('cat-search').addEventListener('input', searchCategories);
document.getElementById('cat-status-filter').addEventListener('change', searchCategories);
