const PERMS = [
  'Create FRA', 'Delete FRA', 'View FRA', 'Edit FRA',
  'View Reports', 'Manage Categories', 'Manage Accounts',
  'View Analytics', 'Approve FRA', 'Export Data'
];

const ROLE_CLS = {
  'User Admin':          'b-ua',
  'Fund Raiser':         'b-fr',
  'Donee':               'b-do',
  'Platform Management': 'b-pm'
};

let profiles = [
  {
    id: 'p1', name: 'User Admin',
    desc: 'Full system access including all user management functions.',
    perms: ['Create FRA','Delete FRA','View FRA','Edit FRA','View Reports','Manage Categories','Manage Accounts','View Analytics','Approve FRA','Export Data'],
    status: 'Active'
  },
  {
    id: 'p2', name: 'Fund Raiser',
    desc: 'Manage fundraising activities, track views and shortlists.',
    perms: ['Create FRA','View FRA','Edit FRA','View Reports'],
    status: 'Active'
  },
  {
    id: 'p3', name: 'Donee',
    desc: 'Browse, search and save Fund Raising Activities to a favourite list.',
    perms: ['View FRA'],
    status: 'Active'
  },
  {
    id: 'p4', name: 'Platform Management',
    desc: 'Manage FRA categories and generate platform reports.',
    perms: ['Manage Categories','View Reports','View Analytics','Export Data','Approve FRA'],
    status: 'Active'
  }
];

let accounts = [
  { id: 'a1', name: 'Sarah Chen',    email: 's.chen@email.com',    role: 'User Admin',          status: 'Active',    created: '2025-01-12' },
  { id: 'a2', name: 'Marcus Liu',    email: 'm.liu@email.com',     role: 'Fund Raiser',         status: 'Active',    created: '2025-02-05' },
  { id: 'a3', name: 'Priya Sharma',  email: 'p.sharma@email.com',  role: 'Donee',               status: 'Active',    created: '2025-02-18' },
  { id: 'a4', name: 'James Tan',     email: 'j.tan@email.com',     role: 'Fund Raiser',         status: 'Suspended', created: '2025-03-01' },
  { id: 'a5', name: 'Linda Park',    email: 'l.park@email.com',    role: 'Platform Management', status: 'Active',    created: '2025-03-14' },
  { id: 'a6', name: 'Ahmad Zainal',  email: 'a.zainal@email.com',  role: 'Donee',               status: 'Active',    created: '2025-04-02' },
  { id: 'a7', name: 'Emily Ng',      email: 'e.ng@email.com',      role: 'Fund Raiser',         status: 'Active',    created: '2025-04-20' },
  { id: 'a8', name: 'David Koh',     email: 'd.koh@email.com',     role: 'Donee',               status: 'Suspended', created: '2025-05-03' }
];

let activity = [
  { text: 'Account created for Sarah Chen',               time: '2 mins ago'  },
  { text: 'Profile "Fund Raiser" permissions updated',    time: '15 mins ago' },
  { text: 'Account suspended: David Koh',                 time: '1 hour ago'  },
  { text: 'New profile "Donee" created',                  time: '3 hours ago' },
  { text: 'Account created for Emily Ng',                 time: 'Yesterday'   }
];

let pendingCb = null;
let idx = 200;
function uid() { return 'x' + (++idx); }

/* ── NAVIGATION ── */

 document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => nav(el.dataset.page));
  });
 
  /* ── MODAL BACKDROP CLICK ── */
  document.querySelectorAll('.overlay').forEach(o => {
    o.addEventListener('click', function (e) {
      if (e.target === this) this.classList.remove('open');
    });
  });
 
  /* ── ESCAPE KEY CLOSES MODALS ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
    }
  });
 
  /* ── INIT ── */
  refresh();
 
 // end DOMContentLoaded
 
function nav(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
 
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === name);
  });
 
  const titles = {
    dashboard: 'Admin Dashboard',
    profiles:  'User Profiles',
    accounts:  'User Accounts'
  };
  document.getElementById('topbar-title').textContent = titles[name] || name;
}
 
/* ── GLOBAL REFRESH ── */

