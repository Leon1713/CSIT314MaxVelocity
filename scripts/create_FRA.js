// ── Gear dropdown ─────────────────────────────────────────────────────────────
const gearBtn  = document.getElementById('hub-gear-btn');
const dropdown = document.getElementById('hub-settings-dropdown');

gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
});
document.addEventListener('click', () => dropdown.classList.add('hidden'));
dropdown.addEventListener('click', (e) => e.stopPropagation());

document.getElementById('hub-logout-btn').addEventListener('click', async () => {
    try {
        await fetch('http://127.0.0.1:8000/logout', { method: 'POST', credentials: 'include' });
    } catch (_) {}
    window.location.href = 'login.html';
});

// ── Load categories into dropdown ─────────────────────────────────────────────
async function loadCategories() {
    const select = document.getElementById('fra-category');
    try {
        const res = await fetch('http://127.0.0.1:8000/fundraiser/categories', {
            credentials: 'include'
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        const data = await res.json();
        select.innerHTML = '<option value="" disabled selected>Select category</option>';

        if (!data.categories || data.categories.length === 0) {
            select.innerHTML = '<option value="" disabled selected>No categories available</option>';
            return;
        }

        data.categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.category_name;
            select.appendChild(opt);
        });

    } catch (err) {
        select.innerHTML = '<option value="" disabled selected>Failed to load categories</option>';
    }
}

loadCategories();

// ── Form submission ────────────────────────────────────────────────────────────
const errorEl = document.getElementById('fra-error');

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
}

function clearError() {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
}

document.getElementById('fra-submit-btn').addEventListener('click', async () => {
    clearError();

    const title       = document.getElementById('fra-title').value.trim();
    const serviceType = document.getElementById('fra-service-type').value.trim();
    const description = document.getElementById('fra-description').value.trim()
    const goal        = document.getElementById('fra-goal').value.trim();
    const categoryId  = document.getElementById('fra-category').value;
    const start       = document.getElementById('fra-start').value;
    const end         = document.getElementById('fra-end').value;

    if (!title)                   return showError('Campaign title is required.');
    if (!serviceType)             return showError('Service type is required.');
    if(!description)              return showError('description is required');
    if (!goal || Number(goal) <= 0) return showError('Please enter a valid goal amount.');
    if (!categoryId)              return showError('Please select a category.');
    if (!start)                   return showError('Start date is required.');
    if (!end)                     return showError('End date is required.');
    if (end < start)              return showError('End date must be after start date.');

    const btn = document.getElementById('fra-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting…';

    try {
        const res = await fetch('http://127.0.0.1:8000/fundraiser/create_activity', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                service_type: serviceType,
                description,
                category_id: Number(categoryId),
                goal_amount: Number(goal),
                start_date: start,
                end_date: end,
            })
        });

        if (res.status === 401 || res.status === 403) {
            window.location.href = 'login.html';
            return;
        }

        const data = await res.json();

        if (!res.ok) {
            showError(data.detail || 'Failed to create activity. Please try again.');
            return;
        }

        document.getElementById('fra-toast-msg').textContent = 'Activity created successfully.';
        new bootstrap.Toast(document.getElementById('fra-success-toast'), { delay: 1800 }).show();
        setTimeout(() => { window.location.href = 'view_fundraiser_dashboard.html'; }, 1800);

    } catch (err) {
        showError('Could not connect to the server. Please try again later.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Activity';
    }
});
