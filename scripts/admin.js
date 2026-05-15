
async function loadDashboardData() {
  try {
    const [rowData, listData, selfRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/admin/dashboard_overview", {
        method: 'GET',
        credentials: 'include'
      }),
      fetch("http://127.0.0.1:8000/admin/dashboard_stats", {
        method: 'GET',
        credentials: 'include'
      }),
      fetch("http://127.0.0.1:8000/admin/dashboard", {
        method: 'GET',
        credentials: 'include'
      })
    ]);
    if (!rowData.ok || !listData.ok ||  !selfRes.ok) {
      throw Error("Failed to retrieve admin dashboard data");
    }
    const [overview, usersData, self] = await Promise.all([rowData.json(), listData.json(), selfRes.json()]);


    //Get user name
    let Name = document.getElementById("admin-username");
    Name.innerText = self.username;

    // try populate Overview
    let numUsers = document.getElementById("stat-total-users");
    let totalActive = document.getElementById("stat-total-active");
    let totalSuspended = document.getElementById("stat-total-suspended");
    let roles_amt = document.getElementById("stat-total-roles");

    numUsers.innerText = overview.total_accounts;
    totalActive.innerText = overview.active_accounts;
    totalSuspended.innerText = overview.suspended_accounts;
    roles_amt.innerText = overview.total_roles;

    //populate name
    // try populate list
    renderAdminList(usersData);

  }
  catch(err)
  {
    console.log(err);
  }
}

function renderAdminList(users) {
  let userList = document.getElementById("platform-activity-list");
  let res = "";
  users.forEach(user => {
    let item = `<div class="platform-activity-item platform-activity-item--clickable" style="justify-content: space-between; align-items: center;">
                  <div class="admin-details-ctn">
                      <div class="platform-activity-icon" style="background:#f5e6e6;">
                       <span class="account-username-text">${user.username.slice(0, 2).toUpperCase()}</span>
                       </div>
              <div class="user-event-ctn">
                <span class="admin-event" style="color: ${activityMeta(user).color}">${activityMeta(user).label}</span>
                <div class="admin-account-meta">${user.role_name} · ${(user.is_active) ? "Active" : "Suspended"}</div>
              </div>
            </div>
            <span class="admin-event-timestamp" id="admin-time-stamp">${timeAgo(activityMeta(user).time)}</span>
          </div>`
          res += item;
  });
  userList.innerHTML = res;
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff} secs ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800) return 'Yesterday';
  return `${Math.floor(diff / 86400)} days ago`;
}

function activityMeta(user) {
  const time = user.event_time ? new Date(user.event_time) : null;

  if (!user.is_active) {
    return { label: `user ${user.username} suspended`, color: '#ef4444', time: time };
  }
  if (user.event_type === "updated_at") {
    return { label: `user ${user.username} updated`, color: '#3b82f6', time: time };
  }
  return { label: `user ${user.username} Logged in`, color: '#22c55e', time: time };

}

loadDashboardData();