function refresh() {
  // Stats
  document.getElementById('s-accounts').textContent  = accounts.length;
  document.getElementById('s-profiles').textContent  = profiles.length;
  document.getElementById('s-active').textContent    = accounts.filter(a => a.status === 'Active').length;
  document.getElementById('s-suspended').textContent = accounts.filter(a => a.status === 'Suspended').length;

  // Activity feed
  document.getElementById('act-feed').innerHTML = activity.slice(0, 5).map(a => `
    <div class="act-item">
      <div class="act-dot"></div>
      <div>
        <div class="act-text">${a.text}</div>
        <div class="act-time">${a.time}</div>
      </div>
    </div>`).join('');

  renderProfiles();
  renderAccounts();
}

function addActivity(text) {
  activity.unshift({ text, time: 'Just now' });
  refresh();
}


/* ── HELPER FUNCTIONS ── */

function sbadge(s) {
  return `<span class="badge ${s === 'Active' ? 'b-active' : 'b-suspended'}">${s}</span>`;
}

function rbadge(r) {
  return `<span class="badge ${ROLE_CLS[r] || ''}">${r}</span>`;
}

function pbadges(perms) {
  const visible = perms.slice(0, 3).map(p =>
    `<span style="display:inline-block;background:var(--surface-3);color:var(--text-2);border-radius:4px;padding:2px 7px;font-size:11px;margin:2px 2px 2px 0">${p}</span>`
  ).join('');
  const extra = perms.length > 3
    ? `<span style="font-size:11px;color:var(--text-3)"> +${perms.length - 3}</span>`
    : '';
  return visible + extra;
}

