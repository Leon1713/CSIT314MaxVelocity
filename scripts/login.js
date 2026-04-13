document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
    }
    const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
     if (res.ok) {
        const result = await res.json();
        console.log(result);
    }
})