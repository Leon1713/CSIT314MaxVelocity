const PERMISSION_MAP = [
    { key: "can_access_admin_dashboard", labelId: "admin-dashboard-status" },
    { key: "can_access_fr_dashboard", labelId: "fr-dashboard-status" },
    { key: "can_access_donee_dashboard", labelId: "donee-dashboard-status" },
    { key: "can_access_platform_mgt_dashboard", labelId: "platform-status" },

    { key: "can_manage_user_profile", labelId: "can_manage_user_profile" },
    { key: "can_manage_user_account", labelId: "can_manage_user_account" },
    { key: "can_manage_fr", labelId: "can_manage_fr" },
    { key: "can_view_fra", labelId: "can_view_fra" },
    { key: "can_manage_fra_favourite", labelId: "can_manage_fra_favourite" },
    { key: "can_view_fr_analytics", labelId: "can_view_fr_analytics" },
    { key: "can_manage_donation", labelId: "can_manage_donation" },
    { key: "can_manage_fra_category", labelId: "can_manage_fra_category" },
    { key: "can_generate_report", labelId: "can_generate_report" }
];

let data = null;

/* ─────────────────────────────
   LOAD DATA
───────────────────────────── */
async function loadData() {
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get("id");

    if (!profileId) {
        console.error("Missing profile id in URL");
        return;
    }

    try {
        const res = await fetch(`http://127.0.0.1:8000/admin/user_profiles/${profileId}`, {
            method: "GET",
            credentials: "include"
        });

        if (!res.ok) {
            throw new Error("Failed to fetch role data");
        }

        data = await res.json();
        renderRole(data);
        fillEditModal(data);

    } catch (err) {
        console.error(err);
    }
}

/* ─────────────────────────────
   RENDER ROLE VIEW
───────────────────────────── */
function renderRole(role) {
    setText("role-name", role.role_name);
    setText("role-name-detail", role.role_name);
    setText("role-id", `#${role.role_id}`);
    setText("role-desc", role.role_desc);

    setStatus(role.is_active);

    updatePermissions(role);
}

/* ─────────────────────────────
   STATUS BADGE
───────────────────────────── */
function setStatus(isActive) {
    const text = isActive ? "Active" : "Inactive";

    const badge = document.getElementById("role-status");
    const textEl = document.getElementById("role-status-text");

    badge.className = `status-pill ${isActive ? "status-pill--active" : "status-pill--inactive"}`;

    if (textEl) textEl.textContent = text;

    badge.innerHTML = `<span class="status-pill__dot"></span> ${text}`;
}

/* ─────────────────────────────
   PERMISSIONS RENDER
───────────────────────────── */
function updatePermissions(role) {
    PERMISSION_MAP.forEach(({ key, labelId }) => {
        const el = document.getElementById(labelId);
        if (!el) return;

        const value = !!role[key];
        const parent = el.closest(".vp-perm-item");
        const statusEl = parent?.querySelector(".vp-perm-status");

        parent.classList.toggle("granted", value);
        parent.classList.toggle("denied", !value);

        if (statusEl) {
            statusEl.textContent = value ? "On" : "Off";
            statusEl.className = `vp-perm-status ${value ? "ok" : "no"}`;
        }
    });
}

/* ─────────────────────────────
   EDIT MODAL FILL
───────────────────────────── */
function fillEditModal(role) {
    setValue("edit-name", role.role_name);
    setValue("edit-desc", role.role_desc);
    setValue("edit-status", role.is_active ? "1" : "0");

    document
        .querySelectorAll("#editModal input[type='checkbox']")
        .forEach(cb => {
            const key = cb.dataset.key;
            if (key) cb.checked = !!role[key];
        });
}

/* ─────────────────────────────
   BUILD PAYLOAD
───────────────────────────── */
function getUpdatedRolePayload() {
    const payload = {};

    document
        .querySelectorAll("#editModal input[type='checkbox']")
        .forEach(cb => {
            const key = cb.dataset.key;
            if (key) payload[key] = cb.checked;
        });

    payload.role_name = getValue("edit-name");
    payload.description = getValue("edit-desc");
    payload.is_active = getValue("edit-status") === "1";

    return payload;
}

/* ─────────────────────────────
   HELPERS
───────────────────────────── */
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? "";
}

function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
}

function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value : "";
}

/*================================

      UPDATE ROUTE

=================================*/

async function updateRole(payload) {
    try {
        const res = await fetch(`http://127.0.0.1:8000/admin/user_profiles/${data.role_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Update failed");

        const updated = await res.json();
        
            const modalEl = document.getElementById("editModal");
            const modal = bootstrap.Modal.getInstance(modalEl);

        if (updated) {
            Object.assign(data, payload);
            renderRole(data);
            fillEditModal(data);
            showToast("Role updated successfully");
            modal.hide();
        }
    }
    catch (err) {
        showToast(err);
        console.error(err);
    }
}

document.getElementById("edit-save-btn").addEventListener('click', () => {
    payload = getUpdatedRolePayload();
    updateRole(payload);
})
/* ===========================

         TOAST
=============================*/

function showToast(message = "Success") {
    const toastEl = document.getElementById("cat-success-toast");
    const msgEl = document.getElementById("cat-toast-msg");

    msgEl.textContent = message;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}
/* ─────────────────────────────
   INIT
───────────────────────────── */
async function init() {
    await loadData();
}

init();



