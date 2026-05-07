async function start() {
  try {
    res = await fetch("http://127.0.0.1:8000/session", { // send session cookie to backend
      method: "GET",
      credentials: "include"
    })
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText);
    }
    const result = await res.json().then(data => {
      if(!data.success)
      {
        //document.getElementById("login-page").classList.remove("hidden");
        window.location.href = "login.html";
        console.log("no result found");
      }
      else if(data.success)
      {
        switch(data.role_id)
        {
          case 1:
            window.location.href ="admin_dashboard.html";
            
        }
        console.log(data);
      }
    })
  }
  catch (err) {
    console.log("Failed to connect to server. Please try again later.")
    window.location.href = "login.html";
  }
}
start();