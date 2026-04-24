document.getElementById("signup-form").addEventListener("submit", async (e) => {
    
    e.preventDefault();
    // get elements
    const userName = document.getElementById("signupName");
    const email = document.getElementById("signupEmail");
    const pw = document.getElementById("signupPassword");
    const roles = document.getElementById("signupRole");
    /** @type {HTMLButtonElement | null} */
    const btn = document.getElementById("signup-btn");
    // Validation for pw

    // send data to backend
    const data =
    {
        "username": userName.value,
        "email": email.value,
        "password": pw.value,
        "role": roles.value
    }
    try {
        const res = await fetch("http://localhost:8000/signup",
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
            throw new Error(errText || "Signup failed");
        }

        const result = await res.json((data)=>{
            // returned results

        })
    }
    catch(err)
    {
        console.assert("Failed to connect to server. Please try again later.");
    }
})