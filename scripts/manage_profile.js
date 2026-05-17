const BASE_URL = 'http://127.0.0.1:8000';

        let allProfiles   = [];
        let editingId     = null;   // null = create, number = update
        let pendingSuspendId = null;

        const DASHBOARD_KEYS = [
            { key: 'can_access_admin_dashboard',        label: 'Admin Dashboard',        icon: 'bi-shield-lock-fill' },
            { key: 'can_access_fr_dashboard',           label: 'Fundraiser Dashboard',   icon: 'bi-graph-up-arrow' },
            { key: 'can_access_donee_dashboard',        label: 'Donee Dashboard',        icon: 'bi-heart-fill' },
            { key: 'can_access_platform_mgt_dashboard', label: 'Platform Management',    icon: 'bi-bar-chart-fill' },
        ];

        const PERM_KEYS = [
            { key: 'can_manage_user_account',   label: 'Manage User Accounts',   icon: 'bi-person-check-fill' },
            { key: 'can_manage_user_profile',   label: 'Manage User Profiles',   icon: 'bi-person-badge-fill' },
            { key: 'can_manage_fr',             label: 'Manage Fundraisers',     icon: 'bi-megaphone-fill' },
            { key: 'can_view_fra',              label: 'View FRA',               icon: 'bi-eye-fill' },
            { key: 'can_manage_fra_favourite',  label: 'FRA Favourites',         icon: 'bi-star-fill' },
            { key: 'can_view_fr_analytics',     label: 'FR Analytics',           icon: 'bi-bar-chart-line-fill' },
            { key: 'can_manage_donation',       label: 'Manage Donations',       icon: 'bi-currency-dollar' },
            { key: 'can_manage_fra_category',   label: 'FRA Categories',         icon: 'bi-tag-fill' },
            { key: 'can_generate_report',       label: 'Generate Reports',       icon: 'bi-file-earmark-bar-graph-fill' },
        ];

        const ALL_KEYS = [...DASHBOARD_KEYS, ...PERM_KEYS];

        // ── Modals ──
        const editModal    = bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal'));
        const suspendModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('suspendModal'));

        // ── Toast ──
        function showToast(msg) {
            document.getElementById('cat-toast-msg').textContent = msg;
            bootstrap.Toast.getOrCreateInstance(document.getElementById('cat-success-toast')).show();
        }

        // ── Status badge HTML ──
        function statusBadge(isActive) {
            return isActive
                ? '<span class="cat-badge cat-badge-active"><span class="cat-badge-dot"></span>Active</span>'
                : '<span class="cat-badge cat-badge-inactive"><span class="cat-badge-dot"></span>Inactive</span>';
        }

        // ── Count active permissions ──
        function countPerms(p) {
            return ALL_KEYS.filter(({ key }) => !!p[key]).length;
        }

        // ── Render table ──
        function renderTable(profiles) {
            const tbody = document.getElementById('cat-table-body');
            tbody.innerHTML = '';

            if (!profiles.length) {
                tbody.innerHTML = `<tr><td colspan="6" class="cat-empty">No profiles found.</td></tr>`;
                return;
            }

            profiles.forEach((p, i) => {
                const count = countPerms(p);
                const tr = document.createElement('tr');
                tr.className = 'cat-row';
                tr.innerHTML = `
                    <td class="cat-col-num">${i + 1}</td>
                    <td>
                        <div class="role-name-cell">
                            <div class="role-table-avatar">
                                <i class="bi bi-person-badge-fill"></i>
                            </div>
                            <span class="cat-col-name">${p.role_name}</span>
                        </div>
                    </td>
                    <td class="cat-col-desc">${p.role_desc || '—'}</td>
                    <td>
                        <span class="perm-count-badge">
                            <i class="bi bi-key-fill"></i> ${count} / ${ALL_KEYS.length}
                        </span>
                    </td>
                    <td>${statusBadge(p.is_active)}</td>
                    <td>
                        <div class="manage-card-actions">
                            <button class="manage-btn manage-btn-view"   title="View"><i class="bi bi-eye-fill"></i></button>
                            <button class="manage-btn manage-btn-edit"   title="Edit"><i class="bi bi-pencil-fill"></i></button>
                            <button class="manage-btn manage-btn-delete" title="Suspend"><i class="bi bi-slash-circle-fill"></i></button>
                        </div>
                    </td>
                `;

                tr.querySelector('.manage-btn-view').onclick   = () => openView(p);
                tr.querySelector('.manage-btn-edit').onclick   = () => openEdit(p);
                tr.querySelector('.manage-btn-delete').onclick = () => openSuspend(p);

                tbody.appendChild(tr);
            });
        }

        // ── Filter ──
        function applyFilters() {
            const q      = document.getElementById('cat-search').value.trim().toLowerCase();
            const status = document.getElementById('cat-status-filter').value;
            const result = allProfiles.filter(p => {
                const matchName   = !q || p.role_name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
                const matchStatus = status === '' || String(p.is_active ? '1' : '0') === status;
                return matchName && matchStatus;
            });
            renderTable(result);
        }

        document.getElementById('cat-search').addEventListener('input', applyFilters);
        document.getElementById('cat-status-filter').addEventListener('change', applyFilters);

        // ── Load ──
        async function loadProfiles() {
            try {
                const res = await fetch(`${BASE_URL}/admin/user_profiles`, { credentials: 'include' });
                if (res.status === 401 || res.status === 403) { window.location.href = 'login.html'; return; }
                if (!res.ok) throw new Error();
                allProfiles = await res.json();
                renderTable(allProfiles);
            } catch {
                document.getElementById('cat-table-body').innerHTML =
                    `<tr><td colspan="6" class="cat-empty">Failed to load profiles.</td></tr>`;
            }
        }

        loadProfiles();

        // ── View Modal ──
        let viewingProfile = null;

        

       

        // ── Edit toggle row active sync ──
        function syncModalRow(checkbox) {
            const key = checkbox.dataset.key;
            const rowMap = {
                'can_access_admin_dashboard':        'edit-row-admin',
                'can_access_fr_dashboard':           'edit-row-fr',
                'can_access_donee_dashboard':        'edit-row-donee',
                'can_access_platform_mgt_dashboard': 'edit-row-platform',
                'can_manage_user_account':           'edit-row-acc',
                'can_manage_user_profile':           'edit-row-prof',
                'can_manage_fr':                     'edit-row-fr2',
                'can_view_fra':                      'edit-row-vfra',
                'can_manage_fra_favourite':          'edit-row-fav',
                'can_view_fr_analytics':             'edit-row-ana',
                'can_manage_donation':               'edit-row-don',
                'can_manage_fra_category':           'edit-row-cat',
                'can_generate_report':               'edit-row-rep',
            };
            if (rowMap[key]) document.getElementById(rowMap[key])?.classList.toggle('active', checkbox.checked);
        }

        document.querySelectorAll('#editModal input[data-key]').forEach(cb => {
            cb.addEventListener('change', () => syncModalRow(cb));
        });

        // ── Open Edit ──
        function openEdit(p = null) {
            editingId = p ? p.role_id : null;
            document.getElementById('edit-modal-title').textContent = p ? 'Edit Profile' : 'New Profile';
            document.getElementById('edit-error').classList.add('hidden');

            document.getElementById('edit-name').value   = p ? (p.role_name    || '') : '';
            document.getElementById('edit-desc').value   = p ? (p.description  || '') : '';
            document.getElementById('edit-status').value = p ? (p.is_active ? '1' : '0') : '1';

            // Set all toggles
            document.querySelectorAll('#editModal input[data-key]').forEach(cb => {
                cb.checked = p ? !!p[cb.dataset.key] : false;
                syncModalRow(cb);
            });

            editModal.show();
        }

        document.getElementById('cat-new-btn').addEventListener('click', () => openEdit(null));

        // ── Save (Create or Update) ──
        document.getElementById('edit-save-btn').addEventListener('click', async () => {
            const name = document.getElementById('edit-name').value.trim();
            const errEl = document.getElementById('edit-error');

            if (!name) {
                errEl.textContent = 'Role Name is required.';
                errEl.classList.remove('hidden');
                return;
            }
            errEl.classList.add('hidden');

            const payload = {
                role_name:   name,
                description: document.getElementById('edit-desc').value.trim(),
                is_active:   document.getElementById('edit-status').value === '1',
            };

            document.querySelectorAll('#editModal input[data-key]').forEach(cb => {
                payload[cb.dataset.key] = cb.checked;
            });

            const btn = document.getElementById('edit-save-btn');
            btn.disabled = true;
            btn.textContent = 'Saving…';

            try {
                let res;
                if (editingId) {
                    res = await fetch(`${BASE_URL}/admin/user_profiles/${editingId}`, {
                        method: 'PATCH',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                } else {
                    res = await fetch(`${BASE_URL}/admin/create_profile`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    });
                }

                if (!res.ok) {
                    const data = await res.json();
                    errEl.textContent = data.detail || 'Failed to save profile.';
                    errEl.classList.remove('hidden');
                    return;
                }

                editModal.hide();
                showToast(editingId ? 'Profile updated.' : 'Profile created.');
                await loadProfiles();

            } catch (_) {
                errEl.textContent = 'Could not connect to the server.';
                errEl.classList.remove('hidden');
            } finally {
                btn.disabled = false;
                btn.textContent = 'Save';
            }
        });

        // ── Suspend ──
        function openSuspend(p) {
            pendingSuspendId = p.role_id;
            document.getElementById('suspend-msg').textContent =
                `Are you sure you want to suspend "${p.role_name}"? Users with this role will lose access.`;
            suspendModal.show();
        }

        document.getElementById('suspend-confirm-btn').addEventListener('click', async () => {
            suspendModal.hide();
            try {
                const res = await fetch(`${BASE_URL}/admin/user_profiles/${pendingSuspendId}/suspend`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (!res.ok) throw new Error();
                showToast('Profile suspended.');
                await loadProfiles();
            } catch {
                showToast('Failed to suspend profile.');
            }
        });