function ini(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

function today() {
  return new Date().toISOString().split('T')[0];
}


/* ── USER PROFILES ── */

function renderProfiles() {
  const q    = document.getElementById('psearch').value.toLowerCase();
  const list = profiles.filter(p =>
    p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  );
  const tbody = document.getElementById('ptbody');

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
        <p>No profiles found</p><span>Try a different search</span>
      </div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td style="max-width:200px;color:var(--text-2);font-size:13px">${p.desc}</td>
      <td>${pbadges(p.perms)}</td>
      <td>${sbadge(p.status)}</td>
      <td class="tda">
        <button class="btn btn-o btn-sm" onclick="viewProfile('${p.id}')">View</button>
        <button class="btn btn-o btn-sm" onclick="editProfile('${p.id}')">Edit</button>
        ${p.status === 'Active'
          ? `<button class="btn btn-d btn-sm" onclick="confirmSuspProf('${p.id}')">Suspend</button>`
          : `<button class="btn btn-g btn-sm" onclick="reactProf('${p.id}')">Reactivate</button>`}
      </td>
    </tr>`).join('');
}

function openCreateProfile() {
  document.getElementById('mp-title').textContent = 'Create User Profile';
  document.getElementById('mp-btn').textContent   = 'Create Profile';
  document.getElementById('p-id').value   = '';
  document.getElementById('p-name').value = '';
  document.getElementById('p-desc').value = '';
  buildPerms([]);
  openModal('m-profile');
}

function editProfile(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return;
  document.getElementById('mp-title').textContent = 'Edit User Profile';
  document.getElementById('mp-btn').textContent   = 'Save Changes';
  document.getElementById('p-id').value   = id;
  document.getElementById('p-name').value = p.name;
  document.getElementById('p-desc').value = p.desc;
  buildPerms(p.perms);
  openModal('m-profile');
}

function buildPerms(selected) {
  document.getElementById('perm-grid').innerHTML = PERMS.map(p => `
    <label class="perm-item ${selected.includes(p) ? 'ck' : ''}">
      <input type="checkbox" value="${p}" ${selected.includes(p) ? 'checked' : ''}
        onchange="this.closest('.perm-item').classList.toggle('ck', this.checked)">
      ${p}
    </label>`).join('');
}

function getPerms() {
  return [...document.querySelectorAll('#perm-grid input:checked')].map(i => i.value);
}

function saveProfile() {
  const id    = document.getElementById('p-id').value;
  const name  = document.getElementById('p-name').value.trim();
  const desc  = document.getElementById('p-desc').value.trim();
  const perms = getPerms();

  if (!name)          { toast('Profile name is required', 'd'); return; }
  if (!perms.length)  { toast('Select at least one permission', 'd'); return; }

  if (id) {
    const p = profiles.find(x => x.id === id);
    p.name = name; p.desc = desc; p.perms = perms;
    addActivity(`Profile "${name}" updated`);
    toast('Profile updated');
  } else {
    profiles.push({ id: uid(), name, desc, perms, status: 'Active' });
    addActivity(`Profile "${name}" created`);
    toast('Profile created');
  }
  closeModal('m-profile');
  renderProfiles();
}

function viewProfile(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return;

  document.getElementById('m-vp-body').innerHTML = `
    <div style="background:var(--primary-bg);padding:20px;border-radius:var(--radius);margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div class="avatar" style="width:48px;height:48px;font-size:16px">${p.name.slice(0, 2).toUpperCase()}</div>
      <div>
        <div style="font-size:16px;font-weight:600">${p.name}</div>
        <div style="margin-top:4px">${sbadge(p.status)}</div>
      </div>
    </div>
    <div class="drow"><span class="dk">Description</span><span class="dv">${p.desc || '—'}</span></div>
    <hr class="divider">
    <div style="font-size:11px;font-weight:600;color:var(--text-3);text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px">
      Permissions (${p.perms.length})
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${p.perms.map(pm =>
        `<span style="background:var(--primary-bg);color:var(--primary-hover);border:1px solid var(--primary-muted);padding:4px 10px;border-radius:20px;font-size:12px">${pm}</span>`
      ).join('')}
    </div>`;

  openModal('m-view-profile');
}

function confirmSuspProf(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return;
  setupConfirm(
    `Suspend "${p.name}"?`,
    `This profile will be inactive. Existing users keep their current access.`,
    'Suspend Profile',
    () => {
      p.status = 'Suspended';
      addActivity(`Profile "${p.name}" suspended`);
      toast('Profile suspended', 'd');
      renderProfiles();
    }
  );
}

function reactProf(id) {
  const p = profiles.find(x => x.id === id);
  if (!p) return;
  p.status = 'Active';
  addActivity(`Profile "${p.name}" reactivated`);
  toast('Profile reactivated');
  renderProfiles();
}


/* ── USER ACCOUNTS ── */

function renderAccounts() {
  const q    = document.getElementById('asearch').value.toLowerCase();
  const rf   = document.getElementById('afr').value;
  const sf   = document.getElementById('afs').value;
  const list = accounts.filter(a =>
    (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q)) &&
    (!rf || a.role === rf) &&
    (!sf || a.status === sf)
  );
  const tbody = document.getElementById('atbody');

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="6">
      <div class="empty">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
        </svg>
        <p>No accounts found</p><span>Try adjusting your filters</span>
      </div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(a => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar" style="font-size:11px">${ini(a.name)}</div>
          <span style="font-weight:500">${a.name}</span>
        </div>
      </td>
      <td style="color:var(--text-2)">${a.email}</td>
      <td>${rbadge(a.role)}</td>
      <td>${sbadge(a.status)}</td>
      <td style="color:var(--text-3);font-size:12.5px">${a.created}</td>
      <td class="tda">
        <button class="btn btn-o btn-sm" onclick="viewAccount('${a.id}')">View</button>
        <button class="btn btn-o btn-sm" onclick="editAccount('${a.id}')">Edit</button>
        ${a.status === 'Active'
          ? `<button class="btn btn-d btn-sm" onclick="confirmSuspAcc('${a.id}')">Suspend</button>`
          : `<button class="btn btn-g btn-sm" onclick="reactAcc('${a.id}')">Reactivate</button>`}
      </td>
    </tr>`).join('');
}

