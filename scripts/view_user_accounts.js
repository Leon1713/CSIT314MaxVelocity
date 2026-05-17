let userData = null;
let editData = null;



async function loadData() {
    let userParams = new URLSearchParams(window.location.search);
    let params = userParams.get('id');
    const userResource = await fetch(`http://127.0.0.1:8000/user_accounts/${params}`);
    if (!userResource.ok) {
        throw new Error("fail to load user");
    }
    userData = await userResource.json();
    await loadEditModal();
    //set up buttons interaction
    setUpButtons();
    //set up modal interaction 
    setUpEditModalInteractions();
    setUpSuspendInteraction();

    renderView(userData);


    // set loading
    // action baseURL
}

function setUpEditModalInteractions() {

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

        try {
            res = await fetch("http://127.0.0.1:8000/admin/user_accounts/" + userData.user_id, {
                method: 'PATCH',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)

            })

            if (!res.ok)
                throw new Error("Failed to update user account");

            await loadData();

            editModal.hide();
        }
        catch (err) {
            console.log(err);
        }
    })
}

function setUpSuspendInteraction() {
    
    document.getElementById('delete-modal-cancel').addEventListener('click', ()=>
    {
        const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
        deleteModal.hide;

    })
    document.getElementById('delete-confirm-btn').addEventListener('click', async e => {
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
}
function renderView(user) {
    // header
    const headerUsername = document.getElementById("header-username");
    const headerRole = document.getElementById("header-role");
    const headerStatus = document.getElementById("header-status");

    //details
    const detailsID = document.getElementById("details-id");
    const detailsRole = document.getElementById("details-role");
    const detailsStatus = document.getElementById("details-status");
    const detailsCreatedAt = document.getElementById("details-created_at");
    const detailsLastLogin = document.getElementById("details-last_login");
    const detailsEmail = document.getElementById("details-email");

    // recent_activities
    const time = {
        last_login: (user.last_login == null) ? null : new Date(user.last_login),
        created_at: (user.created_at == null) ? null : new Date(user.created_at),
        updated_at: (user.updated_at == null) ? null : new Date(user.updated_at)
    }

    const sortedTimes = timeEntries.sort((a, b) => {
        const dateA = a[1];
        const dateB = b[1];

        if (dateA === null && dateB === null) return 0;
        if (dateA === null) return 1;
        if (dateB === null) return -1;
        return dateA - dateB;
    });

    const sortedTimeObj = Object.fromEntries(sortedTimes);
    console.log(sortedTimeObj);

    const keysSorted = timeEntries
        .filter(([key, date]) => date !== null)
        .sort((a, b) => a[1] - b[1])

    const timeEntries = Object.entries(time);

    const parent = document.getElementById("details-recent-activity");
    keysSorted.forEach(key => {
        let activity = document.createElement("div");
        activity.classList.add("activity-list__item");
        activity.innerHTML = `<div class="activity-list__icon">
        ${(key == "last_login") ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </svg>` : (key == 'updated_at') ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
  <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
</svg>` : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
              <polyline points="16 11 18 13 22 9"></polyline>
            </svg>`}
          </div>
          <div class="activity-list__text">
            <p>${(key == "last_login") ? "Logged in" : (key == "updated_at") ? "Updated at" : "Created at"}</p>
            <span>${formatDate(keysSorted[key])}</span>
          </div>
          <span class="activity-list__timestamp">${timeAgo(keysSorted[key])}</span>`
    }
    )
}

function openDelete(user) {
    const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"))
    const deletemsg = document.getElementById("delete-msg");

    deletemsg.innerText = "Delete " + user.username + "? This cannot be undone";
    deleteModal.show();
}

function openDelete() {
    const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"))
    const deletemsg = document.getElementById("delete-msg");

    deletemsg.innerText = "Delete " + userData.username + "? This cannot be undone";
    deleteModal.show();
}

async function loadEditModal(user) {
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

}
async function OpenEditModal() {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("editUserModal"));
    modal.show();
}


function setUpButtons() {
    // edit
    const editAccountBtn = document.getElementById("edit-acc-btn");
    const editModal = document.getElementById('editUserModal');
    editAccountBtn.addEventListener('click', (e) => {
        // open moda
        OpenEditModal();
    })
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

function formatDate(date) {
    if (!date) return null; // handle null

    const day = String(date.getDate()).padStart(2, "0"); // 09
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];           // May
    const year = date.getFullYear();                     // 2026

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0"); // 00
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;  // convert 0 => 12

    return `${day} ${month} ${year} at ${hours}:${minutes} ${ampm}`;
}
