const errorEl = () => document.getElementById('signup-error');

function showError(msg) {
    const el = errorEl();
    el.textContent = msg;
    el.classList.remove('hidden');
}

function clearError() {
    const el = errorEl();
    el.textContent = '';
    el.classList.add('hidden');
}

document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const firstName = document.getElementById("signupFirstName");
    const lastName = document.getElementById("signupLastName");
    const userName = document.getElementById("username");
    const email = document.getElementById("signupEmail");
    const phone_no = document.getElementById("signupPhone");
    const pw = document.getElementById("signupPassword");
    const repeatPw = document.getElementById("signupRepeatPassword");
    const roles = document.getElementById("signupRole");
    const btn = document.getElementById("signup-btn");

    if (pw.value !== repeatPw.value) {
        showError("Passwords do not match.");
        return;
    }

    btn.disabled = true;

    try {
        const res = await fetch("http://127.0.0.1:8000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                first_name: firstName.value,
                last_name: lastName.value,
                username: userName.value,
                email: email.value,
                password: pw.value,
                role: roles.value,
                phone: phone_no.value,
            })
        });

        const data = await res.json();

        if (!res.ok) {
            let msg = "Signup failed. Please try again.";
            if (data.detail) {
                if (Array.isArray(data.detail)) {
                    // Pydantic validation error — strip "Value error, " prefix FastAPI adds
                    msg = (data.detail[0]?.msg || msg).replace(/^Value error,\s*/i, '');
                } else {
                    msg = data.detail;
                }
            }
            showError(msg);
            return;
        }

        window.location.href = "login.html";

    } catch (err) {
        showError("Could not connect to the server. Please try again later.");
    } finally {
        btn.disabled = false;
    }
});