function openCreateAccount() {
  document.getElementById('ma-title').textContent = 'Create Account';
  document.getElementById('ma-btn').textContent   = 'Create Account';
  document.getElementById('a-id').value = '';
  ['a-name', 'a-email', 'a-pw1', 'a-pw2'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('a-role').value = '';
  document.getElementById('a-pw1-g').style.display = 'block';
  document.getElementById('a-pw2-g').style.display = 'block';
  openModal('m-account');
}

function editAccount(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  document.getElementById('ma-title').textContent = 'Edit Account';
  document.getElementById('ma-btn').textContent   = 'Save Changes';
  document.getElementById('a-id').value    = id;
  document.getElementById('a-name').value  = a.name;
  document.getElementById('a-email').value = a.email;
  document.getElementById('a-role').value  = a.role;
  document.getElementById('a-pw1-g').style.display = 'none';
  document.getElementById('a-pw2-g').style.display = 'none';
  openModal('m-account');
}

function saveAccount() {
  const id    = document.getElementById('a-id').value;
  const name  = document.getElementById('a-name').value.trim();
  const email = document.getElementById('a-email').value.trim();
  const role  = document.getElementById('a-role').value;

  if (!name)                    { toast('Full name is required', 'd'); return; }
  if (!email || !email.includes('@')) { toast('Valid email is required', 'd'); return; }
  if (!role)                    { toast('Please assign a role', 'd'); return; }

  if (!id) {
    const pw  = document.getElementById('a-pw1').value;
    const pw2 = document.getElementById('a-pw2').value;
    if (pw.length < 6)                    { toast('Password must be at least 6 characters', 'd'); return; }
    if (pw !== pw2)                       { toast('Passwords do not match', 'd'); return; }
    if (accounts.find(a => a.email === email)) { toast('Email already in use', 'd'); return; }

    accounts.push({ id: uid(), name, email, role, status: 'Active', created: today() });
    addActivity(`Account created for ${name}`);
    toast('Account created');
  } else {
    const a = accounts.find(x => x.id === id);
    a.name = name; a.email = email; a.role = role;
    addActivity(`Account updated: ${name}`);
    toast('Account updated');
  }
  closeModal('m-account');
  renderAccounts();
}

function viewAccount(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;

  document.getElementById('m-va-body').innerHTML = `
    <div style="background:var(--primary-bg);padding:20px;border-radius:var(--radius);margin-bottom:16px;display:flex;align-items:center;gap:14px">
      <div class="avatar" style="width:52px;height:52px;font-size:17px">${ini(a.name)}</div>
      <div>
        <div style="font-size:16px;font-weight:600">${a.name}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">${rbadge(a.role)} ${sbadge(a.status)}</div>
      </div>
    </div>
    <div class="drow"><span class="dk">Email</span><span class="dv">${a.email}</span></div>
    <div class="drow"><span class="dk">Role</span><span class="dv">${a.role}</span></div>
    <div class="drow"><span class="dk">Status</span><span class="dv">${a.status}</span></div>
    <div class="drow"><span class="dk">Account Created</span><span class="dv">${a.created}</span></div>
    <div class="drow"><span class="dk">Account ID</span>
      <span class="dv" style="font-family:monospace;font-size:12px;color:var(--text-3)">${a.id}</span>
    </div>`;

  openModal('m-view-account');
}

function confirmSuspAcc(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  setupConfirm(
    `Suspend ${a.name}'s account?`,
    `They will lose access to the platform immediately. You can reactivate this account at any time.`,
    'Suspend Account',
    () => {
      a.status = 'Suspended';
      addActivity(`Account suspended: ${a.name}`);
      toast('Account suspended', 'd');
      renderAccounts();
    }
  );
}

function reactAcc(id) {
  const a = accounts.find(x => x.id === id);
  if (!a) return;
  a.status = 'Active';
  addActivity(`Account reactivated: ${a.name}`);
  toast('Account reactivated');
  renderAccounts();
}


/* ── CONFIRM DIALOG ── */

function setupConfirm(title, msg, btnLabel, cb) {
  document.getElementById('c-title').textContent = title;
  document.getElementById('c-msg').textContent   = msg;
  document.getElementById('c-ok').textContent    = btnLabel;
  pendingCb = cb;
  openModal('m-confirm');
}

function doConfirm() {
  if (pendingCb) { pendingCb(); pendingCb = null; }
  closeModal('m-confirm');
}


/* ── MODAL HELPERS ── */

function openModal(id)  { document.getElementById(id).classList.add('open');    }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close on backdrop click
document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
});

// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.overlay.open').forEach(o => o.classList.remove('open'));
  }
});


/* ── TOAST NOTIFICATIONS ── */

let toastTimer;

function toast(msg, type = 's') {
  const el   = document.getElementById('toast');
  const icon = document.getElementById('t-icon');

  document.getElementById('t-msg').textContent = msg;
  el.className = type === 'd' ? 'td-t' : 'ts';

  icon.innerHTML = type === 'd'
    ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
    : '<polyline points="20 6 9 17 4 12"/>';

  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}


/* ── INIT ── */
refresh();
