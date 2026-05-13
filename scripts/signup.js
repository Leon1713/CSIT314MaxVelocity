const errors =
{
    "name": document.getElementById("name-error"),
    "email": document.getElementById("email-error"),
    "password": document.getElementById("password-error"),
    "phone": document.getElementById("phone-error"),
    "username": document.getElementById("username-error")
}

Object.values(errors).forEach(el => {
    el.classList.add("hidden");
})
const errorEl = () => document.getElementById('signup-error');

function validatePassword(password) {

    if (!password.trim()) {
        return {
            type: "PASSWORD_ERROR",
            msg: "Password cannot be empty."
        };
    }

    if (password.length < 6) {
        return {
            type: "PASSWORD_ERROR",
            msg: "Password must be at least 6 characters long"
        };
    }

    if (!/[A-Z]/.test(password)) {
        return {
            type: "PASSWORD_ERROR",
            msg: "Password must contain at least one uppercase letter"
        };
    }

    if (!/[0-9]/.test(password)) {
        return {
            type: "PASSWORD_ERROR",
            msg: "Password must contain at least one number"
        };
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return {
            type: "PASSWORD_ERROR",
            msg: "Password must contain at least one special character"
        };
    }

    return null; // valid password
}

function showError(msg) {
    // Hide all inline field errors so only one message shows at a time
    Object.values(errors).forEach(el => el.classList.add("hidden"));
    const errDiv = errors["password"];
    const errText = document.querySelector("#" + errDiv.id + " .error-text");
    errText.innerText = msg;
    errDiv.classList.remove("hidden");
}

function clearError() {
    const el = errorEl();
    el.textContent = '';
    el.classList.add('hidden');
}



document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    document.getElementById("sign-in-text").classList.add("hidden");
    document.getElementById("login-loader").classList.remove("hidden");

    const firstName = document.getElementById("signupFirstName");
    const lastName = document.getElementById("signupLastName");
    const userName = document.getElementById("username");
    const email = document.getElementById("signupEmail");
    const phone_no = document.getElementById("signupPhone");
    const pw = document.getElementById("signupPassword");
    const repeatPw = document.getElementById("signupRepeatPassword");
    const roles = document.getElementById("signupRole");
    const btn = document.getElementById("signup-btn");

    Object.values(errors).forEach(el => {
        el.classList.add("hidden");
    })

    const fieldMap =
    {
        signupFirstName: "name",
        signupEmail: "email",
        signupPassword: "password",
        signupRepeatPassword: "password",
        signupPhone: "phone",
        username: "username"
    }
    // validate input not empty except last name
    inputs = [firstName, userName, email, phone_no, pw, repeatPw];
    valid = true;
    for (let i = 0; i < inputs.length; ++i) {
        let tempInput = inputs[i];
        if (!(tempInput.value.trim())) {
            // highlight red border
            tempInput.classList.add("input-error-border");
            let errorDiv = errors[fieldMap[tempInput.id]];
            let errortext = document.querySelector("#" + errors[fieldMap[tempInput.id]].id + " .error-text");
            let subject = tempInput.placeholder;
            if (!(tempInput == repeatPw)) {
                errortext.innerText = subject + " cannot be empty.";
                errorDiv.classList.remove("hidden");
            }
            valid = false;
        }
        else {
            tempInput.classList.remove("input-error-border");

        }
    }

    validPw = validatePassword(pw.value.trim())
    if (validPw != null) {
        const error = errors[fieldMap[pw.id]];
        error.classList.remove("hidden");
        text = document.querySelector("#" + error.id + " .error-text");
        text.innerText = validPw.msg;
        pw.classList.add("input-error-border");
        valid = false;
    }
    else {
        const error = errors[fieldMap[pw.id]];
        error.classList.add("hidden");
        pw.classList.remove("input-error-border");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const emailValue = email.value.trim();
    if (emailValue && !emailRegex.test(emailValue)) {
        const error = errors[fieldMap[email.id]];
        error.classList.remove("hidden");
        text = document.querySelector("#" + error.id + " .error-text");
        email.classList.add("input-error-border")
        text.innerText = "Please enter a valid email.";
        valid = false;
    }

    if (pw.value.trim() !== repeatPw.value.trim()) {
        const error = errors[fieldMap[pw.id]];
        error.classList.remove("hidden");
        text = document.querySelector("#" + error.id + " .error-text");
        text.innerText = "Password must be the same.";
        repeatPw.classList.add("input-error-border");
        valid = false;
    }

    if (!valid) {
        document.getElementById("sign-in-text").classList.remove("hidden");
        document.getElementById("login-loader").classList.add("hidden");
        return;
    }
    btn.disabled = true;

    try {
        const res = await fetch("https://fastapi-app-production-9d4a.up.railway.app/signup", {
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
                    if (data.detail[0].type && data.detail[0].type == "PASSWORD_ERROR") {
                        msg = data.detail[0].type.msg;
                    }
                    else {
                        msg = "All fields are required.";
                    }
                } else if (typeof data.detail === 'object') {
                    msg = data.detail.msg || msg;
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
        document.getElementById("sign-in-text").classList.remove("hidden");
        document.getElementById("login-loader").classList.add("hidden");
        btn.disabled = false;
    }
});
