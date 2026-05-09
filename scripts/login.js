// check if login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailEl = document.getElementById("loginEmail");
  const passwordEl = document.getElementById("loginPassword");
  const btn = document.getElementById("login-btn-id");
  const modalEl = document.getElementById("errorModal");
  const modalMsg = document.getElementById("errorModalMessage");
  const roleInput = document.getElementById("loginRole");
  const modal = new bootstrap.Modal(modalEl);

  const data = {
    email: emailEl.value,
    password: passwordEl.value,
    role: roleInput.value
  };

  // UI: disable button
  btn.disabled = true;
  btn.classList.add("login-btn-fetching");
  document.getElementById("login-modal-page").classList.add("hidden");
  document.getElementById("loader").classList.remove("hidden");

  try {
    const res = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Login failed");
    }

    const result = await res.json().then(data => {
      if (data.error) {
        modalMsg.innerText = data.error;
        modal.show();
      }
      else if (data.message != "Login Successful") {
        modalMsg.innerText = data.message;
        modal.show();
      }
      else if (data.success == true) {
        console.log("Logged in");
        window.location.href = "hub.html";
      }
    });

  } catch (err) {
    modalMsg.innerText = "Failed to connect to server. Please try again later.";
    modal.show();
  } finally {
    // UI: always restore button
    btn.disabled = false;
    btn.classList.remove("login-btn-fetching");
    document.getElementById("login-modal-page").classList.remove("hidden");
    document.getElementById("loader").classList.add("hidden");
  }
});