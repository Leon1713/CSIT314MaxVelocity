async function getSession() {
    try {
        const res = await fetch('http://127.0.0.1:8000/hub', {
            method: 'GET',
            credentials: 'include'
        });

        if (!res.ok) throw new Error('Session check failed');

        const data = await res.json();

        if (!data.success) {
            window.location.href = 'login.html';
            return;
        }
    }
    catch (err) {
        window.location.href = 'login.html';
    }
}
getSession()