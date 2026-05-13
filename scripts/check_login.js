async function loadCategories() {
  try {
    const catRes = await fetch("https://fastapi-app-production-9d4a.up.railway.app/login-roles/login", { method: 'GET', credentials: 'include' }).then(res => {
      if (!res.ok) {
        const errText = catRes.detail;
        throw new Error(errText);
      }
      return res.json();
    }).then(categories => {
      populateCategories(categories);
    })
  }
  catch (err) {
    console.log(err);
    populateCategories([]);
  }
}
function populateCategories(categories) {
  cat_dropdown = document.getElementById("loginRole");
  if (categories.length > 0) {
    cat_dropdown.innerHTML = '<option value="" disabled>Select category</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.role_id;
      opt.innerText = cat.role_name;
      cat_dropdown.appendChild(opt);
    });
  }
  else {
    cat_dropdown.innerHTML = '<option value="" Select>error connecting</option>';
    throw new Error("Failed to retrieve category");
  }
}
async function check_session() {
  try {
    const sesRes = await fetch("https://fastapi-app-production-9d4a.up.railway.app/session", { credentials: 'include', method: 'GET' })
      .then(ses => {
        if (!ses.ok) {
          const errText = ses.detail;
          throw new Error(errText);
        }
        return ses.json()
      }).then(session => {
        if (!session.success) {
          document.getElementById("login-modal-page").classList.remove("hidden");
          document.getElementById("loader").classList.add("hidden");
          console.log("no result found");
        }
        else if (session.success) {
          window.location.href = "hub.html";
        }
      })
  }
  catch (_) {
    document.getElementById("login-modal-page").classList.remove("hidden");
    document.getElementById("loader").classList.add("hidden");
    console.log("Failed to connect to server. Please try again later.")
  }
}
loadCategories();
check_session();