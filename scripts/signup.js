document.getElementById("signup-form").addEventListener("submit", async (e) => {
    
    e.preventDefault();
    // get elements
    const firstName = document.getElementById("signupFirstName");
    const lastName = document.getElementById("signupLastName");
    const userName = document.getElementById("username");
    const email = document.getElementById("signupEmail");
    const phone_no = document.getElementById("signupPhone");
    const pw = document.getElementById("signupPassword");
    const roles = document.getElementById("signupRole");
    const modalEl = document.getElementById("errorModal");
    const modalMsg = document.getElementById("errorModalMessage");
    const modal = new bootstrap.Modal(modalEl);

    const repeatPw = document.getElementById("signupRepeatPassword");
    /** @type {HTMLButtonElement | null} */
    const btn = document.getElementById("signup-btn");
    // Validation for pw

    if(pw.value != repeatPw.value)
    {
        modalMsg.innerText = "Password do not match inputted password";
        modal.show();
        return;
    }
    // send data to backend
    const data =
    {
        "first_name" : firstName.value,
        "last_name" : lastName.value,
        "username": userName.value,
        "email": email.value,
        "password": pw.value,
        "role": roles.value,
        "phone" : phone_no.value,

    }
    try {
        const res = await fetch("http://127.0.0.1:8000/signup",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
            
        )
        if (!res.ok) {
            const errText = await res.text();
            console.log(errText || "Signup failed");
        }

        const result = await res.json((data)=>{
            console.log(result);
        })
        if(result.success)
        {
            console.log("Sign up success");
        }
    }
    catch(err)
    {
        console.assert("Failed to connect to server. Please try again later.");
    }
})