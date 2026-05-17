let accounts = [];
let pendingDelete = null;
let pendingEdit = null;
let search = document.getElementById("cat-search");
search.addEventListener('keydown', (event) => {
    if (event.key !== "Enter")
        return;
    const input = search.value.trim();
    const filters = { search: input };

    loadData(filters);
})

function statusBadge(isActive) {
    return isActive
        ? '<span class="cat-badge cat-badge-active"><span class="cat-badge-dot"></span>Active</span>'
        : '<span class="cat-badge cat-badge-inactive"><span class="cat-badge-dot"></span>Inactive</span>';
}

function timeAgo(dateStr) {
    if (!dateStr) return '—';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 172800) return 'Yesterday';
    return `${Math.floor(diff / 86400)}d ago`;
}

function convertDate(date) {

    return new Date(date);
}

function formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
}

function renderTable(users) {
    const tbody = document.getElementById('cat-table-body');
    tbody.innerHTML = '';

    if (!users.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="cat-empty">No Users found.</td></tr>`;
        return;
    }

    users.forEach((u, i) => {
        const tr = document.createElement('tr');
        tr.className = 'cat-row';
        tr.innerHTML = `
            <td class="cat-col-num">${i + 1}</td>
            <td class="cat-col-name">${u.username}</td>
            <td class="cat-col-desc">${u.role_name || '—'}</td>
            <td class="cat-col-num">${timeAgo(convertDate(u.last_login))}</td>
            <td>${statusBadge(u.is_active)}</td>
            <td class="cat-col-date">${formatDate(u.created_at)}</td>
            <td>
                <div class="manage-card-actions">
                    <button class="manage-btn manage-btn-view" title="View"><i class="bi bi-eye-fill"></i></button>
                    <button class="manage-btn manage-btn-edit" title="Edit"><i class="bi bi-pencil-fill"></i></button>
                    <button class="manage-btn manage-btn-delete" title="Delete"><i class="bi bi-trash-fill"></i></button>
                </div>
            </td>
        `;

        tr.querySelector('.manage-btn-view').onclick = () => { window.location.href = `view_category.html?id=${u.id}`; };
        tr.querySelector('.manage-btn-edit').onclick = () => OpenEditModal(u);
        tr.querySelector('.manage-btn-delete').onclick = () => openDelete(u);

        tbody.appendChild(tr);
    });
}

async function loadData(filters = {}) {
    const baseURL = "http://127.0.0.1:8000/admin/user_accounts";

    const url = new URL(baseURL);

    Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== undefined || value !== null || value !== '') {
            url.searchParams.append(key, value);
        }
    })
    try {
        const usersRes = await fetch(url, {
            credentials: "include",
            method: "GET",
        })

        if (!usersRes.ok)
            throw new Error("Error getting user resources")

        accounts = await usersRes.json();

        renderTable(accounts);

        return;
    }
    catch (err) {
        console.log(err);
    }
}

async function OpenEditModal(user) {

    pendingEdit = user

    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("editUserModal"));
    const userStrip = document.getElementById("username-strip-modal");
    const modalUsername = document.getElementById("modal-uname");
    const modalEmail = document.getElementById("modal-email");
    const fname = document.getElementById("edit-first-name");
    const lname = document.getElementById("edit-last-name");
    const editUname = document.getElementById("edit-username");

    const editEmail = document.getElementById("edit-email");
    const editPhone = document.getElementById("edit-phone");

    const editRole = document.getElementById("edit-role"); // fill it with roles
    const editPassword = document.getElementById("edit-password");

    let r = await loadRoles();

    r.forEach(role => {
        let opt = document.createElement("option");
        opt.value = role.role_id;
        if (role.role_id == user.role_id)
            opt.selected = true;

        opt.innerText = role.role_name;
        editRole.append(opt);
    })

    userStrip.innerText = user.username.slice(0, 2).toUpperCase();
    modalUsername.innerText = user.username;
    modalEmail.innerText = user.email;
    fname.value = user.first_name;
    (user.last_name != null) ? lname.value = user.last_name : lname.value = "";
    editUname.value = user.username;
    editEmail.value = user.email;
    editPhone.value = user.phone;

    document.getElementById("editModalBtn").addEventListener('click', (e) => {
        modal.hide();
    })

    document.getElementById("edit-modal-close").addEventListener('click', (e) => {
        modal.hide();
    })

    

    modal.show();
}

function openDelete(user) {
    pendingDelete = user;
    const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"))
    const deletemsg = document.getElementById("delete-msg");

    deletemsg.innerText = "Delete " + user.username + "? This cannot be undone";
    deleteModal.show();
}

async function loadRoles() {
    try {

        const roleSes = await fetch("http://127.0.0.1:8000/admin/user_profiles", {
            method: 'GET',
            credentials: "include"
        })

        if (!roleSes.ok) {
            throw new Error("Failed to retrieve profiles");
        }

        const roles = await roleSes.json();
        return roles;
    }

    catch (err) {
        console.log(err);
    }
}


loadData();

// ── Gear dropdown ──────────────────────────────────────────────────────────────
const gearBtn = document.getElementById('hub-gear-btn');
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
    } catch (_) { }
    window.location.href = 'login.html';
});

document.getElementById('delete-confirm-btn').addEventListener('click', async e => {
    if (!pendingDelete)
        return;
    try {
        res = await fetch("http://127.0.0.1:8000/admin/user_accounts/" + pendingDelete.user_id + "/suspend", {

            method: "POST",
            credentials: "include"
        })
        if (!res.ok) {
            throw new Error(res.detail);
        }
        deleteModal.hide();
    }
    catch (err) {
        console.log(err);
    }
});

document.getElementById("editmodal-save-changes").addEventListener('click', async () => {
   const editModal = bootstrap.Modal.getOrCreateInstance(document.getElementById("editUserModal"));
    const fname = document.getElementById("edit-first-name");
    const lname = document.getElementById("edit-last-name");
    const editUname = document.getElementById("edit-username");

    const editEmail = document.getElementById("edit-email");
    const editPhone = document.getElementById("edit-phone");

    const editRole = document.getElementById("edit-role"); // fill it with roles
    const editPassword = document.getElementById("edit-password");

    
    const payload = {
        first_name: fname.value,
        last_name: lname.value,
        username: editUname.value,
        email: editEmail.value,
        phone: editPhone.value,
        role_id: editRole.value,
        password: editPassword.value
    }

    try{
        res = await fetch("http://127.0.0.1:8000/admin/user_accounts/" + pendingEdit.user_id, {
            method:'PATCH',
            credentials:"include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
            
        })

        if(!res.ok)
            throw new Error("Failed to update user account");

        await loadData();

        editModal.hide();
    }
    catch(err)
    {
        console.log(err);
    }
})
