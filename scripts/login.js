document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailEl = document.getElementById("loginEmail");
  const passwordEl = document.getElementById("loginPassword");
  const btn = document.getElementById("login-btn-id");
  const modalEl = document.getElementById("errorModal");
  const modalMsg = document.getElementById("errorModalMessage");

  const modal = new bootstrap.Modal(modalEl);

  const data = {
    email: emailEl.value,
    password: passwordEl.value
  };

  // UI: disable button
  btn.disabled = true;
  btn.classList.add("login-btn-fetching");

  try {
    const res = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Login failed");
    }

    const result = await res.json().then(data =>
    {
      if (data.error) {
        modalMsg.innerText = data.error;
        modal.show();
      }
      else if(data.message != "Login Successful") {
        modalMsg.innerText = data.message;
        modal.show();
      }
    });

  } catch (err) {
    modalMsg.innerText = "Failed to connect to server. Please try again later.";
    modal.show();
  } finally {
    // UI: always restore button
    btn.disabled = false;
    btn.classList.remove("login-btn-fetching");
  }
});